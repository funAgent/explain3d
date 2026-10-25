# Validation record

2026-10-24, current managed Codex environment, Node 24.19.0. Core tests use only local vendored dependencies.

Automated checks:

- 10 unique templates, valid default/range metadata, five chapters, prompt and cover presence.
- 721 planetary poses: sun/planet/ring rolling constraints, fixed ring and 4:1 ratio.
- Monotonic clock: uneven elapsed time, pause/resume, hidden-time suspension, backward seek, completion/replay/reset.
- Independent slider rod-length identity and thin-lens equation.
- Softmax normalization/order and temperature concentration.
- Finite-buffer conveyor admitted/rejected accounting, conservation, capacity, determinism and bottleneck response.
- Scripted Agent retry; all nine new scenes sampled across parameter endpoints and time, finite bounds and backward-seek consistency.
- Skill frontmatter, local starter initialization and local import structure.

Browser checks are recorded after implementation. The available cloud browser has WebGL disabled and uses the shipped CPU renderer. No claim is made about real-phone GPU quality, orientation permission, sustained frame rate, Lighthouse or award recognition.

The finite geometry checks do not prove a CAD design or electromagnetic simulation. Escapement timing is prescribed; motor speed is prescribed; eclipse sizes/distances compressed; Attention toy scores fixed; Agent events scripted. Source links and exact assumptions are shown with the templates.

## Browser result

Checked actual CPU-rendered pages in Chrome at desktop 1363×936 and iframe CSS viewports 390×844 / 375×667. Initial scene, play, minimal control, paused separated state, resume, completion/replay, reset, parameter and page flows were exercised. Repaired startup sizing race, presentation grid span/scroll positioning, small-screen transport overflow and right-panel formula overflow. Both tested phone transports end exactly within their first viewport; no horizontal page overflow. These CSS viewports are not physical mobile devices.

## Unseen-topic forward test

A fresh Codex task used the authored Skill with a cam/follower question, without the intended implementation or sibling project context. It created a new inline knife-edge radial cam, parameterized 8–20 mm lift, four motion phases, new geometry, specification and checks. Parent reran 130,013 constraint samples and actual-controller lifecycle harness successfully. Analytic closure was within floating-point precision and sampled polygon midpoint error below 0.001 mm. This is numerical evidence for the ideal model, not a manufacturing tolerance. Browser CSS, GPU, native accessibility and physical devices for that unseen scene remain untested. The result shows transfer within Codex, not proof of all-host compatibility.

## Public release check — 2026-10-25

The complete source tree was published at commit b1fac3a2897e60c893950b4674210aed1ef8d220. Its GitHub source update automatically triggered Vercel production deployment dpl_FFzNRa3WzfM2rXt5UvSotHjUPyoG, which reached READY and assigned explain.funagent.app. This is an observed Git-to-production deployment, not only a workflow configuration.

A fresh anonymous Git clone ran npm run check successfully and initialized a slider-crank explainer from the public Skill. Structural/local-import checks passed. The public website was opened in the connected Chrome browser: the scene reported WebGL, with no application console errors at the start of verification. Guided playback and configuration hiding were checked on the public deployment. This adds a browser WebGL check; physical phones, orientation, sustained performance and other Agent hosts remain untested.
