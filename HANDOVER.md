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
