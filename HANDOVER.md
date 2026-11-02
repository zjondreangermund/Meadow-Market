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
