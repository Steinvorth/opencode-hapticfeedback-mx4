# opencode-hapticfeedback-mx4

Public OpenCode plugin for Logitech MX Master 4 haptic feedback. It maps OpenCode lifecycle events to haptic waveforms through HapticWebPlugin.

## Install (Public Plugin)

Add this plugin to your OpenCode config:

```json
{
  "plugin": ["opencode-hapticfeedback-mx4@latest"]
}
```

Restart OpenCode.

Current release: `0.0.1`

Alternative install directly from GitHub:

```json
{
  "plugin": ["github:emi/opencode-hapticfeedback-mx4#v0.0.1"]
}
```

If you want to test before npm publish, use the local repo path in `plugin` instead.

## Quick Start

1. Connect Logitech MX Master 4.
2. Ensure Logi Options+ and Logi Plugin Service are running.
3. Install HapticWebPlugin:
   - https://haptics.jmw.nz/install
   - or releases: https://github.com/fallstop/HapticWebPlugin/releases
4. Restart OpenCode.

The haptics service should run at `https://local.jmw.nz:41443`.

## Verification

```bash
# Service health
curl https://local.jmw.nz:41443/

# Hardware pulse test
curl -X POST -d '' https://local.jmw.nz:41443/haptic/completed
```

## Event Mapping

| OpenCode Trigger | Waveform | Purpose |
| --- | --- | --- |
| `session.idle` | `completed` | Task completed |
| `session.error` | `angry_alert` | Session/request error |
| `tool.execute.before` for `task` | `knock` | Subagent invocation |
| `session.created` | `sharp_state_change` | New session start |
| `session.status` = `busy` | `damp_state_change` | Work started |
| `message.updated` (assistant completed) | `happy_alert` | Assistant response completed |
| `tui.toast.show` = `success` | `happy_alert` | Success toast |
| `tui.toast.show` = `warning` | `square` | Warning toast |
| `tui.toast.show` = `error` | `angry_alert` | Error toast |
| `tui.toast.show` = `info` | `subtle_collision` | Info toast |

## Configuration

Environment variables (optional):

- `MX4_HAPTICS_ENABLED` (`true`/`false`, default `true`)
- `MX4_HAPTICS_URL` (default `https://local.jmw.nz:41443`)
- `MX4_HAPTICS_TIMEOUT_MS` (default `1200`)
- `MX4_HAPTICS_COOLDOWN_MS` (default `700`)

## Notes

- The plugin sends non-blocking HTTP POST calls to `/haptic/{waveform}` with an empty body.
- If the local haptics service is unavailable, OpenCode continues running and logs warnings via `client.app.log`.
