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


## Follow-up 2026-10-30 — reviewed candidate, release verification pending

This section supersedes the earlier draft's pending craft/lifecycle items. Source changes remain on PR7 until the checked preview is inspected. No production release is claimed by this review alone.

### Causal and craft corrections

- Exact output carriers now move from the previous output column to the next input column during the first18% of chapters2–5. Identity, color, row and underlying value do not change; the next arithmetic operation waits for arrival. Moving displayed numbers are not interpolated into invented probabilities.
- Q/K products enter a shared merge/divide path; the computed score travels to its owning row, and future rows do not expose scores before their turn. Close inspection found a2-unit gap under a component well; its connector now starts at the well boundary. The formula has its own clearance below the merge endpoint.
- Softmax first collects raw exponential weights into one denominator. Only then does each row trace its fraction on the same0..100% ruler; its result number appears at completion. A traced bar is a teaching pointer, not a changing distribution or measured execution latency. The pending handoff heading no longer exposes the denominator result early. Narration and accessible operation description follow the same pose.
- V has a dashed original-length outline and a coloredpV portion on the same0..20 scale as the result. Nonzero contributions leave explicit ports on the row face and travel outside the data rows. A zeroV or maskedD does not emit a flight. Cumulative addition exposes exact operands, not merely a final total.
- Carrying plates now have separate front, side, bottom and contact-shadow surfaces. Quantitative lengths stay frontal and unskewed. Active outlines, component wells, common-denominator inputs, bar ticks and actual source/receiver connections provide functional detail rather than decorative parts. This is a mathematical exhibit, not a fictitious mechanical attention device or physical naked-eye stereo display.
- Key mobile SVG type has an18-unit floor and darker identity-hue ink; bubble body is14px. Displayed rounded quantities use≈, including the query, denominator and output. Internal calculations remain full precision. Corrected an old Embedding meta description on the Attention page.

### Actual browser evidence

Current cloud Chrome, desktop1363×936 and a390×844 iframe, same built source. The iframe is a real narrow browser layout, not a physical phone test. Native4× is CSS zoom of the vector-rendered1200×1000 iframe; screenshots are not enlarged rasters. QA controls and a repeatable output-port focus are saved in evals/browser/attention-review.html (not a public product route).

| Evidence | Observed |
| --- | --- |
| [1× denominator](assets/2026-10-30/softmax-final.jpg) | Four colored inputs, summation bus, shared partial denominator, waiting row result slots; completed results are not all shown at chapter entry. |
| [4× component merge](assets/2026-10-30/qk-4x-final.jpg) | Both component paths meet the merge; boundary contact and formula clearance visible. |
| [4× output port](assets/2026-10-30/b-port-4x.jpg) | B's source port contacts its front face; side/bottom/shadow relationships remain coherent; the route stays outside other row data. |
| [390px handoff23.7s](assets/2026-10-30/handoff-final.jpg) | Each carried masked score retains its own row/color; no percentages or next result labels are assigned to other objects. |
| [390px weightedV38s, future1000](assets/2026-10-30/value-final.jpg) | DashedV and filledpV share a ruler; long future input remains readable; only nonzero visible-position contributions travel. |
| [390px playing](assets/2026-10-30/playing-final.jpg) | Header, one bubble, full mathematical stage, bounds label and transport fit in844px. Configuration/footer have eased out; pause restores them. Initial configuration view can scroll. |

Browser DOM checks covered31 forward frames at0,7,8.2,8.6,8.9,14.95,15,15.7,16.5,20,22.95,23,23.7,24.5,25.5,26.5,28,30.95,31,31.8,32.8,34,36,38,39.95,40,40.7,42,44,47,48s. All SVG text stayed within its horizontal viewport. Smallest SVG type across that matrix was15.178 CSSpx; the final38s long-input frame measured the same. This is not a general proof against all font/device collisions. Twelve selected intermediate/end frames were replayed in reverse; DOM geometry attributes, text, colors and path coordinates matched their forward snapshots exactly. [Raw browser record](assets/2026-10-30/dom-checks.json). The saved matrix preceded final wording/port-only corrections; final affected23.7s/38s and4× port frames were rechecked after those corrections.

