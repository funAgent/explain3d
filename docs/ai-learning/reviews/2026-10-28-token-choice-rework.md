# Token choice rework candidate — 2026-10-28

Status: **implementation draft; NOT visually accepted, merged or published**. Base production/main: `0a3781278936c57f63de88dd9ab207fd1605dd2f`. All four published scenes retain `needs-rework`. This candidate is one step in token-choice rework, not a claim of Anatomy-level completion.

## Implemented changes

- Probability values no longer remain above the old bar positions while the rectangles move. From the probability chapter onward, candidate name and probability share one ordered identity lane. A color-matched line starts at that candidate's current front-face center/bottom and ends just above its identity. This remains meaningful for very narrow intervals.
- A pure geometry sampler owns the probability front faces, numeric-label positions, connectors and focus. The callout anchor follows a continuous point inside the moving blue face; it no longer switches between two anchor formulas at morph=.5.
- The interval band gains a shallow supporting edge; its actual widths remain probability-proportional. Extrusion shrinks with narrow interval width so depth does not overwhelm a tiny probability. These are drafted refinements, not browser-observed craft evidence.
- Narrow layout is recomposed to a 390-unit view rather than compressing 560 units; active value type remains 18 units and supporting type 16. Extra vertical drawing space is reserved. Initial settings may require vertical scrolling: the real 390px fit, active type size, viewport-height behavior and playing layout still require browser measurement. Do not infer legibility merely from declared font size.
- Narration now names the same-color correspondence and the height-to-width encoding. The interpretation is a change of representation, not probability changing during the morph.

## Checks actually run

`npm run check` passed, including existing independent mathematical golden values, all four AI scene tests, 721 planetary constraints and the site build. Added geometry invariants examine 3,620 poses: desktop/narrow, T=.4/.8/1/1.6/2, normal/reduced motion, 181 times between27s and36s per combination. They check disjoint front faces, values below every face, connector ownership, focus containment/continuity, exact final CDF positions and widths, and deterministic reverse seeking. Explicit default32s regression included.

These are numerical/geometric checks, **not browser screenshots, user study results or actual device evidence**. They do not certify font metrics, painted stacking, connector collisions, reduced-motion preference handling or UI lifecycle.

## Why the candidate remains a draft

The Browser plugin was discovered and its prescribed bootstrap attempted. It returned `Unknown tool(browser.js)`. No CUA browser surface was exposed in this run. The managed preview instructions prohibit improvising a shell browser. No preview server, screenshot or browser acceptance is claimed. This is an environment verification limitation, not a permission request.

Pending before merge:

1. Actually inspect defaultT=.8 at27,29,30,31,32,33,34,36s and the reverse sequence; repeatT=.4 and2, including smallsofa intervals. Inspect line routing, neighboring labels and pale-edge contrast.
2. Capture actual1× whole stage and meaningful4× detail with no substitute generated imagery. Check the added carrier, bevels, contacts, occlusion and ownership during movement.
3. Check390px viewport: read every active number and formula, measure effective CSS font size, verify no clipped axis maximum and inspect the scrolling tradeoff. Review desktop diagram size as well.
4. Exercise play/pause/resume/seek/replay/completion, temperature changes, keyboard, reduced-motion and hidden-tab behavior. Preserve the fixedu counterfactual T=.8→mat / T=2→floor and prediction check.
5. Continue causal refinements where needed: earlier temperature/exponent/normalization transitions are still phase-based. This candidate does not close the entire continuous-causality review.
6. Check protected branch preview; only after all applicable review gates pass, merge and verify matching production SHA/READY/domain.

No Skill distribution changed. Proven methods may be propagated after real visual verification through skill-creator, without overwriting unrelated personal Skill changes. No additional theme has started.
