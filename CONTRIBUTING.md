# Contributing

Open an issue describing one explanation question, audience, variables and source references. For bugs, include scene ID, browser/device, expected behavior, actual behavior and steps to reproduce. Never include API keys or private data in screenshots/logs.

For a new template, add metadata in `templates/catalog.mjs`, a deterministic scene builder in `packages/scenes`, a real rendered cover and appropriate invariants in `evals`. Record simplifications and distinguish geometry from physical simulation. Keep playback, progress and text synchronized. Test pause mid-transformation, resume, seek backwards, replay, completion, hidden tabs and narrow screens.

Run `npm run check`. Include actual validation evidence and untested environments in the PR. Do not add fake testimonials, awards, unsupported compatibility claims or screenshots of unavailable behavior.

When updating shared runtime resources, run `node scripts/sync-skill.mjs <authored-skill-directory>` and review the changed Skill starter copy. Keep host-specific installation outside the core scene contract.
