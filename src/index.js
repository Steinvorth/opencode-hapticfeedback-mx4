const DEFAULT_SERVER_URL = "https://local.jmw.nz:41443";
const DEFAULT_TIMEOUT_MS = 1200;
const DEFAULT_COOLDOWN_MS = 700;

const EVENT_TO_WAVEFORM = {
  taskDone: "completed",
  requestError: "angry_alert",
  subagentInvoked: "knock",
  sessionCreated: "sharp_state_change",
  assistantCompleted: "happy_alert",
  sessionBusy: "damp_state_change",
  toastInfo: "subtle_collision",
  toastSuccess: "happy_alert",
  toastWarning: "square",
  toastError: "angry_alert",
};

function GetBooleanEnv(envName, fallbackValue) {
  const rawValue = process.env[envName];
  if (rawValue === undefined) {
    return fallbackValue;
  }

  const normalizedValue = rawValue.trim().toLowerCase();
  if (["1", "true", "yes", "on"].includes(normalizedValue)) {
    return true;
  }

  if (["0", "false", "no", "off"].includes(normalizedValue)) {
    return false;
  }

  return fallbackValue;
}

function GetIntegerEnv(envName, fallbackValue) {
  const rawValue = process.env[envName];
  if (!rawValue) {
    return fallbackValue;
  }

  const parsedValue = Number.parseInt(rawValue, 10);
  if (Number.isNaN(parsedValue)) {
    return fallbackValue;
  }

  return parsedValue;
}

function GetNormalizedBaseUrl() {
  const configuredUrl = process.env.MX4_HAPTICS_URL ?? DEFAULT_SERVER_URL;
  return configuredUrl.replace(/\/$/, "");
}

function HasToolError(output) {
  const metadata = output?.metadata ?? {};
  const hasErrorInMetadata = Boolean(metadata.error) || Boolean(metadata.failed);
  const hasErrorTitle = typeof output?.title === "string" && output.title.toLowerCase().includes("error");
  const hasErrorOutput =
    typeof output?.output === "string" &&
    (output.output.startsWith("Error:") || output.output.toLowerCase().includes("request failed"));

  return hasErrorInMetadata || hasErrorTitle || hasErrorOutput;
}

function CanTriggerSignal(signalName, cooldownMs, lastTriggeredAtBySignal) {
  const nowMs = Date.now();
  const lastTriggeredAt = lastTriggeredAtBySignal.get(signalName) ?? 0;
  if (nowMs - lastTriggeredAt < cooldownMs) {
    return false;
  }

  lastTriggeredAtBySignal.set(signalName, nowMs);
  return true;
}

async function TriggerWaveform(input) {
  const { baseUrl, timeoutMs, waveform, reason, client } = input;
  const endpoint = `${baseUrl}/haptic/${waveform}`;

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      body: "",
      signal: AbortSignal.timeout(timeoutMs),
    });

    if (!response.ok) {
      await client.app.log({
        body: {
          service: "mx-master-haptics-plugin",
          level: "warn",
          message: "Haptic endpoint returned non-200 response",
          extra: {
            reason,
            waveform,
            endpoint,
            status: response.status,
          },
        },
      });
    }
  } catch (error) {
    await client.app.log({
      body: {
        service: "mx-master-haptics-plugin",
        level: "warn",
        message: "Unable to send haptic request",
        extra: {
          reason,
          waveform,
          endpoint,
          error: String(error),
        },
      },
    });
  }
}

export const MxMasterHapticsPlugin = async ({ client }) => {
  const isEnabled = GetBooleanEnv("MX4_HAPTICS_ENABLED", true);
  const timeoutMs = GetIntegerEnv("MX4_HAPTICS_TIMEOUT_MS", DEFAULT_TIMEOUT_MS);
  const cooldownMs = GetIntegerEnv("MX4_HAPTICS_COOLDOWN_MS", DEFAULT_COOLDOWN_MS);
  const baseUrl = GetNormalizedBaseUrl();
  const lastTriggeredAtBySignal = new Map();
  const completedAssistantMessageIds = new Set();

  async function SendSignal(signalName) {
    if (!isEnabled) {
      return;
    }

    const waveform = EVENT_TO_WAVEFORM[signalName];
    if (!waveform) {
      return;
    }

    if (!CanTriggerSignal(signalName, cooldownMs, lastTriggeredAtBySignal)) {
      return;
    }

    await TriggerWaveform({
      baseUrl,
      timeoutMs,
      waveform,
      reason: signalName,
      client,
    });
  }

  return {
    event: async ({ event }) => {
      if (event.type === "session.created") {
        await SendSignal("sessionCreated");
        return;
      }

      if (event.type === "session.idle") {
        await SendSignal("taskDone");
        return;
      }

      if (event.type === "session.error") {
        await SendSignal("requestError");
        return;
      }

      if (event.type === "session.status" && event.properties.status.type === "busy") {
        await SendSignal("sessionBusy");
        return;
      }

      if (event.type === "message.updated") {
        const messageInfo = event.properties.info;
        if (messageInfo.role !== "assistant") {
          return;
        }

        const isCompleted = Boolean(messageInfo.time?.completed);
        if (!isCompleted || completedAssistantMessageIds.has(messageInfo.id)) {
          return;
        }

        completedAssistantMessageIds.add(messageInfo.id);
        await SendSignal("assistantCompleted");
        return;
      }

      if (event.type === "tui.toast.show") {
        if (event.properties.variant === "success") {
          await SendSignal("toastSuccess");
          return;
        }

        if (event.properties.variant === "warning") {
          await SendSignal("toastWarning");
          return;
        }

        if (event.properties.variant === "error") {
          await SendSignal("toastError");
          return;
        }

        await SendSignal("toastInfo");
      }
    },

    "tool.execute.before": async (input) => {
      if (input.tool === "task") {
        await SendSignal("subagentInvoked");
      }
    },

    "tool.execute.after": async (input, output) => {
      if (input.tool === "task") {
        return;
      }

      if (HasToolError(output)) {
        await SendSignal("requestError");
      }
    },
  };
};

export default MxMasterHapticsPlugin;
