# Agent instructions

Keep `docs/` short and human-readable. Put research, interview history, source mappings, and detailed plans in `.agents/context/`.

- Before changing behavior, read [requirements](docs/requirements.md). Use [the glossary](GLOSSARY.md) for domain terms.
- When implementing a ticket, read its [human summary](docs/tickets/README.md) and matching [detailed acceptance criteria](.agents/context/ticket-drafts/README.md). Preserve the approved dependencies.
- Before adding endpoints or models, read [the API contract](docs/api-contract.md) and [architecture](docs/architecture.md). Preserve accepted choices in [the ADRs](docs/adr/README.md).
- When more detail is needed, use [the context index](.agents/context/README.md). Read its baseline notes before adapting Assignment 7, source map before interpreting lectures, and submission notes before preparing diagrams or slides.
- Keep one decision per ADR, with Context, Decision, and Consequences. Use plain English and short paragraphs.
- Derive booking ownership from the authenticated user. Enforce owner/admin access on lists, reads, and writes.
- Keep credentials and live tokens out of Git, exports, and evidence.
- Verify implemented behavior using [the test checklist](docs/verification.md) and detailed context scenarios. Report only checks actually run.

## Implementation workflow

- Create a separate branch before editing each ticket; use `codex/<ticket-number>-<short-name>`.
- Commit throughout the work at small, meaningful checkpoints rather than saving the entire ticket for one commit.
- Use `<action>: <message>` commit messages, with actions such as `feat`, `fix`, `refactor`, `chore`, `docs`, and `test`.
- Write concise, readable code with only the abstractions needed for the requirements. Prefer straightforward implementations while preserving validation, security, and clarity.
