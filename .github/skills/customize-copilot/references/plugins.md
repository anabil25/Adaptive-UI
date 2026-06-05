# Plugins

Use this only if the user asks to package multiple customizations for reuse beyond this repo.

## When A Plugin Makes Sense

Create a plugin when you need to distribute a bundle such as:
- one or more skills;
- custom agents;
- hooks;
- MCP server config;
- slash commands or workflow packs.

Do not create a plugin for one repo-local skill unless there is a clear distribution need.

## Risks

Plugins can include hooks and MCP servers. That means installing a plugin may introduce executable shell commands or external tool access. Review before installing or recommending.

## Repo Strategy

For Adaptive-UI now:
- keep `customize-copilot` as a repo skill;
- avoid plugin packaging until there are at least several related customizations worth sharing together;
- if packaging later, keep this skill's name and references portable and avoid absolute local paths.