Actual UI actions checked: Space on play, Escape pause, pause/continue, Home/End on timeline, reset, end→replay, natural47→48 completion and configuration return, info-open pause, manual reduced-motion toggle and immediate endpoints, query±/zero, future0/1000, incorrect/correct quiz feedback and verify-in-diagram return. Controlled document.hidden visibilitychange paused at1.05s and visible restoration did not auto-resume. The cloud surfaces kept document.visibilityState=visible when interacting with another tab, so OS/browser background scheduling is NOT independently verified; only the actual browser handler with a controlled hidden event is evidenced. Manual reduced motion was tested, not a device OS preference toggle.

### Source and numerical review

Official PyTorch2.14 source/algorithm revisited2026-10-30: scale1/sqrt(d), add causal−∞ bias before softmax, then weightedV; dropout omitted explicitly. Existing independent goldens still match outputs15.752103826,10,4.247896174, with futureV invariance. npm run check passes:17,298 pose cases, raw/stable normalization agreement, dot-product reconstruction, cumulative sums, no masked/zero flight, exact path endpoints/segments, reverse seeking, exact handoff ownership and additional post-arrival/end-boundary checks. All existing scene/mechanical tests retained; no claim that every mechanical UI was re-exercised.

### Teaching review decision

The input, question and changing output are explicit; the visible operation connects corresponding components, excludes a future row, divides by one denominator and combinesV contributions. The learner can pause each stage, predict the query-zero case, operate it, and inspect why the visible three-way mean is10 rather than20 or257.5. Query reversal changes the relative weights/output; changing only futureV leaves them invariant. The display distinguishes score from probability, attention mixture from token sampling, K fromV, percentage from output units, and annotation trace from actual model timing.

Developer teaching/craft review closes the concrete reopened Attention findings for this candidate. It does not establish Anatomy equivalence, an award-level score or measured learning gains. No real learner study, physical phone, alternate browser engine or screen-reader-device study has been performed. Skill distribution alignment and untested hosts remain pending. Tokenization and Embedding reviews remain open. Release only after the exact preview head/checks and production SHA/READY/domain flow are verified; preserve original receipts.


## Production receipt and open follow-up — 2026-10-30

PR7 reviewed head3ab1eee888ca24bb0317966f02825eea447bfbdf passed CI40937326795 and READY preview dpl_9NB7fs7BDLKzKak8FbteeE8vKxpQ. Six preview files (HTML/app/model/stage/pose/style) matched the reviewed source exactly. Actual preview UI inspected23.7s/25.5s/38s, futureV1000 and quiz→query-zero return. Mergec558a4c90d8352ab61111698d83f8bde970ab8c6 passed main CI40937804579 and reached production READY asdpl_DAtHS2JLY7Fbbcc3qFbp5QcXsjJz. Public https://explain.funagent.app/learn/attention/ and course entry loaded. Production confirmed futureV1000 leaves15.752, query reversal gives4.248, and the prediction check returns query-zero output10. App/stage/pose/style production bytes matched reviewed source. The public route and matching READY source were rechecked later on2026-10-30. Original publication receipts remain intact; course stays4/10.

Post-release inspection found a remaining teaching wording defect: phase5 at maskedD says read D'sV, although its weight/contribution are0 and no contribution flight occurs. PR8 head df231169d685629e22fb11bcf1cf472f6b1d44c2 changes only narration/rail headings to explicitly say excluded/zero contribution. Local npm run check and actual D-frame UI passed; branch CI40938518358 and previewdpl_CgEseoYSwoEgMP2iURKkyycr26it are successful/READY. Its two changed modules returned200 and matched the candidate. **PR8 has NOT merged or deployed; exact protected-preview D-frame UI is still unchecked.** Do not treat the production release as final renewed acceptance or advance to Tokenization yet.

Automatic approval rejected PR8 merge because its exact-preview D-frame prerequisite was incomplete. The normal preview redirected toward Vercel's account origin, whose browser access was denied. The official temporary-share helper was also rejected because creating/reusing a bearer URL could expose the unpublished protected preview beyond the deployment authorization. No protection settings, alternate deployment, raw browser access or indirect main write is used to bypass these denials. The only outstanding access decision is explicit permission to create a23-hour preview share link solely for PR8 verification (or an independently authorized authenticated preview inspection). The task remains on Attention; new themes stay held. Documentation receipts are independent of the unmerged code patch.

The existing quantitative,4×/390px and teaching-review evidence above remains useful. The D-heading issue reopens final acceptance; physical phones, actual OS background scheduling, learner-effect studies and Skill distribution/host alignment remain unverified. No award or Anatomy-equivalence claim.
