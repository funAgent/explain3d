---
name: create-spatial-explainer
description: Build interactive real-time 3D explanations of mechanical principles, scientific processes, product structures and AI or system workflows. Use when asked for an explorable spatial explainer, exploded-view demo, ten-second principle animation, or to turn a static explanatory diagram into a runnable website with reusable source, synchronized playback and verified constraints.
---

# Create a spatial explainer

Turn one bounded explanation question into a runnable, inspectable website. Prioritize correct relationships, visible depth and useful interaction. Deliver working code and evidence, not a visual concept alone.

## Establish the scene

1. Infer the audience and one question from the request. Use sensible defaults for reversible choices. Preserve any existing project, brand and approved visual direction.
2. Write a scene specification with objects, relationships, inputs, units, valid ranges, computed outputs, source references and simplifications. Use `references/scene-spec.md`.
3. Choose a scene family: rigid mechanism, optics/geometry, product layers, weighted graph or discrete events. Avoid claiming a template can model every subject without new constraints.
4. Identify what needs verification. Fetch authoritative sources when the subject or platform behavior is uncertain. Do not invent data, physical fidelity, validation or awards.

## Start from runnable resources

Use `scripts/init_scene.py --template <id> --output <new-directory>` to copy a complete static starter and its local dependencies. The output directory must not already contain files. Available template IDs: planetary, slider-crank, escapement, smart-ring, motor, lens, eclipse, attention, agent, conveyor.

For example:

```bash
python <skill-directory>/scripts/init_scene.py --template slider-crank --output ./my-explainer
python3 -m http.server 8000 --directory ./my-explainer
```

Use the host's supported preview instead of launching a second server when one is managed. Follow the applicable website publishing workflow for existing Sites or repository-backed deployments.

Read `references/runtime-contract.md` before changing motion or controls. For a new topic, modify scene metadata, build actual geometry and implement its sampled constraints in a scene adapter. Reuse playback and presentation behavior. Never present a renamed existing mechanism as a new mechanism.

## Implement the explanation

- Use procedural geometry for exact shapes and relationships; use external assets only when they improve the actual subject. Keep licenses and attribution.
- Expose a small number of meaningful variables. Compute outputs from the same state used by geometry and text.
- Sample motion at absolute time. Keep play, pause, seek, replay, visibility suspension and completion consistent. Never add a fixed time step on each rendered frame.
- During guided playback, ease secondary configuration out, center the subject, and keep a minimal pause/exit control. Restore the interface on pause, exit and completion. Make hidden controls inert; maintain focus and Escape/Space behavior.
- Design a ten-second narrative with a clear beginning, meaningful transformation and stable result. Keep relevant explanations available before and after playback.
- Make depth readable through perspective, occlusion, materials, separation and motion. Offer drag-based inspection and a reset view. Do not claim ordinary screens provide hardware-free binocular autostereoscopy.
- Provide responsive layout, keyboard operation, accessible labels and reduced-motion behavior. Stop rendering offscreen or in a hidden tab. Provide an honest fallback if WebGL is unavailable.

## Verify and iterate

Read `references/quality-gates.md`. Run the starter checker, mathematical/constraint checks appropriate to the new scene, and the host-supported browser workflow. Exercise the entire lifecycle: initial state, play, pause mid-transformation, resume, backward seek, replay, completion, parameter changes and visibility changes.

Inspect real rendered output at desktop and phone sizes. Fix observed defects and retest affected behavior. Preserve failed-check evidence until repaired. Distinguish automated checks, browser checks, untested platforms and physical approximations. Do not turn aspirational design quality into a self-awarded certification.

For non-template topics, verify the new relationship separately; correct runtime behavior does not prove correct physics. For discrete processes, check conservation, event ordering and repeatable backward seeking.

## Deliver and publish

Deliver runnable source, run/build commands, scene specification, prompt, source/license notes and an accurate validation record. Summarize limitations in the language of the subject.

Honor explicit deployment and repository authorization. Use the existing repository and hosting integration where available. Run required checks before pushing. For automatic publishing, describe the actual trigger, checks, target, deployment status and rollback route; a workflow file alone is not proof that deployment succeeded. Use `references/hosts-and-publishing.md` for host adapters.

Keep social copy in a separate draft unless the user explicitly requests posting. Present claims based on actual shipped capability and verified environments.
