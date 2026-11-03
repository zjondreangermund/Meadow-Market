# Continuation handover — 2 November 2026

## Source baseline
This export contains the source recovered from the existing Sites source repository at commit `75b0c57ec8b92d197f0f9e112870d03c8f546b29`, and subsequently updated here with the improved farmer and walk-in horse stables. The recovery commit records the original baseline; the current repository contains those later changes.

Existing site URL: https://meadow-market-farm.zjondreangermund.chatgpt.site/
Existing project ID: appgprj_6ae8ab655a68819199e0e3433bd64eae
Keep the exact `.openai/hosting.json` identity for edits/deployments.

## User's latest separate chat
Title: “Update Farm Character and Stables”, 2 November 2026.
Explicit user request: “I WANT MY CHARACTER MORE GOOD LOOKING AND HORSES IN STABLES THAT YOU CAN WALK INTO”.
A prior assistant described a polished male/female farmer, natural locomotion/interactions, stable stalls/gates, visible horses, feeding/watering/grooming/training, leading horses into paddocks, horse stats and immediate action menus. Those details are proposed elaborations, not all independently confirmed requirements. That chat could not access the source and reported making no changes. The concrete next priorities are therefore a better farmer and truly walk-in stables.

## Existing implementation
- Three.js 0.170.0 static website; no build step.
- 3D farm, original procedural farmer with male/female choice, pigs/cows/chickens/horses, buildings, well, crop field, feed mill and troughs.
- Rigged Quaternius CC0 horse/cow glTF and pig FBX assets. Horse/cow supplied idle/walk/eat clips; horse gallop available but no active racing feature. Pig idle + custom additive skeletal gait. Chickens remain procedural.
- Single drag pans; pinch zoom and two-pointer pan; right/Shift-drag and buttons rotate. Keyboard/on-screen directions move farmer. Grid pathfinding around buildings/fences.
- Click opens actions immediately; selecting an action queues travel, then performs the work at arrival.
- Illustrated task cards show loaded/required food and water.
- Resource cycle: power + well -> water; water + crops -> maize; maize + power + mill -> feed; complete animal rations -> produce. Simulated finite market with 5% rounded-up sell fee.
- Specialist playtest roles, local inventory and browser saves. Role switching keeps inventory; it is a testing convenience, not a production ownership system.
- Full economic data and provisional rations in DEVELOPMENT.md and economy.js.

## Important limitations
- Updated after the export: stable now has an open entrance, navigable aisle, two horse stalls, gates and roof cutaway; horses are inside. See dist/stable.js.
- Farmer now loads CC0 Quaternius male/female rigged GLB models with Idle_Neutral, Walk and Interact clips. Procedural avatar remains a load-failure fallback. Art remains stylised, not photorealistic. Tasks animate for three seconds at the station before committing the action.
- Models are stylised, NOT photorealistic/racing-quality final art.
- No real user marketplace, login, secure server authority, database or payment integration.
- Real-time daily simulation, animal lifecycle, breeding, server-authoritative competitive racing and cash-backed surrender values are NOT implemented in the current 3D resource game. management.html has older independent experiments; do not confuse them with current features.
- Local progress is stored under `meadow-cycle-v2`. Old earlier prototypes used other storage keys. Do not overwrite user progress casually.
- Cloud-browser WebGL was unavailable. Syntax, resource logic, scene construction, generated handlers, gesture state and model animation data were tested; rendered graphics still need device QA.

## Product intent and financial constraints
Own original game inspired by CropBytes, not copied branding/art/code. Off-chain. Long-term goal: N$ withdrawals from genuinely funded player sales/rewards, user benefit plus business fees/subscription revenue. No fixed daily investment-return promises, no unbacked redeemable token issuance, no using protected refund funds for operations. Animal base-value protection, finite funded production contracts, breeding limits and lifecycle were discussed but amounts/rules remain proposals to model before cash launch. Current coins are test-only, nonwithdrawable.

## Next chat starting prompt
“Continue Meadow Market from this repository. Read HANDOVER.md and ROADMAP.md. Continue refining the farmer and walk-in stables after device playtesting, preserving touch gestures, instant action menus, task cards and the production cycle. Do not claim unfinished real-money or multiplayer features are live. Keep the existing Sites project for deployment.”

