# One query, a weighted mixture

Core question: how does the query at position C combine visible values? Follow authored Q/K/V → scaled dot products → future mask → Softmax → multiply V → sum. Q/K decide weights; V supplies content. The result includes every visible contribution, not just an argmax. D's future value never leaks into the result. Use symbolic positions to avoid falsely suggesting measured word semantics.

Counterfactuals: q toward A gives 4.247896; toward C gives 15.752104. q=0 gives 10. D's V can vary 0…1000 with no output change. Predict → operate → explain asks the zero-query case with D=1000; feedback explains the visible denominator and rejects max selection/four-way averaging.

Sources checked 2026-10-28: Attention Is All You Need §3.2 (https://arxiv.org/abs/1706.03762), and PyTorch official scaled_dot_product_attention documentation/source pseudocode (https://docs.pytorch.org/docs/2.14/generated/torch.nn.functional.scaled_dot_product_attention.html). One causal row is represented; d_k=2, d_v=1, no dropout or projections. Authored numbers are not trained embeddings, meaningful word relations or real model inference. Link flow is a teaching aid, not model execution timing. Attention weights are not a complete explanation of reasoning.

Numerical evidence: golden independent probabilities/output, normalization, future-value invariance, convex bounds, parameter boundaries and deterministic forward/reverse samples. Browser observations and deployment receipts remain pending. No measured learner study, physical phone, screen-reader-device or cross-engine claim.

## Browser teaching review — 2026-10-28

Managed Chrome desktop (1363×936) and 390×844 iframe viewport; not physical-phone testing. Initial input, contribution stage, Softmax exponent/denominator stage, mask stage and final result were inspected. Annotation targets were moved to empty margins to avoid crossing numeric rows; flow links stop before contribution labels. Stable identity colors remain across K/V, weights and output terms. The opening question/input and the output readout are identifiable without inspecting side panels. This is a developer teaching assessment, not measured learner evidence.

Observed: complete playback reached 48/48 and restored configuration. Backward seek 48→25→16 rebuilt earlier phases; resume/Escape pause, previous/next, Home/End, replay and reset were exercised. During playback configuration disappeared from the accessibility tree with focus on the persistent pause control. Reduced-motion toggle was enabled; t=31.1 displayed the stable full contribution bar. Query A produced 4.248; default C produced 15.752; changing future V to 1000 preserved output 15.752. The mobile quiz wrong/correct feedback and verify flow returned q=0, D=1000, output 10.000 and visible weights 1/3 each. Dialog fit in the narrow viewport.

`evals/browser/attention-lifecycle.html` tested the actual app's visibility handler using controlled document-hidden events: hidden paused at ~0.05s, configuration restored; visible did not auto-resume or jump. This is event-path testing, not actual OS hidden-tab observation. OS-level preference switching, physical devices, screen-reader devices and other engines remain untested. Full-site checks including mechanical invariants passed. Preview and actual production evidence will be recorded separately.


## Rework draft — 2026-10-29

See `docs/ai-learning/reviews/2026-10-29-attention-rework.md`. Exact operation/row pose tests passed; preliminary desktop observation only. Not visually accepted or published. Original publication evidence does not validate this new candidate.


Q/K component follow-up adds paired multiplication wells, explicit merge and routed contribution paths. Desktop7.2/8.2/8.6/9.0/reverse8.2 and selected390px inspection completed; narrow type measured15.21px after repair. Rounded arithmetic uses≈. Full release review remains pending; see the same rework record.


## Reopened craft review follow-up — 2026-10-30

Persistent mathematical rows now carry exact values between chapters; Q/K component multiplication, denominator collection, normalized fractions, same-scaleV/pV and cumulative contributions are inspectable in intermediate frames.18-unit narrow SVG type, explicit front-face ports and consistent carrier depth were checked with native4× and390px browser evidence. Full tests and affected UI lifecycle/quiz checks passed; see [review with actual images, raw DOM records and limits](../../../../docs/ai-learning/reviews/2026-10-29-attention-rework.md#follow-up-2026-10-30--reviewed-candidate-release-verification-pending). Controlled hidden-event handling is covered; real background scheduling, physical devices and measured learning gains are not. This entry is candidate acceptance, not yet a production receipt. Skill/host compatibility is not newly claimed.
