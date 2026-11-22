# Meadow Market: Frontier — mobile farming-survival game
**Status:** Phase 0 standalone browser/WebGL vertical slice on `feature/frontier-mobile-survival-20261122`. **Not a deployed multiplayer game.**
**Product identity:** An original Meadow Market mode. Do not copy any existing game's name, models, enemy design, map, UI, sound, characters or art.

## 1. The promise
A persistent, protected farm is your home and business. Crops, livestock, worker schedules, barns, vehicles and storage create tangible value. Players leave that safety on expeditions into contested countryside to find rare seeds, machinery parts, fuel and contract supplies. Recover, extract, trade and improve the farm. Losing an expedition must hurt, but never erase the home farm.

Target: Android and iPhone mobile first, with optional desktop browser. The initial technical base is the EXISTING Three.js static site; do not present it as an installed Android/iOS app or promise photorealism on every phone.

## 2. Vertical slice currently added to this branch
- `dist/frontier.html` + `frontier.css`: standalone touch-first 3D test mode with survival HUD, in-world map, camera swipe, D-pad, sprint, interact, vehicle, food/water and a test exchange.
- `dist/frontier.js`: home buildings, crop rows, road, safe gate, wasteland, abandoned depot, pickup model, farmer rig attempt + placeholder, scavenger patrols and third-person camera, offline local saves.
- `dist/frontier-rules.js`: safe/frontier/red zone boundaries, food/water decay, resource interactions, raid cooldown, item backpack, protected warehouse, local buys/sales and knockout extraction penalty.
- `tests/frontier-rules.test.mjs`: local rule regression tests.
- This is **single-player and browser-local**. The market is a simulated NPC exchange. Guard AI, models and terrain are provisional. There is NO functioning networked player, shared order book, real PvP, real payment, actual online backend or guaranteed phone performance.

Use `python -m http.server 8080 --directory dist`, then open `http://localhost:8080/frontier.html` on a WebGL-capable browser. For mobile phone testing serve via a reachable HTTPS host; GitHub commits do NOT deploy to the existing ChatGPT Site.
Use `node tests/frontier-rules.test.mjs` and `node --check dist/frontier.js` to verify the new code. Continue running the existing regression suite before merge.
The old farm save key is `meadow-cycle-v2`; the Frontier isolated key is `meadow-frontier-prototype-v1`. Do not overwrite or migrate historical farm progress until an explicitly designed import stage.

## 3. World design
| Region | Safety | Gameplay |
| --- | --- | --- |
| **Homestead Valley** | Safe/PvE | Permanent farmhouse, fields, barns, livestock, warehouse, protected vehicles, farm upgrades; no PvP or loot theft |
| **Exchange Village** | Safe/Social | Market boards, supply orders, courier contracts, guild co-ops; transactions become server-authoritative |
| **Greenbelt** | Medium threat | Timber, rare crop varieties, salvage, delivery runs, wildlife, hostile NPCs |
| **Scrap Flats** | High threat | Abandoned equipment, advanced parts, fuel and rival expeditions |
| **Border Depots** | PvPvE / contest | Time-gated stockpiles, patrols, alarms, extraction vehicle ambushes, limited-risk expeditions |

The prototype uses an x-coordinate boundary for testing only; production world uses server-owned polygons and collision volumes. Persistent safe farms are private instances in the first multiplayer iteration; dangerous zones are shared sessions.

## 4. Core loops and compelling decisions
**Daily homestead:** Feed animals, water crops, harvest, refine grain/feed, repair tools, manage hired workers and put goods into secured storage. Existing farm, stable, horses, daily ration resource cycles and racing remain intact.

**Expedition:** Check weather and fuel, equip affordable food/water, choose a low/medium/high-risk zone, travel on foot/tractor/pickup, scavenge or raid, choose whether to push deeper or return, and deposit loot in protected storage. Scarcer resources raise risk, not guaranteed payouts.

**Raids:** Raid contested NPC depots and later rival expedition parties OUTSIDE protected farms. Sound and time create consequences. High-value loot is heavy and vehicle cargo changes extraction decisions. No raid against a player's permanent safe farm; offline livestock and warehouse never get stolen.

**Trading:** Farm-supply orders, fixed NPC starter contracts, player offers, livestock auctions and machinery resale. After multiplayer ships, every listing, reservation, release, fee and inventory transfer must run atomically on the server. No real cash or redeemable coins in the playable prototype.

**Vehicles:** Pickup (fast expedition, low cargo), tractor (agriculture, slow on roads), lorry (high cargo), horse (cross-country with stamina). Repairability, parts and fuel are long-term progression. Add collision, realistic steering and ownership validation before multiplayer.

**Survival:** Food and water depletion, fatigue and weather effects; rare emergencies but no punishing sleep-time mechanic. Defeat drops only carried expedition items; home storage and farm progress are protected. A clear recovery loop returns the player home.

## 5. Session and social design
- Initial target for shared dangerous-zone sessions: 20–40 concurrent players **subject to network and device benchmarking**, not an existing capacity.
- Social town, farm visits by permission, trusted co-op partners, optional guild logistics and protected player trading.
- Players can choose solo PvE expeditions; competitive depots are opt-in and clearly marked.
- Voice/chat and moderation require privacy, age-safety and abuse handling before release.
- Spawn points and extraction points rotate within clear rules; prohibit spawn camping and persistent griefing.

