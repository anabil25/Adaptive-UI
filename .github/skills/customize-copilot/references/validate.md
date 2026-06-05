# Validate

Use this before declaring a Copilot customization complete or installing an external one.

## Structural Validation

For every skill:
- [ ] path is `.github/skills/<name>/SKILL.md` for repo skills;
- [ ] folder name matches `name` exactly;
- [ ] `name` is lowercase kebab-case, <=64 chars, no slash/colon/dot/namespace;
- [ ] YAML frontmatter parses;
- [ ] `description` says what it does, when to use it, and contains trigger keywords;
- [ ] any `argument-hint`, `user-invocable`, `disable-model-invocation`, `context` fields are intentional;
- [ ] every referenced `references/`, `scripts/`, `templates/`, or `assets/` file exists;
- [ ] resources use relative Markdown links from `SKILL.md`.

For instructions:
- [ ] `applyTo` globs are workspace-relative and match real files;
- [ ] file does not duplicate another domain's source of truth;
- [ ] description is discovery-friendly.

For prompts:
- [ ] one focused manual task;
- [ ] variables are documented;
- [ ] no broad always-on policy.

For agents:
- [ ] description explains when to invoke;
- [ ] tool permissions are minimal;
- [ ] handoffs/subagents are explicit;
- [ ] persona does not conflict with repo instructions.

For hooks:
- [ ] shell command is deterministic and scoped;
- [ ] timeout is set;
- [ ] no secrets printed;
- [ ] user approval/security risk is understood;
- [ ] input is sanitized.

For MCP:
- [ ] server/version is pinned where possible;
- [ ] toolsets are narrow;
- [ ] no hardcoded secrets in config;
- [ ] env vars use safe secret stores;
- [ ] local server commands are reviewed.

## Runtime Smoke Tests

- Slash invocation: type `/skill-name` and confirm it appears.
- Auto-load invocation: ask with trigger phrases from `description`; check references/diagnostics.
- Resource test: ask the skill to use a named reference/template; confirm the file is loaded.
- Instruction `applyTo`: open matching file and ask for an edit/review; confirm file-specific instructions appear in references.
- Debugging: use Chat Diagnostics / Agent Debug Logs if a customization does not load.

## Security Review Before Adopting Shared Skills

- Read `SKILL.md` and all referenced files.
- Inspect scripts, package manifests, network calls, and shell commands.
- Preserve license/attribution when copying MIT-licensed upstream content.
- Pin upstream skill revisions when reproducibility matters.
- Avoid broad plugins unless you reviewed included hooks/MCP servers.
- Never store credentials in skills, prompts, agents, hooks, or MCP config.

## Red Flags

- `name` does not match folder.
- Description is vague or missing trigger words.
- Hidden scripts or unreferenced resources.
- Broad terminal execution, broad database access, or `@latest` install commands.
- Hooks that run on every tool call without narrow filtering.
- MCP config with hardcoded tokens.
- Copied SDK examples that do not match installed package types.
- Customizations that duplicate or contradict the repo's scoped instruction files.

## Integrity Rule

Do not fake validation. If a skill does not load, fix path/frontmatter/description/resource links. Do not claim success from a file that was not invoked or seen in diagnostics.
