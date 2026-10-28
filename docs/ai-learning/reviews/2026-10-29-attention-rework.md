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
