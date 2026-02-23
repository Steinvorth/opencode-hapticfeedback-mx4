# opencode-hapticfeedback-mx4

OpenCode plugin setup for Logitech MX Master 4 haptic feedback.

## What this adds

This repo now includes a local OpenCode plugin at `.opencode/plugins/MxMasterHapticsPlugin.js` that sends haptic requests to `HapticWebPlugin`.

It maps OpenCode lifecycle events to mouse haptic waveforms, including:

- task finished (`session.idle` -> `completed`)
- request/session errors (`session.error` + tool error detection -> `angry_alert`)
- subagent invocation (`tool.execute.before` for `task` -> `knock`)
- conversation lifecycle (`session.created`, `session.status`, `message.updated`, `tui.toast.show`)

## Prerequisites

1. Logitech MX Master 4
2. Logi Options+ installed
3. Logi Plugin Service running
4. Install HapticWebPlugin from:
   - https://haptics.jmw.nz/install
   - or releases: https://github.com/fallstop/HapticWebPlugin/releases

After install, verify the local service is reachable:

```bash
curl https://local.jmw.nz:41443/
curl -X POST -d '' https://local.jmw.nz:41443/haptic/completed
```

## OpenCode plugin behavior

OpenCode auto-loads project plugins from `.opencode/plugins/`, so no extra plugin entry is required.

Environment variables (optional):

- `MX4_HAPTICS_ENABLED` (`true`/`false`, default `true`)
- `MX4_HAPTICS_URL` (default `https://local.jmw.nz:41443`)
- `MX4_HAPTICS_TIMEOUT_MS` (default `1200`)
- `MX4_HAPTICS_COOLDOWN_MS` (default `700`)

## Notes

- The plugin uses HTTP POST calls to `/haptic/{waveform}` with an empty body.
- If the local haptic service is down, OpenCode keeps running; failures are logged through `client.app.log`.
