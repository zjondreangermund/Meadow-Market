# Skyline Cup — playable 3D racing event

Enter through **Farm → Horses → Enter Meadow Park**, or open `dist/racing.html`. Existing horse profiles come from `meadow-cycle-v2`; racing never rewrites that save. Training and care still change the horses' starting stats through the farm.

## Experience shipped
- A volumetric 3D oval with slight elevation variation, rails, starting gates, terraced grandstands, instanced spectators, fluttering flags, a pavilion, infield gardens and mountain backdrop.
- Six independently animated, rigged horses with original articulated jockeys, silks, helmets, reins, saddlecloths and scarves. Toon lighting and the existing licensed horse asset provide a stylised anime-inspired look; these are not 2D racing sprites.
- A three-second start, live order, race calls, stamina bar, lane controls, three pace settings and one Skybreak burst. Speed lines respect reduced-motion settings. Optional synthesized crowd and hoof audio starts only on user interaction and is muted by default.
- Director camera sequences plus Chase, Rail and Broadcast views; sprint zoom, finish slowdown, confetti, timed results, ten local history entries and an exact replay of the last run during the session. Replay is also saved for future UI extensions.
- 400 m sprint, 800 m classic and 1600 m endurance. Desktop keys and mobile buttons. Pause/resume, tab-hide pause, retirement and WebGL failure messaging.

## Simulation contract
`race-engine.js` is GPU-independent. Its `STEP` is 1/60 second; browser rendering advances an accumulator and never chooses a winner. Snapshot horse attributes and seed plus tick-indexed commands replay the same result. Rules version: `skyline-1`.

Speed sets desired pace; power affects acceleration/launch; stamina reduces reserve consumption. Starting energy and condition scale pace. Conserve/Rhythm/Push trade pace against reserve. Stamina below 22 incurs fatigue. Slipstream at 3.8–12 m saves reserve. Lane changes require a clear pocket; a runner within the same line can block forward progress. Outer turns cost additional distance. Skybreak is a single 4.5 s acceleration opportunity requiring 24 reserve to activate and draining reserve while active. Seeded NPC strategies choose save/attack timing and search for passing lanes. No language model determines the winner.

Finish timestamps interpolate within the fixed step. Rank is sorted by timestamp. Replay reconstructs the simulation from immutable starting attributes, distance, seed and input history. Replays and races do not consume farm resources or create rewards. Data is browser-local and editable by the player.

## Validation
`tests/race-engine.test.mjs`: all distances, deterministic replay, reserve/health trade-offs, one burst, bounds and fixed-step equivalence.
`tests/race-scene.test.mjs`: stadium construction, six independently loaded horse rigs and jockeys, all camera/phase updates, finite bounds.
`tests/race-flow.test.mjs`: start/countdown commands, lane/pace/burst, pause, completion, result/history, exact replay and farm-save preservation.

The cloud preview browser reports WebGL disabled. Model/scene/controller tests pass with a renderer stub; actual pixels, mobile frame rate and rider placement must be checked on a WebGL-capable device. Do not claim GPU visual QA was completed.

## Remaining competitive work
This is a complete local playable event against coded rivals, not live multiplayer or a money-prize service. Trusted server authority, accounts, matchmaking, anti-tampering, secure race seeds, audited settlement and real prizes are separate future work. No entry fee or payout is implemented.
