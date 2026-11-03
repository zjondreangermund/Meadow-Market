# Meadow Market — premium 3D character and animal concepts (v1)
**Status:** Art-direction draft and production brief. NOT imported meshes, playable animation upgrades, or a verified WebGL render. Gameplay and existing save remain unchanged.

## Goal
Replace the toy/clay appearance with a **believable, polished 3D game**: natural anatomy, recognisable human faces, cloth, stitched leather, metallic buckles, realistic horse muscles, detailed fur/hide and readable animal markings. The game is intentionally friendly and welcoming, **semi-realistic PBR** rather than photorealistic humans. Avoid spheres/capsules as finished characters, low-poly hard edges, plastic/glossy skin, generic interchangeable faces and painted-on garments.

Existing technical baseline: Three.js 0.170, skeleton-based CC0 Quaternius male/female farmer GLBs, horse/cow glTF, pig FBX; the racing jockey currently loads a related humanoid but its mounted body and silhouette need refinement. Files: `dist/farmer-rig.js`, `dist/jockey.js`, `dist/animal-assets.js`, `dist/race-scene.js`, `dist/stable.js`. Their rigs are a good integration baseline, **not** the requested quality level.

## Human character family: same people on farm and track
One consistent face and body **identity** per character, with two clothing modes. The jockey must look like the farm player (same face, head/eyes/skin/hair proportions, hand scale, body stature) wearing an athletic jockey kit — not an unrelated, small toy rider. Rig once, swap clothing/helmet/hair/boots; apply a dedicated racing pose. The existing fictional named recruitable jockeys can use the same rig and art style even if they are different individuals.

| Concept | Farm outfit | Race-day outfit | Silks identity |
|---|---|---|---|
| A — Fieldhand | dark indigo denim, sand-coloured rolled sleeves, distressed brown boots, working gloves | cream helmet, fitted tan riding pants, dark leather boots | teal with cream chevrons |
| B — Stable expert | russet canvas jacket, olive trousers, braided/tied hair, practical horse-grooming gloves | matching safety vest, sleek helmet, fitted boots | burgundy with gold diagonal sash |
| C — Ranch manager | charcoal work shirt, green utility vest, weathered khaki trousers | tailored full-body jockey kit, goggles and lightweight gloves | cobalt with twin white hoops |
| D — Pro jockeys | optional same human base mesh with distinct face, hair and fitted body proportions | racing equipment of the same PBR quality | emerald diamonds, amber stripes, violet stars, or contrasting quartered panels |

**Character sheet shots:** front / profile / back A-pose with realistic hands and feet; head close-up; farmer walking with bucket; matching rider standing; matching rider mounted in racing crouch. Capture every look in daylight *and* stable interior lighting. Avoid exaggerated heads, invisible fingers, disconnected floating tools and incorrect grip.

## Animals: individual visual identities
All **animal individuals** get a persistent `appearanceSeed` and coat pattern descriptor from their immutable animal ID; their coat does not re-randomize on every page load, and offspring should have new seed values. No two animals in the same nearby pen/stable should look identical when valid combinations exist. Variations may share realistic coat colours, but visible white blazes, socks, spots, patches, mane colour, horn shape and tail patterns differ; don't make every animal rainbow-coloured. A horse's coat must not influence speed, power or race fairness.

**Horses**: bay with tiny forehead star; bright chestnut with face stripe and two socks; black with no white; buckskin with black legs; skewbald/piebald; grey dapple, liver chestnut and dark bay variants as population expands. Each has unique mane/tail length and direction, individually mapped white markings, a real muzzle and sculpted joints, leg tendons and moving ears. Normal maps and PBR hair detail; leather halter/tack must fit the same horse as the animation skeleton.

**Cattle**: black/white irregular Holstein patches, Hereford reddish brown with white face, dark charcoal or pale grey Brahman-inspired coat, solid cream; breed silhouette, udders/horns if applicable, small natural marks. **Pigs**: pink with sparse bristles and ear marks; ginger/red-brown with flecks; black with white belt; spotted cream-black; ear, snout and tail changes. **Chickens**: buff, red-brown, white-black barred and speckled, with wing feathers, combs and realistic leg movement. Do not reuse exactly identical markings within a small visible group.

