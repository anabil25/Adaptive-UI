# Telemetry

> Source section: [OpenTelemetry monitoring](https://docs.github.com/en/copilot/reference/copilot-cli-reference/cli-command-reference#opentelemetry-monitoring)

Use this for OpenTelemetry setup, trace/span structure, metrics, span events, resource attributes, and content capture.

---

## Activation

OpenTelemetry is off by default. It activates when any of these are set:

- `COPILOT_OTEL_ENABLED=true`
- `OTEL_EXPORTER_OTLP_ENDPOINT`
- `COPILOT_OTEL_FILE_EXPORTER_PATH`

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `COPILOT_OTEL_ENABLED` | `false` | Explicitly enable OTel. Not required if `OTEL_EXPORTER_OTLP_ENDPOINT` is set. |
| `OTEL_EXPORTER_OTLP_ENDPOINT` | none | OTLP endpoint URL. Automatically enables OTel. |
| `COPILOT_OTEL_EXPORTER_TYPE` | `otlp-http` | Exporter type: `otlp-http` or `file`. Auto-selects `file` when `COPILOT_OTEL_FILE_EXPORTER_PATH` is set. |
| `OTEL_SERVICE_NAME` | `github-copilot` | Service name in resource attributes. |
| `OTEL_RESOURCE_ATTRIBUTES` | none | Extra resource attributes as comma-separated key=value pairs. |
| `OTEL_INSTRUMENTATION_GENAI_CAPTURE_MESSAGE_CONTENT` | `false` | Capture full prompt and response content. |
| `OTEL_LOG_LEVEL` | none | OTel diagnostic log level: NONE, ERROR, WARN, INFO, DEBUG, VERBOSE, ALL. |
| `COPILOT_OTEL_FILE_EXPORTER_PATH` | none | Write all signals to this JSON-lines file. Automatically enables OTel. |
| `COPILOT_OTEL_SOURCE_NAME` | `github.copilot` | Instrumentation scope name for tracer and meter. |
| `OTEL_EXPORTER_OTLP_HEADERS` | none | Auth headers for the OTLP exporter. Example: `Authorization=Bearer token`. |

---

## Traces

The runtime emits a span tree for each agent interaction. Each tree contains an `invoke_agent` root span with `chat` and `execute_tool` child spans.

### `invoke_agent` Span Attributes

Wraps the entire agent invocation. Span kind: `CLIENT`.

| Attribute | Description |
|-----------|-------------|
| `gen_ai.operation.name` | `invoke_agent` |
| `gen_ai.provider.name` | Provider, e.g. github, anthropic |
| `gen_ai.agent.id` | Session identifier |
| `gen_ai.agent.name` | Agent name (subagents only) |
| `gen_ai.agent.description` | Agent description (subagents only) |
| `gen_ai.agent.version` | Runtime version |
| `gen_ai.conversation.id` | Session identifier |
| `gen_ai.request.model` | Requested model |
| `gen_ai.response.model` | Resolved model |
| `gen_ai.response.id` | Last response ID |
| `gen_ai.response.finish_reasons` | `["stop"]` or `["error"]` |
| `gen_ai.usage.input_tokens` | Total input tokens (all turns) |
| `gen_ai.usage.output_tokens` | Total output tokens (all turns) |
| `gen_ai.usage.cache_read.input_tokens` | Cached input tokens read |
| `gen_ai.usage.cache_creation.input_tokens` | Cached input tokens created |
| `github.copilot.turn_count` | Number of LLM round-trips |
| `github.copilot.cost` | Monetary cost |
| `github.copilot.aiu` | AI units consumed |
| `server.address` | Server hostname |
| `server.port` | Server port |
| `error.type` | Error class name (on error) |

### `chat` Span Attributes

One span per LLM request. Span kind: `CLIENT`.

| Attribute | Description |
|-----------|-------------|
| `gen_ai.operation.name` | `chat` |
| `gen_ai.provider.name` | Provider name |
| `gen_ai.request.model` | Requested model |
| `gen_ai.conversation.id` | Session identifier |
| `gen_ai.response.id` | Response ID |
| `gen_ai.response.model` | Resolved model |
| `gen_ai.response.finish_reasons` | Stop reasons |
| `gen_ai.usage.input_tokens` | Input tokens this turn |
| `gen_ai.usage.output_tokens` | Output tokens this turn |
| `gen_ai.usage.cache_read.input_tokens` | Cached tokens read |
| `gen_ai.usage.cache_creation.input_tokens` | Cached tokens created |
| `github.copilot.cost` | Turn cost |
| `github.copilot.aiu` | AI units consumed this turn |
| `github.copilot.server_duration` | Server-side duration |
| `github.copilot.initiator` | Request initiator |
| `github.copilot.turn_id` | Turn identifier |
| `github.copilot.interaction_id` | Interaction identifier |
| `server.address` | Server hostname |
| `server.port` | Server port |
| `error.type` | Error class name (on error) |

### `execute_tool` Span Attributes

One span per tool call. Span kind: `INTERNAL`.

| Attribute | Description |
|-----------|-------------|
| `gen_ai.operation.name` | `execute_tool` |
| `gen_ai.provider.name` | Provider name (when available) |
| `gen_ai.tool.name` | Tool name, e.g. `readFile` |
| `gen_ai.tool.type` | `function` |
| `gen_ai.tool.call.id` | Tool call identifier |
| `gen_ai.tool.description` | Tool description |
| `error.type` | Error class name (on error) |

---

## Metrics

### GenAI Convention Metrics

| Metric | Type | Unit | Description |
|--------|------|------|-------------|
| `gen_ai.client.operation.duration` | Histogram | s | LLM API call and agent invocation duration. |
| `gen_ai.client.token.usage` | Histogram | tokens | Token counts by type (input/output). |
| `gen_ai.client.operation.time_to_first_chunk` | Histogram | s | Time to receive first streaming chunk. |
| `gen_ai.client.operation.time_per_output_chunk` | Histogram | s | Inter-chunk latency after first chunk. |

### Vendor-Specific Metrics

| Metric | Type | Unit | Description |
|--------|------|------|-------------|
| `github.copilot.tool.call.count` | Counter | calls | Tool invocations by tool name and success. |
| `github.copilot.tool.call.duration` | Histogram | s | Tool latency by tool name. |
| `github.copilot.agent.turn.count` | Histogram | turns | LLM round-trips per agent invocation. |

---

## Span Events

| Event | Description | Attributes |
|-------|-------------|------------|
| `github.copilot.session.truncation` | Conversation history was truncated | `token_limit`, `pre_tokens`, `post_tokens`, `tokens_removed`, `messages_removed` |
| `github.copilot.session.compaction_start` | History compaction began | None |
| `github.copilot.session.compaction_complete` | History compaction completed | `success`, `pre_tokens`, `post_tokens`, `tokens_removed`, `messages_removed` |
| `github.copilot.skill.invoked` | A skill was invoked | `skill.name`, `skill.path`, `skill.plugin_name`, `skill.plugin_version` |
| `github.copilot.session.shutdown` | Session is shutting down | `shutdown_type`, `total_premium_requests`, `lines_added`, `lines_removed`, `files_modified_count` |
| `github.copilot.session.abort` | User cancelled the current operation | `abort_reason` |
| `exception` | Session error | `error_type`, `error_status_code`, `error_provider_call_id` |

---

## Resource Attributes

| Attribute | Value |
|-----------|-------|
| `service.name` | `github-copilot`, configurable with `OTEL_SERVICE_NAME`. |
| `service.version` | Runtime version. |

---

## Content Capture

By default, prompts, responses, and tool arguments are not captured. To capture full content, set:

```bash
OTEL_INSTRUMENTATION_GENAI_CAPTURE_MESSAGE_CONTENT=true
```

Content capture may include sensitive code, file contents, tool arguments, and user prompts. Enable only in trusted environments.

When enabled, these fields may be populated:

| Attribute | Description |
|-----------|-------------|
| `gen_ai.input.messages` | Full prompt messages as JSON. |
| `gen_ai.output.messages` | Full response messages as JSON. |
| `gen_ai.system_instructions` | System prompt content as JSON. |
| `gen_ai.tool.definitions` | Tool schemas as JSON. |
| `gen_ai.tool.call.arguments` | Tool input arguments. |
| `gen_ai.tool.call.result` | Tool output. |

---

## Further Reading

- [GitHub Copilot CLI](https://docs.github.com/en/copilot/how-tos/copilot-cli)
- [GitHub Copilot CLI Plugin Reference](https://docs.github.com/en/copilot/reference/copilot-cli-reference/cli-plugin-reference)
- [GitHub Copilot CLI Programmatic Reference](https://docs.github.com/en/copilot/reference/copilot-cli-reference/cli-programmatic-reference)