## Visual and horse update — 2 November 2026
Pig FBX materials had zero opacity; runtime repair forces the opaque pig materials to opacity 1, with a regression test. Maize now has stalks, curved leaves, cobs and instanced kernels, plus short stalks after harvest until the next farm day. Buildings have foundations, door braces, window frames, shutters, planters, lanterns and barrels.

Horse profiles persist in the existing save without resetting progress. Each horse has speed, stamina, power, energy, condition and last trained day. Training consumes 2 feed, 2 water and 25 energy; once per horse/day, +1 selected stat capped at 95. Complete daily horse rations restore 35 energy and 4 condition at day advance; missed rations restore 5 energy and reduce condition by 6.

Practice races are a local calculator for 400/800/1600m. A seeded numeric model uses pace, launch power, fatigue resistance, energy, condition and bounded form variation. No track animation, entry charges, payouts or secure multiplayer results. See RACING.md before extending.

Chicken trough approach now uses the centre gate opening; the old offset approach overlapped the fence. The full scene smoke test covers walking to the chicken water station and committing its ration only after the animated work period.

## Skyline Cup racing — 2 November 2026
`racing.html`, `race.css`, `race-engine.js`, `race-scene.js`, `race.js` implement the local 3D event requested next. Farm horse profiles link directly into the paddock with the selected horse. Read RACING.md for controls, architecture, remaining server work and the WebGL verification limit. Run all nine tests in `tests/`. Browser save `meadow-cycle-v2` is only read, never rewritten by racing; local race history/replay use separate keys. Preserve the existing Site identity and keep GitHub source synchronized.

## Visibility, visual quality and strategy repair — 2 November 2026
The prior character tests measured cached boxes rather than the vertices actually sent through skinning. SkeletonUtils clones initially carry stale bone matrices. Fitting those clones before updating the hierarchy shrank the actual animated farmer to roughly 7 cm (nominal box was 2.55 m). The same path affected racing horses, leaving large jockeys over tiny animals. `model-rig.js` now updates the hierarchy, skeleton matrices and skinned bounds before fitting; tests inspect actual posed vertices. Both farmers now remain around 2.5 m tall during walking/work. This is a confirmed numerical defect, not merely a theory about failed downloads.

`smooth-rig.js` applies one skin-weight-aware Loop-subdivision pass to horse/cow/pig meshes, retains their skeletons and smooths normals. Pig Phong materials have been replaced with non-emissive rough Standard materials, and farm lights reduced. `jockey.js` replaces the block jockey with smooth articulated limbs, clothing, goggles, stirrups, reins and saddle numbers; the jockey follows the horse's Body bone motion. Horse gallops have staggered phases. Racing refuses to start if full horse assets fail to load; it does not show block replacements.

The race adds pre-race Closer/Slipstream/Breakaway plans; seeded firm/soft track and wind; a Resolve meter building from conserving/drafting and scaling the one-use burst. Rules version is `skyline-2`. Higher-quality/Performance render toggle changes resolution and shadows. Crowd silhouettes now include heads, and the dirt has a procedural granular surface.

`index.html` is now a farming-art welcome page, `farm.html` retains the full previous farm and reads the unchanged `meadow-cycle-v2` save. The generated cover illustration is `farm-welcome.webp` and is labelled cover art, not a screenshot. The outer private-site ChatGPT sign-in screen is platform-controlled and has no exposed image-customization setting; its audience/authentication was preserved. Do not claim that outer gate was customized.

Cloud WebGL remains unavailable. Welcome page visually inspected; actual animated skin positions and race flow are tested. GPU screenshots, final appearance and real phone frame rate are still unverified. Railway does not change client-side asset/rendering quality; no infrastructure migration was performed.

## Rider and steering rebuild — 2 November 2026
User screenshot showed the continuing visual problems and horses moving across the grass. A real terrain defect was present: the ellipse's Y varied below the surrounding ground. The circuit now stays at Y=0.2, above the terrain; a whole-lap/all-lanes assertion verifies clearance.

