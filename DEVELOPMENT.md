# Meadow Market — resource-cycle alpha

Private browser-local 3D playtest. No shared identities, real counterparties, cash balances, deposits or withdrawals. This iteration replaces the direct feed-all button with farm-station interactions. The previous management prototype remains at management.html but is not linked because it has a separate state and economic model.

## Implemented loop
Power + well → water. Water + plot → maize. Maize + power + mill → grain feed. Grain feed + water + fruit supplements → animal output. Output trades through finite simulated supplier/buyer orders. Four switchable specialist roles test ownership dependencies. Switching does not grant inventory or refill market orders.

## Daily rations per animal (game units, provisional balancing)
- Cow: 4 grain feed + 6 water + 1 fruit feed.
- Pig: 3 grain feed + 4 water + 1 fruit feed.
- Chicken: 1 grain feed + 1 water.
- Horse: 5 grain feed + 6 water + 2 fruit feed.

Rations are loaded at physical food/water stations. Resource deduction occurs at loading; complete rations are consumed at end of the manual test day. Incomplete rations remain loaded and no output is awarded. Advancing a day does not simulate real-world elapsed time or refill market orders. Horses produce condition points; no cash race prize. Three chicken models currently produce a combined standard/specialty egg basket at herd level; per-individual breed records remain pending.

## Visual/movement work
Proper pitched roofs, timber seams, mill sails, stone well, trough contents, improved farmer and animal shapes, contact hoof details. Ground-target movement uses a grid route around building/fence collisions with front gates. Player gait phase is distance-driven, opposite arms/legs are paired correctly; animal movement uses destinations, turns, pauses and leg pivots. Bowls trigger animals walking to the appropriate station.

## Checks
`node tests/economy.test.mjs`
`node --input-type=module --check < dist/farm.js`

Scene construction, generated modal handlers and key gate/well paths were tested with the real Three.js geometry and a stub renderer. Cloud preview WebGL is unavailable; graphics and animation require device validation. This alpha uses procedural models, not final rigged production art.

## Next production stage
Server-authoritative accounts/inventory, real player listings and atomic settlement; processing recipes and genuine demand; timed background production; per-animal records/lifecycles/breeding; rigged art and locomotion. Cash operations remain unavailable pending validated economics and payment/regulatory arrangements.

## Visual / interaction update
- Single-finger or mouse drag pans; two pointers pan and pinch zoom together. Right mouse/Shift-drag rotates; dedicated rotate controls support touch. Gesture release is excluded from click-to-walk handling.
- Item/animal actions open on click immediately. Selecting a work action closes the dialog and queues farmer travel, then validates and executes it at arrival.
- Daily task drawer uses original inline SVG food/water illustrations, species icons, current/required resource amounts and direct action links. Strong action-button contrast fixes pale text issue.
- Quaternius CC0 rigged horse and cow glTF assets replace procedural stand-ins. Supplied idle/walk/eat clips crossfade via AnimationMixer; horse gallop is present for future race development. Independent skeletons per animal.
- Quaternius CC0 pig FBX replaces procedural pigs. Its idle clip is supplemented with a custom additive skeletal leg gait. Hens remain procedurally modelled with improved feathers, comb and wattles.
- This is a stylised asset improvement, not photorealism. Production-quality realistic/textured animals, farmer art, race locomotion blending and foot planting remain art/animation work.
- Model licences and origins: dist/models/CREDITS.txt. Three.js MIT licence: dist/vendor/THREE-LICENSE.txt.
- Asset parsing, skeleton independence, animation transitions and finite animated bounds: node tests/animal-assets.test.mjs.
- Pointer-pan/pinch and scene/dialog handler checks passed in a stub-renderer test. Cloud WebGL remains unavailable, so visual device verification is incomplete.

## Walk-in stable / farmer update
The stable is now built by dist/stable.js, with an open central entrance/aisle, horse stalls, clickable gates, straw bedding and interior horse troughs. It replaces the original solid stable collider. Roof/front facade cut away while the player is inside. Horse spawn/wander targets are inside the stalls. Farmer appearance now includes shaped limbs, overalls, belt, face, hair, hand and boot details; it remains an original procedural stylised character, not a photorealistic imported person. Stable geometry/collision/cutaway checks: node tests/stable.test.mjs.

### Visual / horse follow-up
See HANDOVER.md for new rigged farmer assets, delayed task completion, pig opacity repair, crop/building detail and horse training. New modules: farmer-rig.js, farm-art.js, horses.js. Farmer and animal imports retain fallbacks on network/parse failure. Browser-local storage key and existing inventories are preserved. Test all five files in tests; WebGL device QA remains outstanding.
