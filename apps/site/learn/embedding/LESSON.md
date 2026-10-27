# 编号怎样变成向量？

Core question: Given a fixed embedding parameter table E, which vector does Token ID i retrieve?

## Teaching sequence

1. Identify the input Token and its integer address. The default car / ID 1 intentionally contrasts with cat / ID 0.
2. Select exactly one row of the four-row, two-column table, with zero-based indexing.
3. Copy both components unchanged into the output. The original table row remains present: lookup does not consume it or multiply by the index.
4. Construct the vector on equal-scale coordinates. The path first places x₁, then x₂. This is a drawing aid, not a model's computational execution trace.
5. Compare endpoints and directions with fixed cat [2,1]. Car is distance 4, cosine −0.6; dog is distance √0.08 ≈0.283, cosine ≈0.992. ID proximity is not vector proximity.
6. Keep the same table and switch only input ID. Predict E[2], then verify it without changing the teaching table.

## Review from the learner's perspective

The input ID and output vector are visible before starting; a single bubble points at the current addressed row, copied row or plotted endpoint. Rows/words retain their colors. No wheel or mechanical metaphor is reused. Pausing restores configuration; a control never silently changes the table. The source boundary is on the stage and explained in the inspectable model dialog.

Potential misconception: hand-authored cat/dog coordinates look like measured semantic knowledge. Mitigation: always-visible teaching-table notice, explicit untrained data, unnamed axes and statements that distance does not guarantee semantic truth. The scene explains static token lookup, not contextual embeddings or sentence embeddings. It does not assert measured learning gains. The prediction check is a teaching review aid, not a learner study.

## Sources checked 2026-10-27

- PyTorch nn.Embedding official documentation: https://docs.pytorch.org/docs/stable/generated/torch.nn.Embedding.html — fixed dictionary lookup indexed by integers; weight shape (num_embeddings, embedding_dim). No padding/max_norm/training behaviors are simulated here.
- PyTorch word embeddings tutorial: https://docs.pytorch.org/tutorials/beginner/nlp/word_embeddings_tutorial.html — dense vector representation and cosine comparison. Numeric fixtures are original authored teaching values, not quotations or real model output.

## Validation record

Numerical/model checks include independent golden rows, invalid index rejection, unchanged source table after output mutation, golden distances/cosines, symmetry/self identity/positive scaling, and every 0.05-second sample forward and backward. Actual browser and deployment evidence will be recorded after inspection. Do not read candidate status as a production release.


### Browser observations (2026-10-27)

Environment: managed Chrome, desktop 1363×936; same browser with a 390×844 iframe viewport (not a physical phone). Browser actions used actual controls, not app-state injection.

- Full default playback: progressed through copying and coordinates to 44/44, play state false, configuration restored; end state car distance 4.000, cosine −0.600.
- Backward timeline 44→16, keyboard Home→0, next/back step controls, pause with Escape and resume were observed. Values/phase changed together, no accumulated future-state traces.
- ID switch at final state: dog [1.8,1.2], distance .283 and cosine .992; book [−1,−2], distance 4.243 and cosine −.800. Same table retained.
- Wrong quiz answer explained why ID multiplication is incorrect; correct answer and verify returned ID 2 and its unchanged vector in the diagram, with focus restored to the challenge trigger.
- Narrow-screen table, negative-coordinate labels, plot, formulas and dialog inspected. Initial defects: output caption touched last row, and annotation line crossed table/axis labels. Repaired by spacing output and routing the annotation through an empty side corridor; inspected again at desktop and narrow width.
- Reduced-motion manual toggle was exercised at t=13.1: copied row appeared at the stable destination immediately, with ordinary time/steps retained. OS preference initializes the same flag; actual OS preference switching not independently exercised.
- `evals/browser/embedding-lifecycle.html` dispatched controlled visibilitychange events on the real app document. Hidden event paused at ~.05s, restored configuration; visible event did not auto-play or jump time. Cloud-created tabs stayed visible to their document, so this is event-path testing, not a claim of observed OS tab suspension.
- CSS/inert: configuration left the accessibility tree during playback; focus remained on persistent pause. The stage and timeline continued to reflect one sampled state.

Remaining: no physical-phone, screen-reader-device, other-browser-engine or empirical learner study. No claim of proven learning gain, production model embeddings or autostereoscopic hardware. Branch-preview and production verification are recorded in the release log; candidate source alone is not publication.