`jockey.js` now loads the existing licensed Quaternius humanoid GLB and uses its face, hands, boots, clothing topology and skin skeleton. The earlier capsule/sphere-body rider has been removed. Riding is posed with two-bone arm/leg IK, independent foot placement, forward spine lean, head looking into turns, inside-hand rein shortening and outside-hand release. Reins are dynamic curves from actual wrists to the horse head. The original straw hat is hidden and a helmet/goggles follow the head bone. This is an adapted stylised CC0 human asset, not a new bespoke photorealistic jockey.

`race-motion.js` derives heading from forward PLUS lateral travel, applies controlled banking and sends steering cues to the jockey and neck/head bones. Lane velocity accelerates/decelerates rather than snapping laterally. Rules are `skyline-3`. Actual travelled velocity is recorded separately from desired speed; the HUD and gallop rate use actual motion. The horse's stride cadence is calibrated to distance travelled, including slower replays and blocked movement. Seated rider bounce continues to follow the Body bone.

Track presentation uses full-resolution High mode by default, physical surface materials, a gradient sky and rolling mountain meshes instead of pyramid silhouettes. Mobile HUD is compact, gauges are horizontal, and Field toggles the full order. Director avoids the very wide broadcast shot; it is still manually available.

Relevant tests: jockey.test.mjs, race-motion.test.mjs, race-scene.test.mjs (now checks animated human rigs and whole-lap track clearance), race-engine.test.mjs, race-flow.test.mjs. Cloud GPU/WebGL rendering is still unavailable; do not claim that the finished rendered visuals or Android frame rate have been verified.

## Recording-driven mounted cycle and camera update — 3 November 2026
The user provided `1001038496.mp4` and then explicitly asked to proceed. Review confirmed the latest build was running, but posture remained upright/stiff and side cameras clipped through runners/signage. Do not attribute this recording to an old cache.

`mounted-motion.js` now supplies a new eight-key racing-seat cycle sampled from the actual horse gallop action phase. Body and spine lean forward together, hips rise through suspension, hands travel with the stride, and greater effort deepens the crouch. Foot IK remains attached to stirrup targets. The idle-to-racing transition blends. These are newly authored numeric keys driving the existing rig, NOT a purchased animation pack or mocap.

`race-camera.js` checks padded world obstacle boxes and opponent bounds, selects a clear alternative viewpoint and checks interpolation. The initial countdown uses a closer chase frame; view targets stay near the entrant rather than several metres inside the next horse. Race rules version is `skyline-4`; runner pace is exposed to the animation controller. Static assets remain unchanged.

Asset research found a coordinated Enozone pack listed at US$70; no purchase was made and browser export compatibility remains to be verified. See ASSET_UPGRADE.md. Full replacement with professional horse/jockey art is pending a budget/owned asset and export validation. Do not claim this part is completed.

Tests: mounted-motion.test.mjs (cycle and camera obstruction cases), jockey.test.mjs (actual crouch/phase-linked hip movement), plus scene, race-motion, engine and full replay flow. The fresh cloud preview on 3 November still reports that WebGL is unavailable. Rendered quality and phone performance remain unverified.

Nov 3: Session FIFO farm work queue (20 waiting jobs) never replaces the active order. Work and walking continue with dialogs open. Pending jobs can be removed; day/role changes wait for work completion. Queue is not background/offline automation.
Race recruitment offers fictional riders for farm coins: Mara 120, Kai 180, Tala 200, three starts each. Start charged only at gates; replay never consumes starts. Starter remains free. Line, care and finishing strengths affect the deterministic simulation. Existing humanoid art receives rider silk colours, not premium purchased models.
Race camera defaults to Chase, preserves manual selection, supports +/- buttons, wheel and pinch. Oriented opponent bounds replace oversized world-axis collision boxes, and opened gates no longer block cameras. Automated scene tests use a renderer stub: rendered GPU pixels remain unverified in this environment.

