# Primitives

## Prompt Files

Use a prompt file for one focused manual task that benefits from variables.

Good examples:
- generate a PR description;
- run a review checklist;
- create a one-off implementation plan template.

Avoid prompt files for broad coding standards or multi-step workflows with resources.

## Custom Agents

Use a custom agent when the key thing is a role/persona/tool policy:
- read-only reviewer;
- visual QA specialist;
- planning-only architect;
- implementation agent with restricted tools;
- handoff/subagent orchestration.

Do not use a custom agent when a skill's workflow knowledge is enough.

## Hooks

Use hooks when behavior must be deterministic:
- run a formatter after edits;
- block unsafe commands;
- run a validation command before completion;
- scan for secrets before committing.

Hooks are executable shell commands. Keep them narrow, fast, reviewed, and explicitly timed out.

## Rule Of Thumb

- Prompt: one manual task.
- Skill: reusable workflow knowledge.
- Agent: persona/tool mode.
- Hook: guaranteed lifecycle execution.