## 6. Server-authoritative production architecture (NOT yet implemented)
```text
Android / iPhone WebGL client (Three.js; native packaging only after QA)
    | TLS HTTPS + secure authenticated WSS
    v
Session gateway / account service
    +-- Authoritative movement, safe-zone and combat validator
    +-- Instanced homestead state and farm time jobs
    +-- Sharded dangerous-zone matches + enemy simulation
    +-- Inventory, item ownership, vehicle state
    +-- Order book + double-entry transaction ledger
    +-- Match events and audit/trade history
    |
    +-- PostgreSQL transaction store
    +-- Redis presence/session coordination (no authoritative balances)
```
Never trust client claims such as 'I raided a depot', 'I got 99 seeds', 'I am in a safe zone', inventory counts, cooldown timers, coordinates, trade fulfillment, or withdrawal balances. Enforce server tick validation, action distance checks, immutable item/event IDs, authoritative depot restock, idempotency keys and atomic inventory/coin commits. The current `frontier-rules.js` is only a local prototype and must NOT be reused alone as a network security boundary.

The client should send intended actions (`MoveInput`, `Interact`, `Drive`, `RaidStart`, `Deposit`, `PlaceOrder`) and receive authoritative snapshots/events. Server computes all results. Include rate limits, reconnection/resume, tamper detection, player reporting and rollback-safe event IDs.

### Multiplayer acceptance tests
1. Simultaneous looters cannot duplicate one depot stockpile.
2. Disconnect and reconnect during extraction does not mint loot twice.
3. Safe home farm PvP and theft are rejected by the server, even with a malicious client.
4. Player cannot move faster than server-verified speed, including in vehicles.
5. Offline trades are either committed fully or rolled back atomically.
6. No client can alter a competitor's warehouse, vehicle or livestock records.

## 7. Realistic visuals without sacrificing mobile compatibility
Art target: grounded Southern African farmland: Namibian dry-season grass, dust, realistic tractor tires, timber, steel, detailed corrugated roofs, sunrise haze, textured livestock, physically proportioned roads, subtle tire marks and high-quality imported rigged actors. These are art-direction goals; the prototype is a mix of existing stylised rigged assets and procedural stand-ins.

- Create texture/material atlas sets, progressive LODs and instancing for crops/trees, 1K or smaller maps for common phone props where possible, compressed textures (KTX2), mesh compression and streamed cells.
- Use PBR materials, limited real-time lights and baked static shadows for mobile. Favor silhouette quality and animations before high polygon counts. Keep shadows optional and cap render resolution.
- Mobile benchmark targets (to validate, not promise): stable 30 FPS on a representative lower-midrange Android; 60 FPS as an optional device-dependent setting; no large stutters during zone transitions.
- Test touch controls on small Android/iPhone screens, portrait/landscape safe areas, thermal throttling, intermittent cellular connection, loading/memory and background resume.
- Validate licences of each imported asset. Existing Quaternius models are not photorealistic; a bespoke/licensed production art pass is needed.

## 8. Development phases and definition of done
**Phase 0 — now, on feature branch:** standalone prototype, touch movement, real existing pickup model, attempted existing farmer rig, local risk zones, loot, extraction, NPC patrols, offline market, independent save. No multiplayer or deployment claim.

**Phase 1 — playable mobile quality:** proper on-device QA, fix collision and camera, improve terrain/materials, authentic animal and tractor rigs, crop growth and warehouse UI, reachable HTTPS preview, physical mobile devices test. Ensure original farm remains intact.

**Phase 2 — authoritative online foundations:** login, farm ownership, inventories, persistence, one shared danger-zone match, server-controlled loot and extraction, two-player sync, tests for safe-zone protection.

**Phase 3 — economy and social:** actual player market with atomic orders and fees (game credits only), farm visits, co-op logistics, persistent vehicles and contract deliveries.

**Phase 4 — raids and polish:** fair PvPvE, patrol and extraction AI, loot-drop insurance, matchmaking, trust/safety, mobile art and audio, performance profiler.

**Phase 5 — public beta:** closed testing, measurable retention, crash and server load tests, security audit, player support and legal review before any money-conversion or payout system.

Do not add cash-out, money prizes or real-money inventory promises without legal/payment review and audited funding of every liability.

## 9. Current compatibility constraints
- Preserve the Sites project identity `appgprj_6ae8ab655a68819199e0e3433bd64eae` and `.openai/hosting.json` if deploying to existing hosting.
- Existing farm: `farm.html`; racing: `racing.html`; existing `index.html` remains the welcome page.
- Frontier: `frontier.html` remains a distinct entry point; do not silently replace the home farm or horse racing.
- No changes to `dist/economy.js`, `dist/farm.js` or existing game saves are needed for the initial isolated vertical slice.

## Phase 1 browser candidate — 22 November 2026
- Collision and sliding against buildings and the safe perimeter, traversable road gate, accelerated heading-relative pickup steering/braking and clear-space dismounts.
- Pickup parking position/heading persists in the existing Frontier save. Reload retains eastern depot coordinates. Fuel depletion brakes in place; knockout no longer teleports the vehicle.
- Exchange can pack food/water for expeditions; extraction remains repeat-safe and isolated from the original farm save.
- Camera pitch/orbit and obstruction distance, smooth avatar turning, animated independent scouts and short harvesting interactions.
- Original deterministic soil/wood/stone surfaces, distant rolling terrain and instanced scrub. Static scenery is batched by material for fewer draw submissions. These changes are not a verified photorealistic art upgrade.
- Background input resets, modal input reset and explicit WebGL startup/context-loss messages.
- Automated motion and full-scene tests exercise physical driving, no-fuel braking, dismount, packing, extraction and save isolation with the real Three.js scene and a stub renderer.
- Cloud browser cannot create WebGL: rendered appearance, phone touch usability, iOS compatibility and FPS/thermal performance remain unverified. No installed APK/IPA is produced.
- Still single-player/browser-local. Next phase: authenticated server account and persistence adapter, authoritative movement/actions, atomic trade storage, reconnect/idempotency and two-client integration tests. No online backend is presented as complete.
