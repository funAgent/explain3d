# Runtime contract

The bundled static engine uses Three.js 0.170.0 and no external CDN. Keep its MIT license. The CPU renderer draws the same triangle meshes and projected lines; metallic environment reflection, shadows and transparency are approximations.

Each scene builder receives the imported `THREE` namespace and returns `{ group, update(t, parameter, exploded) }`.

- `group`: a Three.Group containing the subject. Keep the subject centered near the origin.
- `t`: absolute seconds, finite and nonnegative. `update` must be deterministic at any time, including after backward seek.
- `parameter`: actual declared units/range from scene metadata, not silently normalized.
- `exploded`: 0..1 for explanatory separation; the mechanical process may pause while parts separate.
- Dispose geometries/materials when replacing a scene. Do not create unbounded geometry in the animation loop.
- Store optional computed values in `group.userData.stats`. Show readable quantities and units in UI; do not dump raw state.

Edit `templates/catalog.mjs` for scene ID, title, question, parameter bounds, formula, simplifications, chapters, builder/module and references. New adapters belong in `scenes/`. Resolve imports locally.

`runtime/playback.mjs` is the shared monotonic clock. `runtime/viewer.mjs` controls UI and geometry. Use one sampled time for progress and model. Suspending a hidden tab must exclude hidden time. Preserve an assembled endpoint and do not let a paused exploded view snap back.

The bundled planetary geometry defines sun24/planet24/ring72 with a fixed ring. Its specific constraints are not generic to other mechanisms.

For significant new scenes, define a mathematical sampler independent of Three.js. Test it against identities or event accounting. Copying the player is insufficient evidence of generalization.
