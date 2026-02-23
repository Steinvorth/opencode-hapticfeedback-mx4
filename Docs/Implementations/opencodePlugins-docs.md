# opencodePlugins - Implementation Docs

## Overview
- Goal: Add a reusable skill that makes the agent an expert in OpenCode plugin development.
- Scope: Skill content based only on `https://opencode.ai/docs/plugins/`, plus local skill wiring in this repository.

## What Was Built
- Feature 1: New `opencode-plugins` skill with explicit usage rules and workflow.
- Feature 2: Dedicated reference document containing extracted plugin documentation knowledge.

## Key Files & Structure
- `.opencode/skill/opencode-plugins/SKILL.md`: Skill metadata, trigger description, usage boundaries, and implementation workflow.
- `.opencode/skill/opencode-plugins/references/opencode-plugins-docs.md`: Source-grounded plugin knowledge extracted from the OpenCode Plugins docs page.

## How It Works
- Data flow: User requests plugin work -> skill loads -> skill directs all implementation decisions to the reference file -> plugin code is produced using only documented behavior.
- Important classes/modules: N/A (documentation skill only).
- External services/APIs: `https://opencode.ai/docs/plugins/`.

## Setup & Usage
- Prereqs: OpenCode skill loader and repository access.
- Run: Load the `opencode-plugins` skill and follow guidance in `SKILL.md`.

## Testing
- How to run tests: Manual validation by reading the created skill files and checking that all details map to the source docs page.

## Extensibility Notes
- Known extension points: Add new reference sections only when the source page adds new plugin features/events.
- Future improvements: Keep references in sync when official plugin docs are updated.

## Changelog (summary)
- Phase 1: Researched skill structure and loaded skill-creator guidance.
- Phase 2: Fetched and extracted OpenCode Plugins docs content.
- Phase 3: Implemented new skill and source-grounded reference files.
