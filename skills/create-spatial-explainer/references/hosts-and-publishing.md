# Hosts and publishing

- **Codex CLI:** copy the skill folder to `.agents/skills/` within the project. In ChatGPT/Work use the host's custom-Skill mechanism; tool availability varies. Do not claim all ChatGPT chats execute web projects.
- **Claude Code:** project skills can live in `.claude/skills/`. Invoke by name or `/create-spatial-explainer`. Confirm actual discovery before claiming installed.
- **WorkBuddy:** import a local skill folder/package according to the installed version. Do not claim an independent reproduction until actually run.
- **DeepSeek:** provide the portable prompt to an Agent host able to create files, execute code and preview. A model does not execute its own tool calls.

Read current official host documentation if installation behavior matters. Bundled instructions are adapters, not certifications of every environment.

For Git + Vercel: verify repository, team, project, branch and environment. `npm run check` must run as part of the production build so failed model tests fail the deployment. Use native Git integration for branch previews and production updates. Inspect a real deployment status and custom-domain result. Preserve production rollback history. Never put credentials in files, logs, prompts or process arguments.

For an existing Sites project: preserve project identity and audience; use its source/publish workflow. Never move a private owner's link into a public showcase as the only demo. Public templates should be hosted from reviewed public source.
