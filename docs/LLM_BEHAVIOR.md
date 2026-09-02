# LLM behavior

LIFE treats an LLM as an optional coach and librarian—not an autonomous operator.

## Authority model

1. Deterministic logging, course completion, and XP rules are always available offline.
2. In the browser edition, an LLM can suggest a goal plan, one recommendation, or one reflection question.
3. Suggestions do not write to persistent data by themselves. A person can edit, accept, or discard a goal plan before it is saved.
4. An LLM never deletes data, changes provider settings, spends money, assigns XP, or invokes an external tool.

## Data minimization

- Requests are user-triggered; this browser edition has no scheduled LLM jobs.
- Before a non-local provider is called, the app names the context that would leave the device and asks for confirmation. For a reflection question, that context is today's journal fields; for a recommendation, it is up to 12 highly rated titles; for goal planning, it is the typed goal.
- The browser edition can include up to 12 local high-rated titles in a recommendation when **Private suggestion context** is enabled. It does not yet implement semantic retrieval or a vector database.
- Imported descriptions, reviews, URLs, and course text are untrusted data, never instructions.
- API keys are held by the OS keychain in desktop builds; the browser prototype is for local experimentation only.

## Provider support

The UI supports local Ollama and OpenAI-compatible endpoints now. A desktop provider adapter can add Anthropic-compatible and llama.cpp HTTP servers behind one validated structured-output interface.

If a provider is missing, slow, unavailable, or returns invalid output, LIFE uses deterministic fallbacks and explains that no data was changed.
