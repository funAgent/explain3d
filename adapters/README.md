# Host adapters

The core Skill is standard SKILL.md + references/scripts/assets. It does not require an MCP server. Hosts provide file access, execution and preview. A model name alone does not supply those capabilities.

| Host | Install/use | Evidence |
| --- | --- | --- |
| Codex CLI | `.agents/skills/create-spatial-explainer` | Package validated; templates created in current Codex environment |
| ChatGPT Work | Custom Skill mechanism in the selected host | Current user's Skill saved separately; capabilities depend on surface |
| Claude Code | `.claude/skills/create-spatial-explainer`, invoke slash command | Documented adapter, independent reproduction pending |
| WorkBuddy | Import local Skill folder/package through Skill management | Documented adapter, independent reproduction pending |
| DeepSeek | Paste prompts into an executable Agent host using DeepSeek | Prompt mode; independent reproduction pending |

Official references checked 2026-10-24:

- https://learn.chatgpt.com/docs/customization/overview
- https://code.claude.com/docs/en/skills
- https://www.workbuddy.cn/docs/workbuddy/From-Beginner-to-Expert-Guide/Function-Description/Skills-Market
- https://api-docs.deepseek.com/guides/tool_calls/

Do not publish a host as “verified” without running an existing and a new scene in that host and recording versions, conditions, outputs and failures. Do not package one host-specific manifest as a universal plugin. The first release provides a portable Skill; a dedicated MCP service can be added later if a real server capability is needed.