Nov 3 race-day presentation: lobby rotates through a complete track orbit and a close parade-ring view; Watch paddock hides setup to inspect the scene. Begin race day runs an 18-second walking parade, 8-second mounted approach, then the normal start countdown. Skip to starting gates is available; retirement/pause work before gates and contracts still consume only at gate opening.
Six horses use the authored walk animation in the ring, and each existing jockey rig changes to the authored on-foot walk with a hand attached to a dynamic lead rope. The same rig switches back to seated race IK at the gate approach. Mounting itself is a scene transition, not a hand-authored mounting clip.
Recorded finish times stay authoritative. Scene-only runout now carries every horse beyond the finish and slows to rest over 13 seconds; the race remains visible 6.5 seconds after the field finishes before results. Replays and results are unchanged.
Venue detail includes fenced parade ring, clipped-leaf hedges, hospitality pavilions, lathed metal trophy, photo-finish tower, distance markers, instanced turf blades and layered foliage. Material detail includes 1024px coat and sand grain, silk weave, physical water, numbered saddlecloths and rim lighting. These are original procedural details on the existing CC0 rigs; no premium assets purchased. Full rendered visual QA remains blocked by unavailable WebGL in the cloud preview. Logic, rig bounds, leading walk, orbit movement, post-line motion and immutable results are covered by tests.

Farm material pass adds wood grain to barn/fence/timber props, soil/path bump detail, smooth lighting normals and 512px terrain grain; the task queue and farm economics are unchanged.

Nov 3 farm7: field moved fully west of the main path into four framed beds (FIELD bounds in crops.js). Crops are no longer decorative: legacy saves receive an empty plot and eight starter seeds once, without changing existing produce. Crop grower: plant 4 seeds, water with 6, advance a farm day, then harvest 24 maize. No automatic replanting; seed offer added for existing saves. Crop state persists inside meadow-cycle-v2. Harvest now validates planted, watered, matured state. Role changes hide inactive production but preserve planting state. FIFO tasks apply costs only on job completion.
Farmer default travel speed raised from 2.7 to 4.5 world units/sec; walk animation retimed. Tools now use a palm point computed after animation in world space, transformed into rig space. Can body and sack hang below handles; props are never attached/scaled on the forearm. Water droplets and a small seed pouch support the actions.
Farm art: rounded building shells, individual orchard foliage/fruits, path inlays/edging, seed bench/crates, verge flowers/lamps and warmer panel styling. Actual crop geometry bounds are tested against walkway and field bounds. Racing has a reversible Neon/Day atmosphere, with cyan/violet track rails and a cooler broadcast palette inspired by the supplied ZED RUN reference, preserving the jockey/race-day system. Existing CC0 base character/horse assets remain.

Nov 3 world8: world expands to 82×62 units, with walkable bounds -32..44 / -27..28. Added connected western Meadow Exchange district and eastern sand training arena. Path search covers the full expanded grid. Main HUD Exchange walks the farmer to the hall; tapping the hall or service tables opens the order book. Barn opens stores, mill links the feed market, well links water, crop garden links seeds, stables link arena and racing.
Training runs for 12 seconds at the arena. The selected existing animated horse follows a sprint/conditioning oval or balance figure-eight; returns to its previous stable position. Costs/stat gain still occur once on job completion and existing daily caps apply. Horse assets must be ready before training.
Exchange: exchange.js matches local orders by price/time using integer cents. Limit orders reserve full price×quantity (or sell stock); price improvement returns immediately. Market orders take available liquidity and cancel remainder. Partial fills, 5% sale fee, cancellations/refunds, validation and self-trade rejection are covered. Existing finite offers migrate into clearly labelled simulated three-level depth. This is not a shared player order book or cryptocurrency connection. Resting player orders do not receive fabricated background fills. Orders and escrow persist with the browser-local farm save.
Imported authored GLB props and market hall replace some procedural props. Microsoft CC0 Lantern uses actual 1024px PBR maps (JPEG mobile repack), with original geometry; Kenney's imported props/hall remain stylized low-poly. No claim that the whole farm has become photorealistic HD. See models/CREDITS.txt for sources. Asset failures are reported; no stand-in cubes are added.
Recording review identified crowd instancing as the camera bug: one stadium-spanning instance AABB falsely collided with every rail view. Static collision now ignores batched instances, retaining actual solid stand geometry. Starting gate is hidden when the race begins, preventing the first side view being masked. Full-lap camera-height regression test added.
Browser QA exercised limit order entry and confirmed available/reserved balances in the rendered exchange UI. 3D pixels remain unavailable in the cloud browser; numerical/rig/scene tests validate expanded paths, services, imported assets and arena training.
