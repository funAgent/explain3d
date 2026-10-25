# Release operations

Repository: `funAgent/explain3d`. Production domain: `explain.funagent.app`. Hosting team: `team_CflwhIlUKiTX3GNd16fFyhFF` (existing funAgent account team). The exact project/deployment IDs and verified state are recorded in the release handoff after creation.

## Normal update

1. Create a branch and make the source change.
2. Run `npm run check` locally. GitHub Actions repeats it for PR/main.
3. Vercel Git integration creates a branch preview. Inspect the real preview and affected flows.
4. Merge the reviewed change to `main`. Vercel executes `npm run check`; a failing invariant stops that deployment before production aliasing.
5. Confirm the deployment's commit and READY status. Check the custom domain and the key flow.
6. Optionally create version tags/release notes manually after verification. No automatic repository-write release job is installed.

This project uses no Vercel tokens in GitHub Actions; deployment uses the native Git integration. GitHub Actions has contents: read only.

## Rollback

Use Vercel deployment history to select the last verified production deployment. A rollback can disable automatic alias assignment; restore promotion/auto-assignment deliberately after verifying the next good build. Prefer a revert PR for source consistency. Never delete historical releases to simulate a rollback.

## Scope

Automatic publication means Git events trigger checked website builds . It does not post to Xiaohongshu, WeChat or X. Social copy remains reviewable in `marketing/`.
