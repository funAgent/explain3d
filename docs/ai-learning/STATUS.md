# AI principles course status

Updated: 2026-10-29 (Asia/Shanghai).

Current total: **4 / 10 published**. **Visual acceptance reopened for all four on 2026-10-28 after user feedback.** Token-choice follow-up has passed developer visual/teaching review and its checked release is verified in production; the other three remain open. Next rework: **Attention**. New topics, including Transformer, are on hold until the four-scene rework queue passes the updated review gates.

See [Anatomy comparison and concrete findings](reviews/2026-10-28-anatomy-quality.md). Rework order: token-choice → attention → tokenization → embedding. Keep existing routes and mathematical/release evidence. Publication status does not mean the renewed visual gate has passed. The initial comparison changed no website implementation or distributed Skill. The token-choice repair was subsequently released; the draft paragraph below is historical and superseded by its production receipt.

Historical “Next” statements below describe the release sequence at that time and are superseded by this active work item and roadmap.

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

Six scenes are planned, not implemented or advertised as playable. See `roadmap.json` for topics, learning outcomes and current source status. The existing experimental autoregression and roulette pages are not silently promoted to accepted lessons.

Real learner sessions, physical phones, screen-reader devices and independent browser-engine coverage have not been completed. These limits do not prevent releasing a clearly labeled teaching sample, but they must not be represented as tested.

## Published lesson 01: tokenization (2 / 10 total)

Route /learn/tokenization/. A 46-second fixed-rule character-level BPE teaching model shows input, base symbols, ranked adjacent merges, boundaries, vocabulary IDs and reversible decoding. Five supported English words and four rule versions are explicit; not a production tokenizer, no Chinese/space/byte-level support. Golden splits and IDs, span conservation, rule no-op, all version/time samples and decode round trips pass. Desktop and390×844 visual/quiz checks completed. The new inputunhug predicts two tokens and verifies[8,9]. This is developer teaching review, not measured learning gains. Published at https://explain.funagent.app/learn/tokenization/ . PR #2 head a5ce351fa1b6f9b7a28732d4aeb0655c1c30155a passed CI run40380762972 and a READY preview; preview HTML and app module returned200 with the slider fix. Merge sourcebb9c7d9eb0840a688bf3ef6e8f45471aa2c4e1f5 deployed READY asdpl_8jU8UL9yGByo1v3dQEPqpeBT8fUF. Production browser confirmed rules0→[2,6,1,5], rules3→[9,5], and quiz→unhug→[8,9]. Next: embedding.


## Published lesson 02: Embedding (3 / 10 total)

Route `/learn/embedding/`. One question: how an integer ID retrieves one row from a fixed parameter table. A four-row, two-dimensional authored example connects indexing, unchanged row copy, equal-scale coordinates and a controlled cat/car/dog comparison. Same ID is an address, not a semantic magnitude. Pausing restores configuration; one routed annotation avoids the table and negative-coordinate labels. Independent numerical/seek tests and desktop/narrow-width browser checks passed; reduced-motion manual toggle and controlled hidden-event path were exercised. This is teaching review, not learner-effect research. Published at https://explain.funagent.app/learn/embedding/ . PR #3 head 9b28b2ff7bf87d7025bd83dbea9f02e35e2af910 passed CI run 40464108178; READY preview dpl_2GDcHZ7FDhN5h2PUJUkAb5XCjTVu served the exact reviewed HTML/app/stage source. Merge 2420d77c370a0e888e64c0c13e87f923b5cefb9c reached production READY as dpl_6L6uGjakR9Mz1i7masoE4f19FEbb; main CI run 40464227142 passed. Production browser verified course 3/10, entry navigation, dog vector [1.8,1.2], distance .283/cosine .992, correct quiz feedback and return to the same diagram. Next: Attention.

## Published lesson 03: Attention — 2026-10-28

