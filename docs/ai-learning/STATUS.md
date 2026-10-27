# AI principles course status

Updated: 2026-10-27 (Asia/Shanghai).

The user authorized ten scenes, an iteration every twelve hours, independent learner-oriented review and publication after acceptance. A recurring task has been created. Each scheduled run works on one scene; failure keeps that scene active rather than counting it as complete.

## Published lesson 05: scores to one Token

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

Seven scenes are planned, not implemented or advertised as playable. See `roadmap.json` for topics, learning outcomes and current source status. The existing experimental autoregression and roulette pages are not silently promoted to accepted lessons.

Real learner sessions, physical phones, screen-reader devices and independent browser-engine coverage have not been completed. These limits do not prevent releasing a clearly labeled teaching sample, but they must not be represented as tested.

## Published lesson 01: tokenization (2 / 10 total)

Route /learn/tokenization/. A 46-second fixed-rule character-level BPE teaching model shows input, base symbols, ranked adjacent merges, boundaries, vocabulary IDs and reversible decoding. Five supported English words and four rule versions are explicit; not a production tokenizer, no Chinese/space/byte-level support. Golden splits and IDs, span conservation, rule no-op, all version/time samples and decode round trips pass. Desktop and390×844 visual/quiz checks completed. The new inputunhug predicts two tokens and verifies[8,9]. This is developer teaching review, not measured learning gains. Published at https://explain.funagent.app/learn/tokenization/ . PR #2 head a5ce351fa1b6f9b7a28732d4aeb0655c1c30155a passed CI run40380762972 and a READY preview; preview HTML and app module returned200 with the slider fix. Merge sourcebb9c7d9eb0840a688bf3ef6e8f45471aa2c4e1f5 deployed READY asdpl_8jU8UL9yGByo1v3dQEPqpeBT8fUF. Production browser confirmed rules0→[2,6,1,5], rules3→[9,5], and quiz→unhug→[8,9]. Next: embedding.


## Reviewed candidate lesson 02: Embedding

Route `/learn/embedding/`. One question: how an integer ID retrieves one row from a fixed parameter table. A four-row, two-dimensional authored example connects indexing, unchanged row copy, equal-scale coordinates and a controlled cat/car/dog comparison. Same ID is an address, not a semantic magnitude. Pausing restores configuration; one routed annotation avoids the table and negative-coordinate labels. Independent numerical/seek tests and desktop/narrow-width browser checks passed; reduced-motion manual toggle and controlled hidden-event path were exercised. This is teaching review, not learner-effect research. Production release is pending the branch CI/preview and main READY checks. Next after release: Attention.
