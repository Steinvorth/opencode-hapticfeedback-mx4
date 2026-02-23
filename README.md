# opencode-hapticfeedback-mx4

OpenCode plugin for Logitech MX Master 4 haptic feedback. It maps OpenCode lifecycle events to haptic waveforms through HapticWebPlugin.

## Quick Start

1. Install Bun (required by OpenCode plugin runtime in this project).
2. Connect Logitech MX Master 4.
3. Ensure Logi Options+ and Logi Plugin Service are running.
4. Install HapticWebPlugin:
   - https://haptics.jmw.nz/install
   - or releases: https://github.com/fallstop/HapticWebPlugin/releases
5. Restart OpenCode in this repository.

OpenCode auto-loads project plugins from `.opencode/plugins/`, so no extra plugin entry is required.

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
