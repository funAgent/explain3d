# AI principles course status

Updated: 2026-10-27 (Asia/Shanghai).

The user authorized ten scenes, an iteration every twelve hours, independent learner-oriented review and publication after acceptance. A recurring task has been created. Each scheduled run works on one scene; failure keeps that scene active rather than counting it as complete.

## Published 1 / 10: scores to one Token

- Course position: 05; first implemented/reviewed scene in this release sequence.
- Route: `/learn/token-choice/`; course index: `/learn/`.
- Visuals: original SVG mathematical objects; no wheel body reused. Preserves the previously approved fine-line/color direction.
- Model: four complete teaching candidates, fixed logits, temperature scaling, exponent weights, normalization, inverse-CDF sampling. No live LLM, tokenizer implementation or autoregressive continuation.
- Counterfactual: keep u ≈ 0.621868 fixed; T=.8 selects mat, T=2 selects floor. Original logits remain unchanged.
- Learning improvement: final-state prediction check asks which candidate is selected after the temperature change, explains the CDF boundaries and lets the learner verify the same case in the diagram.
- Independent model checks and full site checks: passed npm run check on 2026-10-26.
- Current desktop browser: course index entry, lesson route, final-state learning check, wrong/right feedback and return-to-diagram verified. The challenge returned T=2, u=.6219 and floor at 27.6%, matching the model. The same end-state check was opened and inspected in a 390×844 iframe; all four choices and explanatory text fit without clipping. Earlier playback evidence is retained in the scene LESSON.
- Publication verified: https://explain.funagent.app/learn/token-choice/ ; course index https://explain.funagent.app/learn/ .
- Release source: fc03f80a1953a82d7ad104fb90307bf5cb2d131a; PR #1 merged after successful branch CI and preview.
- Production deployment dpl_8KskYdCLpm2uudUGezEzk3RiFJyD reached READY for that source SHA. Main CI run 40281781432 succeeded.
- Production browser: both public routes loaded; learning check answered correctly and returned to T=2, u=.6219, floor27.6%, matching the independently tested model. No sign-in required on the custom domain.
- Next iteration after the current candidate is released: embedding. Continue the remaining nine scenes in roadmap dependency order; do not redo the released scene without a new issue.

## Remaining work

Nine scenes are planned, not implemented or advertised as playable. See `roadmap.json` for topics, learning outcomes and current source status. The existing experimental autoregression and roulette pages are not silently promoted to accepted lessons.

Real learner sessions, physical phones, screen-reader devices and independent browser-engine coverage have not been completed. These limits do not prevent releasing a clearly labeled teaching sample, but they must not be represented as tested.

## Reviewed release candidate: tokenization

Route /learn/tokenization/. A 46-second fixed-rule character-level BPE teaching model shows input, base symbols, ranked adjacent merges, boundaries, vocabulary IDs and reversible decoding. Five supported English words and four rule versions are explicit; not a production tokenizer, no Chinese/space/byte-level support. Golden splits and IDs, span conservation, rule no-op, all version/time samples and decode round trips pass. Desktop and390×844 visual/quiz checks completed. The new inputunhug predicts two tokens and verifies[8,9]. This is developer teaching review, not measured learning gains. Pending production deployment verification; do not count this candidate as published until READY and a production-route check.
