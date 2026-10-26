# AGENTS.md

Rules for any AI assistant working on this project: v0, Cursor, Claude, ChatGPT, Copilot, Codex, Gemini or anything else.
Work here is often continued by a different chatbot or account, so the project keeps its own memory in `HANDOFF.md`.

## 1. When you start
1. Read `HANDOFF.md` before anything else. It is the source of truth for the goal, progress, decisions and next step.
2. Don't redo finished steps or re-research settled decisions. A quick check is enough (the file exists, the package is in package.json).
3. Continue from **Next step**.

## 2. While you work, keep HANDOFF.md current
Credits, context or time can run out without warning, and by then it's too late to write a handoff.
- Update `HANDOFF.md` after every milestone (a package installed, a file finished, a bug fixed), not only at the end.
- Change only what changed: tick items, rewrite **Next step**, add new decisions and pitfalls, update **Status**.
- Write for a reader with no chat history: exact commands, versions and file paths. Never "as discussed".
- No secrets (API keys, tokens, passwords).
- If you can't edit files (a plain chat), end each milestone reply with the full updated `HANDOFF.md` in one code block so the user can save it.

## 3. HANDOFF.md format
Keep these sections in this order:
- **Goal**: the user's request, in their words
- **Status**: % done, last updated (date and assistant)
- **Done**: checklist
- **Next step**: the single next action
- **Remaining**: checklist
- **Decisions**: stack, versions, design choices
- **Pitfalls**: what broke or must be avoided
- **Verify**: how to check the work

## This project
- pnpm, Next.js 16 App Router, Tailwind.
- The video is built with Remotion 4.0.539 in `remotion/`. Everything else is in `HANDOFF.md`.