**Asset standards**: retain separate animals and animation mixers. No motionless props masquerading as living animals. Build GLB meshes with embedded/relative texture paths, individual texture masks/material variants and proper skeleton/skin weights. Target efficient texture atlases; normal + roughness + albedo; no excessive emissive light or over-bright clay colours.

## 3D animation bible
| Character | Minimum clips / behaviour |
|---|---|
| Farmer | idle breathing, walk, jog/run, accelerate/stop, 90°/180° turn, reach, pick up/place, carry, water, feed, plant/harvest, groom horse, lead horse, open/close gate, enter stable |
| Horse | ears/tail micro-movement, blinking, breathing, idle weight shift, walk, trot, canter, gallop, eat, drink, groom reaction, turn, rear only if safe, led-on-halter, race-gate break, finish-line run-through and cooldown |
| Cow/pig/chicken | species-specific idle, walk, turn, eat/drink, head look, rest, react/avoid, species-specific sounds if approved |
| Jockey | walk/lead horse, mount, settle saddle, warm-up circle, start gate, contact/reins, gallop-linked rising/forward racing crouch, turn and bank, photo finish, cooldown/dismount |

**Engineering:** skinned GLB rigs in Three.js, named clips, AnimationMixer crossfades, movement matched to root/ground speed (avoid skating), 2-bone IK for hands/reins/foot in stirrup, foot grounding where needed, synchronized horse/jockey stride phase. Race footage should be **3D animated geometry**, not billboard cards, 2D sprites or baked slideshow frames. Preserve deterministic winner logic in `dist/race-engine.js` — visual animation must follow simulation, never determine results.

## Walk-in stable staging
Player walks through an open doorway into the existing navigable aisle. Roof cutaway never hides player or horse. Each real stall has a horse with visible breathing/ears/standing animations and individual ID/coat, swing or sliding gate, feed and water, a click-to-act prompt, approach positions clear of fences, and horse-follow/lead to training pitch. From the stable, a trained horse is the **same persistent horse** in warm-up and race. In the paddock: visible shadows, hoof contact, dust and correctly attached lead rope.

## Quality/technical gates — don't mark complete until observed
1. Concept approval: human head/face and body match across farmer/rider scenes; distinct animal markings in front/side views.
2. Content: approved licence and source formats for every new 3D model, texture, animation (do not import premium marketplace files without purchase/rights). Preserve `dist/models/CREDITS.txt`.
3. Rigging: no mesh distortion/invalid joints; animations interpolate without pop; horse head/tail/legs move naturally; hands actually hold reins and farm equipment.
4. Animation: no sliding feet, no floating equipment, no horse/jockey intersection; steering/bank and finish-line run-through on race day.
5. Game integration: unique, persistent animal coats; farm->stable->warm-up->race retains same horse and rider appearance; gameplay, touch pinch, instant action menu and save key `meadow-cycle-v2` unchanged.
6. Visual QA: screenshot/video on a WebGL-capable Android device + desktop, verify character face, shadows, LOD, textures, clip timing and stable visibility. Unit tests alone do not prove art quality.
7. Performance targets to validate (not measured): aim at 30 fps on modest Android hardware; 2K max hero body atlas (1K mobile where appropriate); LODs for crowds/animals; compressed textures, draw-call budgeting and graceful quality settings.

## Recommended development sequence
**Phase 1:** turntable concepts + unique coats + same-person farmer/jockey identity. **Phase 2:** properly licensed/sourceable rigged PBR GLBs; retarget existing walking/working/racing animations. **Phase 3:** visible stable and paddock behaviours, close-up interactive tasks. **Phase 4:** full race-day cinematic workflow with matched horses/jockeys, warm-up parade, horse through finish line, camera orbit and verified mobile performance.

This is an **original art brief**. References to other farming/racing games describe quality expectations, not reuse of protected art, names or code.
