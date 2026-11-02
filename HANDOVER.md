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
- Farmer has improved shaped body/limbs, facial features, hair, overalls, belt, hands and boots. It remains procedural stylised art, not a photorealistic character asset.
- Models are stylised, NOT photorealistic/racing-quality final art.
- No real user marketplace, login, secure server authority, database or payment integration.
- Real-time daily simulation, animal lifecycle, breeding, racing and cash-backed surrender values are NOT implemented in the current 3D resource game. management.html has older independent experiments; do not confuse them with current features.
- Local progress is stored under `meadow-cycle-v2`. Old earlier prototypes used other storage keys. Do not overwrite user progress casually.
- Cloud-browser WebGL was unavailable. Syntax, resource logic, scene construction, generated handlers, gesture state and model animation data were tested; rendered graphics still need device QA.

## Product intent and financial constraints
Own original game inspired by CropBytes, not copied branding/art/code. Off-chain. Long-term goal: N$ withdrawals from genuinely funded player sales/rewards, user benefit plus business fees/subscription revenue. No fixed daily investment-return promises, no unbacked redeemable token issuance, no using protected refund funds for operations. Animal base-value protection, finite funded production contracts, breeding limits and lifecycle were discussed but amounts/rules remain proposals to model before cash launch. Current coins are test-only, nonwithdrawable.

## Next chat starting prompt
“Continue Meadow Market from this repository. Read HANDOVER.md and ROADMAP.md. Continue refining the farmer and walk-in stables after device playtesting, preserving touch gestures, instant action menus, task cards and the production cycle. Do not claim unfinished real-money or multiplayer features are live. Keep the existing Sites project for deployment.”
