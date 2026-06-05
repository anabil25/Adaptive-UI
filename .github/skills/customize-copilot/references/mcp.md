# MCP

MCP is the right primitive when Copilot or a Copilot SDK-hosted agent needs tools, APIs, databases, browser automation, or live external data.

## Use MCP For

- GitHub issues, PRs, repository actions.
- Browser automation or Playwright tools.
- Internal APIs and databases exposed through narrow tools.
- Documentation/search services.
- Data sources a Director needs to ground a UIPlan.

## Do Not Use MCP For

- Coding style rules.
- Reusable workflow instructions.
- A static prompt.
- App-local state that can be passed directly to `Responder`/`Director`.

## Security Rules

- Enable only required toolsets.
- Prefer read-only tools unless mutation is required.
- Pin package/server versions where possible.
- No hardcoded secrets in config.
- Use explicit env variables or secret stores.
- Treat local MCP commands as executable dependencies.
- Review remote MCP servers for trust, auth, and data exposure.

## Adaptive-UI Example

If the Director needs product analytics:
1. Expose a narrow MCP tool: `get_metric_series({ metric, range })`.
2. Make the tool return typed JSON.
3. Let the Copilot SDK adapter or provider adapter call that tool.
4. Parse returned data before creating a `UIPlan`.
5. Test with deterministic fakes.
