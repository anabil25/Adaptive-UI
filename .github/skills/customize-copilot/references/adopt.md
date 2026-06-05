# Adopt Upstream Customizations

Use this when evaluating external Copilot customizations, especially from `github/awesome-copilot`. Prefer adopting the useful pattern into this repo's existing instruction/skill stack over importing broad upstream behavior verbatim.

## Useful Upstream Sources

| Upstream | Use |
|---|---|
| `skills/copilot-sdk` | Reference/adapt when implementing SDK app adapters |
| `instructions/copilot-sdk-nodejs.instructions.md` | Background reference; confirm APIs against installed SDK types |
| `instructions/agent-skills.instructions.md` | Strong source for skill-authoring rules |
| `skills/microsoft-skill-creator` | Adapt its investigate -> clarify -> generate -> validate workflow |
| `skills/suggest-awesome-github-copilot-skills` | Reference discovery/update workflow for future skill recommendations |
| `skills/mcp-security-audit` | Reference when reviewing MCP config/security |
| `skills/diagnose` | Reference pattern for AI-workflow audits |

## Avoid Vendoring Wholesale

- `ai-ready`: too broad for this repo; could overwrite mature local standards.
- `copilot-instructions-blueprint-generator`: useful historically, but our instruction stack is already more specific.
- generic testing/frontend/accessibility skills: our scoped instruction files already own those domains.
- plugins with hooks/MCP servers unless you explicitly want their full bundle and have reviewed them.

## Adopt Procedure

Preferred with GitHub CLI support:

```bash
gh skill preview github/awesome-copilot <skill-name>
gh skill install github/awesome-copilot <skill-name> --dir .github/skills
```

If vendoring manually:

```txt
github/awesome-copilot/skills/<skill-name>/ -> .github/skills/<skill-name>/
```

If you vendor a skill, copy the whole folder — not just `SKILL.md` — preserving references/scripts/templates/assets.

## Adapt Procedure

1. Read upstream `SKILL.md` and resources.
2. Identify which content is stable workflow knowledge versus version-specific API detail.
3. Remove generic content already owned by this repo's instruction files.
4. Add repo-specific routing and validation.
5. Preserve attribution/license where needed.
6. Smoke-test slash invocation, auto-load, and resource loading.

## SDK Adoption Rules

Before coding from upstream SDK material:
- inspect installed `@github/copilot-sdk` types;
- confirm `defineTool` signature;
- confirm event names;
- confirm session lifecycle and cleanup;
- confirm model listing method;
- confirm `mcpServers` config shape.

Keep stable concepts locally and use current API docs/types for exact signatures.

## Attribution

Awesome Copilot is MIT licensed. Preserve license notices for copied substantial content or full folders. For adapted excerpts, include source links in this reference file or commit notes.
