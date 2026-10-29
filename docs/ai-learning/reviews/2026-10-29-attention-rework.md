# Attention causal rework — draft, 2026-10-29

Base main e26b3eb205717ca62c20020cc1dd2c134662f680. Local source tree matched latest remote main6384c685ccd49157c861d4b8872e9e6ca5280fda before changes. No AGENTS.md or openIssue/PR found. Active topic from roadmap isAttention; token-choice already has a verified release and is not redone. No production changes in this iteration.

## Implemented candidate

Replaced the four compressed vertical cards with persistent position rows. A single exact operation rail traces the current position through Q·K/√2, raw exponential normalization and weighted V. A/B/C/D retain color and row identity. Shared0..100% bars compare normalized weights, and contribution lengths use a shared0..20 scale. The future row receives a progressing mask shutter; nonzero V contributions travel toward cumulative slots. These are teaching traces, not simulated compute latency or physical hardware. Zero contributions, including maskedD, never emit a contribution trace.

New independent lessonPose sampler derives products, raw exponential weights/denominator, mask progress and contribution travel from the existing sampled model. The mathematical model and counterfactual inputs are unchanged. The use of raw exponentials for the visible denominator is mathematically equivalent to the model's max-shifted stable computation; it is not a changed probability distribution.

## Executed checks

npm run check passed. New pose checks cover17,298 cases over3 query directions,3 futureV values, normal/reduced motion and961 times per combination. They verify exact dot-product reconstruction, raw/stable probability agreement, cumulative output, no masked contribution trace, finite bounded teaching progress and deterministic reverse seeking. Original independent Attention goldens and all other scene/mechanical checks retained.

Official source revisited: https://docs.pytorch.org/docs/2.14/generated/torch.nn.functional.scaled_dot_product_attention.html . The scaled dot product, causal mask before softmax and weightedV remain the source-grounded relationships.

Actual current cloud Chrome inspected the desktop initial layout and paused26s Softmax frame. The shared denominator4.086 and1/4.086=24.5% were visible in the operation rail, with the sameB row and its probability bar. This is a preliminary observation, not a complete visual acceptance. No new screenshots are represented as production evidence.

## Why NOT released

This is not yet the finish requested by the user. The operation rail and stable rows make numeric relationships easier to follow, but Q/K component formation is still shown mainly as a formula. Row content changes across chapters still need identity-preserving transitions rather than simple replacement. The narrow view reserves more height but has NOT been validated for actual font metrics, long values, one-screen playing behavior or collisions. Full4×/intermediate/reverse browser matrix and lifecycle/keyboard/hidden/reduced-motion/quiz tests have NOT been performed on this revision. The mask animation must also be reviewed so its progressive visual overlay is not mistaken for a gradually participating future token (the numerical mask is always exact).

Next work on THIS branch/PR: improve component-level causality and explicit contribution connectors; inspect390px and4×, source-correct mask semantics, intermediate/reverse frames, actual controls and fixed-query/future invariance. Only then close visualAcceptance, inspect the checked branch preview, merge and verify matching production READY/SHA/domain. Do not create a new scene or duplicate this candidate. Keep Attention needs-rework, all four public routes and historical publication receipts. Skill alignment is pending and no new installation/host compatibility is claimed. No learner study or measured learning gains.


## Follow-up: component multiplication and phone inspection

Continued existing PR7 from head8b6e041fc60b9ac9c09095a427ecf8b480efe92e; main unchanged. Added separate component wells forq₀k₀/q₁k₁, staged highlighting, exact product values, connected merge paths and a divide-by√2 readout. The single bubble names the currently matched position. Nonzero contribution markers now follow explicit orthogonal paths through the right margin instead of crossing unrelated rows diagonally. Mathematical lengths and values remain front-plane quantities; path animation is a teaching pointer.

Actual desktop7.2/8.2/8.6/9.0s and reverse8.2s frames inspected. Initial390×844 iframe measured component input at13.655px, below target; increased mobile input type16→17 units, shortened repeated narration and measured resulting17-unit type at15.213 CSS px (SVG scale .89487). Corrected a semantic header bug: the left QK column containsK, so it is now labeledK rather than dot product. Darkened identity-hue text while retaining original accent colors. Inspected narrow34s withfutureV=1000, then query zero; output/model changed from15.752 to10 with future still masked. This is partial browser coverage, not a physical phone or complete matrix.

Inspection also found misleading display arithmetic: rounded0.245×10 was printed with an equality to2.447, although internal full-precision arithmetic is correct. Changed rounded operation readouts to≈ and added a full-precision/display-rounding explanation. No values are rounded before model computation. The final wording change has source/build coverage; do not treat earlier screenshots as post-change browser proof.

npm run check passes, retaining17,298 pose cases, original goldens and mechanical tests. Added independent path sampling checks for endpoints, exact junctions and segment containment. Official PyTorch reference rechecked at its algorithm lines459–480: scaling, mask bias, softmax then weightedV; the scene omits dropout and projections explicitly.

Still NOT accepted or released: cross-chapter value handoffs are not yet continuous; full1×/4× craft, mask semantics, all phases/long values/mobile playing layout and lifecycle matrix remain to review. Stage height700px causes initial scrolling and must be judged against single-screen playing requirements. Avoid ending with another formula-heavy table merely because the equations pass. Continue this PR; preserve existing production and needs-rework status. No Skill sync or host-compatibility claim.
