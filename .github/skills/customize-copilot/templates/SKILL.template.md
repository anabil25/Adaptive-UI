---
name: example-skill
description: "State what this skill does and when to use it. Include trigger words users will actually say. Keep it concise but specific."
argument-hint: "[goal or target]"
user-invocable: true
---

# Example Skill

One-sentence mission: what capability this skill gives the agent.

## When To Use

- User asks for ...
- User needs to ...
- Trigger phrases include: "...", "...", "...".

## Non-goals

- Do not ...
- Do not duplicate ...

## Workflow

1. Inspect relevant local context.
2. Choose the smallest correct action.
3. Use referenced resources only as needed.
4. Implement or report.
5. Validate.

## Gotchas

- **Key constraint.** Explain why it matters.
- **Another common failure.** Explain how to avoid it.

## References

- [reference-name.md](./references/reference-name.md)

## Validation

- [ ] Frontmatter is valid.
- [ ] Name matches folder.
- [ ] Description has what/when/keywords.
- [ ] Resources are referenced with relative links.
- [ ] Smoke-tested via slash or auto-load prompt.
