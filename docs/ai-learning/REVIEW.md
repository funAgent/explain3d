# AI learning scene acceptance

This is the review contract for the ten AI learning scenes. It is separate from the older mechanical template gallery. Review one bounded question at a time. Preserve the approved pale surfaces, fine strokes, restrained color, slight depth and single guided callout; choose each topic's graphical representation by its actual relationships.

## Required evidence before release

| Gate | Learner-facing question | Required evidence |
| --- | --- | --- |
| Purpose | Can a new reader identify the question, input and output? | A one-sentence outcome, visible example and a bounded starting point. |
| Causality | Can the learner see why the next step follows? | A timed sequence whose values, labels, arrows and geometry share one model state. |
| Mapping | What does length, color, position and motion mean? | Explicit units/scales; stable identity colors; no perspective distortion of quantitative dimensions. |
| Distinctions | What tempting wrong conclusion does the scene prevent? | Visible or readily inspectable simplifications: toy vs actual model, score vs probability, word vs token, retrieval vs truth, instructions vs execution. |
| Experiment | Can changing one thing produce a meaningful difference? | One counterfactual with controlled remaining variables and an independently checked result. |
| Transfer | Can the learner predict and explain a new case? | A short predict → operate → explain check, with causal feedback rather than an unexplained correct/incorrect marker. |
| Operation | Can the scene be inspected without losing the explanation? | Pause/resume, forward/backward seek, reset/replay/completion, parameter changes, focus restoration and hidden controls inert. |
| Accessibility | Can it be used on a narrow screen and with a keyboard? | Actual desktop and phone-width browser observations, legible formula/labels, meaningful control names and reduced-motion implementation. Note untested devices. |
| Truthfulness | What is actually established? | Official sources, model invariants, distinct automated/browser observations and clearly stated unverified learning outcomes. |

Do not publish a failed hard gate to meet a cadence. A twelve-hour cadence schedules an iteration; it does not certify twelve hours of uninterrupted execution or guarantee that each iteration will pass. If a scene needs another iteration, continue it before advancing. Never count a renamed visualization as a new concept.

## Release procedure

1. Read the latest main, roadmap, STATUS, relevant scene files and existing PR feedback; use an isolated branch.
2. Implement and fix observed problems. Reuse existing components where their semantics fit; no empty scaffold files solely to satisfy a checker.
3. Run `npm run check` and the subject's independent invariants. Record endpoints, backward seeking and representative counterfactuals.
4. Inspect the actual local or branch-preview UI at desktop and phone width; exercise affected controls. Keep useful evidence, not only a self-assigned score.
5. Merge only the reviewed head with successful relevant CI. The Vercel Git integration performs the production build. Check the resulting SHA and READY deployment, then the production route.
6. Update the scene's source/spec/lesson, catalog, roadmap and STATUS. Report only real release links and concise outcomes. Failed or pending deployments are not published.

Source and automatic deployment: `docs/RELEASING.md`. The public repository and existing hosting target are unchanged. Social posting is outside this authorization.

## Reusable skill boundary

The eventual general skill chooses a representation from the question and constrains model, timeline, annotations, experiment and verification. The ten scenes are examples produced by that method, not ten separate skills. Feed proven improvements back after scene acceptance; skill installation or cross-host compatibility must be verified separately.

## Learning evidence boundary

Developer review, mathematical tests and a self-check question establish an inspectable teaching design. They do not establish measured learning gains. Until actual learner sessions are conducted, describe educational suitability as a review judgment and record potential misconceptions. Never claim an award, universal fidelity or a completed user study.
