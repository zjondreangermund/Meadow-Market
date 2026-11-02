# Meadow Market

A browser-based 3D farming game prototype inspired by interconnected farm economies. Working title: Meadow Market.

## Continue in another chat
Read `HANDOVER.md`, `ROADMAP.md`, and `DEVELOPMENT.md` before editing. Preserve existing resource rules, controls and the Sites project identity. The game is a local playtest, not a production real-money platform.

## Run locally
No build step or npm install is required. Python 3:

```sh
python -m http.server 8080 --directory dist
```

Open http://localhost:8080 in a browser with WebGL enabled. Do not open index.html directly with file:// because ES modules and model loads need HTTP.

## Test
Node.js 22 or newer is recommended:

```sh
node tests/economy.test.mjs
node tests/animal-assets.test.mjs
node tests/stable.test.mjs
node --input-type=module --check < dist/farm.js
```

## Structure
- `dist/index.html`: game UI and responsive styles.
- `dist/farm.js`: Three.js world, farmer controls, pathfinding, tasks and resource interactions.
- `dist/economy.js`: test-game production, rations, inventory and finite simulated trade rules.
- `dist/animal-assets.js`: imported rigged animals and animation transitions.
- `dist/models/`: horse/cow glTF, pig FBX, origins and licences.
- `dist/vendor/` and `dist/three.module.js`: vendored runtime dependencies.
- `dist/management.html`: legacy separate management prototype, not connected to the current farm state.
- `.openai/hosting.json`: existing Sites identity. Preserve it when updating the existing site.
- `tests/`: production-rule and model-loading tests.

## Current hosting
https://meadow-market-farm.zjondreangermund.chatgpt.site/

GitHub and Sites are separate source/deployment systems. A GitHub commit does not automatically update the hosted Site. Use the Sites workflow and its existing project ID for deployments; do not create a replacement site.

## Data and security
Browser-local storage only. No shared accounts, real counterparties, deposits or cash-out. No secrets are included. Test farm coins have no cash value. Existing licences apply to vendored assets; no open-source licence is granted to original project code by this export.
