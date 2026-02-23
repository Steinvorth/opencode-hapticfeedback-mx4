# opencodeHapticsMxMaster4 - Implementation Docs

## Overview
- Goal: Add tactile feedback from Logitech MX Master 4 to OpenCode workflow events so users can feel key execution states.
- Scope: Project-local OpenCode plugin implementation and setup documentation for HapticWebPlugin integration.

## What Was Built
- Feature 1: New local OpenCode plugin (`MxMasterHapticsPlugin`) that maps OpenCode events to HapticWebPlugin waveforms.
- Feature 2: Runtime safety controls (enable flag, timeout, cooldown, non-blocking failure handling).
- Feature 3: Setup and usage documentation in repository README.

## Key Files & Structure
- `.opencode/plugins/MxMasterHapticsPlugin.js`: Main plugin that listens to OpenCode events/hooks and sends haptic requests.
- `README.md`: Installation + verification guide for HapticWebPlugin and environment variable configuration.

## How It Works
- Data flow: OpenCode emits event/hook -> plugin maps signal to waveform -> plugin POSTs to `https://local.jmw.nz:41443/haptic/{waveform}` -> MX Master 4 plays haptic waveform.
- Important classes/modules: `MxMasterHapticsPlugin`, helper functions (`GetBooleanEnv`, `HasToolError`, `CanTriggerSignal`, `TriggerWaveform`).
- External services/APIs: HapticWebPlugin local HTTPS API from `https://github.com/fallstop/HapticWebPlugin` and Logi Actions haptics runtime.

## Setup & Usage
- Prereqs: MX Master 4, Logi Options+, HapticWebPlugin installed, OpenCode project plugin auto-loading enabled.
- Run: Start OpenCode in this repo, then trigger normal usage (tasks, subagents, errors) and feel mapped haptics.

## Testing
- How to run tests:
  - Manual API test: `curl https://local.jmw.nz:41443/`
  - Manual waveform test: `curl -X POST -d '' https://local.jmw.nz:41443/haptic/completed`
  - Manual behavior test in OpenCode: run a prompt with subagents/tools and verify haptics for completion, error, and subagent invocation.

## Extensibility Notes
- Known extension points: update `EVENT_TO_WAVEFORM` mapping for custom preferences; add additional OpenCode event types in the plugin `event` hook.
- Future improvements: optional WebSocket transport for lower latency and richer per-tool waveform mapping.

## Changelog (summary)
- Phase 1: Researched OpenCode plugin hooks and HapticWebPlugin API requirements.
- Phase 2: Implemented local haptics plugin with lifecycle + error + subagent triggers.
- Phase 3: Added setup docs and environment configuration guidance.