Single causal attention row at C: authored Q/K/V, scaled dot products, future mask, exponential normalization, weighted V and sum. Query direction changes output (4.248 / 10 / 15.752); masked future V leaves output invariant. Tests and actual desktop/narrow-browser teaching review passed as detailed in LESSON.md. Published at https://explain.funagent.app/learn/attention/ . PR #4 passed CI 40562980763 and READY preview dpl_8fpzGGqXyoq2sbd7jDRdFDc2k5hV; fetched preview HTML/app/stage matched reviewed source exactly. Merge 49086e255b9527202f467103d7d0353b81627632 reached production READY as dpl_H4cKbv114YSRUKfzEGFXcdUXfE9P. Production browser verified future V=1000 leaves output 15.752, query zero produces 10, and prediction feedback/return preserves that state. No new Skill or host-compatibility claim; uses the shared playback, annotation and evidence method. Next after acceptance: Transformer layer.

## Token-choice repair candidate — 2026-10-28

Draft branch `fix/token-choice-morph-craft-20261028` repairs moving-label ownership, makes the focus continuous, and drafts narrow-layout/carrier refinements. `npm run check` and3,620 geometric poses pass. Browser bootstrap returned Unknown tool; actual1×/4×/intermediate/390px visual and lifecycle acceptance remain pending. **No production update; visual acceptance remains needs-rework and token-choice stays active.** See [candidate evidence and exact pending checks](reviews/2026-10-28-token-choice-rework.md). Skill changes and new topics remain on hold.


## Reviewed token-choice follow-up — 2026-10-28

Browser returned; actual intermediate/reverse desktop frames,390px, native4× contact detail, natural completion/replay, keyboard, manual reduced-motion and controlled hidden-event paths reviewed. Fixed newly observed carrier/front intersection and narrow tick clipping as well as the original label defect. Exact operation rail and staged scales improve causal inspection. Full check passed. Review decision closes listed token-choice defects, without asserting measured learning gains or awards; the other three scenes and Skill distribution alignment remain open. See [full follow-up record](reviews/2026-10-28-token-choice-rework.md). Deployment receipt follows only after matching production SHA/READY and route verification.


## Production follow-up receipt — 2026-10-28

PR #6 reviewed head `e6b74581f6a126e1d0fca9e3b72fa615407c35c2`: branch CI40676595210 success; READY preview `dpl_GqK2VrNBQNNF4WFbzUy1pKd3hJvm`. Authenticated preview HTML/app/model/stage/geometry/style responses returned200 and matched the reviewed source exactly. Preview HTTP evidence is distinct from same-source local browser actions.

Merged source `26defa3024d64af69f8a4da8f66e8d23287cb523` reached production READY as `dpl_2BqeL1ySywcQwDayqUr8CqyPzoeW`; main CI40676875334 succeeded. Actual public route https://explain.funagent.app/learn/token-choice/ loaded without sign-in. Production browser inspected default32s label ownership and completed the prediction check: correctfloor feedback and return-to-diagramT=2,u=.6219,floor27.6%. The stable result withdraws the ruler, avoiding result-card/tick occlusion. Course remains4/10; next quality rework isAttention, with new topics held until the other three are reviewed. Original publication receipts remain intact.


## Attention causal rework draft — 2026-10-29

Branch `rework/attention-causal-20261029`: persistent position rows, exact operation rail, mask trace and nonzero contribution movement implemented. npm run check and17,298 new pose cases passed. Preliminary desktop Softmax observation completed. This is **not released or visually accepted**: component formation/chapter continuity and the390px/4×/lifecycle matrix still need work. Continue this candidate rather than starting a new topic. [Exact evidence and remaining gates](reviews/2026-10-29-attention-rework.md). Production remains unchanged.


### Attention follow-up — 2026-10-29

Same PR7 now has separate Q/K component wells and merge paths, routed contribution markers, correctedK header, darker text and measured15.21px narrow type. Rounded displayed arithmetic uses≈. Full tests passed; selected desktop intermediate/reverse and390px observations completed. Still draft: chapter handoffs and full4×/lifecycle/playing-layout gates remain open. No production update.
