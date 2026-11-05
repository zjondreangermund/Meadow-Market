# Meadow County — World v11

The original farm remains in place. The walkable county spans X −96…108 and Z −84…84, roughly 7.4 times the previous walkable area. Roads connect the village, depot, production plots and Meadow Park gateway.

Open **World** on desktop, or **More → County map** on a phone. Map pins inspect a destination. **Walk here** adds a real walking task to the existing queue. The home camera button recentres the farmer; zoom and panning now cover the county.

## A playable estate

| Property | Purchase | Inputs per cycle | Output | Farm days |
| --- | ---: | --- | --- | ---: |
| North Fields | 450 coins | 6 seeds + 8 water | 42 maize | 2 |
| Willow Orchard | 650 coins | 3 seeds + 10 water initially; 10 water thereafter | 18 fruit | 3 |
| Spring Waterworks | 600 coins | 2 power | 60 water | 1 |
| County Feed Mill | 750 coins | 20 maize + 2 power | 20 feed | 1 |

Purchases, starting production and collecting output require the farmer to walk to the property and finish the queued action. Inputs and prices are checked at completion. A failed action consumes nothing. Production advances with **Next farm day**, and output must be collected manually. Ownership and production survive reloads, while the existing task queue still runs only while the game is open.

Property businesses complement the existing specialist farm. No rent, automatic purchases, animal resets or new save slot are introduced.

## Village deliveries

The co-op posts three requests each farm day. Accept up to three active requests, obtain their goods and choose **Walk to depot & deliver**. No goods are reserved when accepting. The handover checks available inventory, removes the goods, pays the listed reward once and adds five reputation. Goods reserved on the existing exchange cannot be used. Requests are valid through their displayed due day; expired deliveries pay nothing. Cancellation has no penalty.

## Performance and scope

County road meshes share geometry and are batched into a handful of instanced draws. District detail is constructed on approach or when panning toward it, then hidden outside the active range. Grove geometry is instanced. Original animal rigs, breeding and race rules remain in use.

This is a browser-local simulation foundation, not a finished multiplayer or cash economy. County traffic remains ambient. World v12 adds separate player-owned vehicles for driving, field work and cargo delivery. House interiors, road traffic physics, employees, shared servers, seasons and automatic logistics are not implemented. New county structures are lightweight procedural meshes; no claim of a new HD asset pack is made.

Automated tests cover migration, costs, production, request expiry, duplicate-reward prevention, long-distance obstacle routing, queued depot arrival, scene geometry and district activation. Browser UI previews can verify map and forms; actual WebGL appearance and Android frame rates still require a capable device.


## Farm vehicles — World v12

Open **Vehicles** on desktop or **More → Farm vehicles** on a phone. The farm garage is west of the original farm at (−35, 27), with a driveway to the county road. An electric tractor is provided once without changing the current coin balance. The delivery pickup costs 950 available farm coins and carries 40 goods units.

Choose **Walk over & drive**. Forward/reverse uses W/S or up/down; left/right steers. On a phone, use the existing arrow pad. Space or the Brake button stops the vehicle. Stop before **Park & exit**. Walking tasks and next-day changes are blocked while driving; finish the task queue before boarding. The camera follows the vehicle through the farmer position.

Drive the tractor inside owned North Fields, stop and choose **Work field**. Planting consumes the normal 6 seeds + 8 water and 5 battery points, and finishes in one farm day. The same action collects a ready crop for another 5 battery points. The attached implement is fixed; there are no detachable tools or physical row-by-row ploughing yet.

Accept a village request, park the pickup at the garage and load it through **Cargo / battery**. Loading removes stock from stores into persistent vehicle cargo. Drive to the depot handover point (−72, −45), stop and hand it over through the same menu. The contract deadline, cargo and location are checked again, and the reward pays once. Cargo can be returned to stores at the garage. Expired cargo is not destroyed; return it to the garage to unload.

Both vehicles use the existing power commodity: 1 power restores up to 25 battery points at the garage. Recovery costs 2 power and returns the vehicle and its cargo to its garage bay. Positions, battery, ownership and cargo save regularly and on page exit. Reload resumes on foot rather than automatically accelerating a vehicle.

Vehicles use lightweight procedural geometry, with separate steering and wheel-spin pivots. Static scenery and other player vehicles block driving. Ambient county traffic is still decorative and has no full traffic collision or AI road rules. Cab interiors and a seated character animation are not implemented. Actual WebGL visuals and Android performance remain unverified in the current test browser.


## Graphics, weather and regional estates — World v13

The walkable region now spans X −248…260 and Z −220…220: 508 × 440 game units, about 6.5 times the previous county area. The existing home county, garages, roads and businesses remain in place. Regional roads connect to four complete estates with permanent parcel IDs.

| Farm | Region | Price | Inputs per cycle | Output | Farm days |
| --- | --- | ---: | --- | --- | ---: |
| Riverbend Crop Farm | West Valley | 1,800 | 12 seeds + 18 water | 90 maize | 2 |
| Suncrest Orchard | East Ridge | 2,200 | 24 water + 2 power | 46 fruit | 3 |
| Brookside Dairy Farm | South Meadows | 2,800 | 12 feed + 20 water + 2 fruit | 24 milk + 8 fertiliser | 1 |
| Oakridge Boarding Farm | Oak Highlands | 3,000 | 16 feed + 24 water + 4 fruit | 12 condition units + 8 fertiliser | 2 |

Open **World** to inspect the estates, preview one in the actual 3D scene, or walk to its entrance. On phones, use **More → Regional farms**. Purchase, production and collection use the existing arrival/work queue. Drive and park before using on-foot actions. The dairy and boarding estates have separate resident animated cattle/horses using the working original rigs; these do not replace or reset the home animals or personal racing stable. Estate residents have fixed coat identities. Ownership, production timers and collected output survive reloads. No rent or automatic coin deduction is introduced.

The former cone groves are replaced by rounded instanced tree canopies and trunks. Village buildings receive textured materials, corrected roof slopes, framed windows, trim, porches, chimneys and soft ground contact. Continuous rolling terrain extends beyond the playable boundary so the world no longer ends against an empty blue background. District and estate detail loads on camera/player approach; roads and vegetation retain batching/instancing.

Open **Sky** or **More → Sky & weather** for a gradient sky with moving cloud banks, clear weather, passing clouds, rain showers, storm fronts and mist. Automatic patterns are deterministic by farm day and saved seed, or the player can choose a visual override. Lighting, fog and precipitation transition with the forecast. Weather does not change existing crop timers, costs or horse statistics in this release. **Scenic horizon view** lowers the camera so the horizon and sky can be seen.

The expanded map and stable estate IDs are a regional foundation, not a multiplayer server. Account-based ownership, authoritative shared parcels, player presence, synchronisation and further region streaming still need backend implementation. No supported player-count claim is made. Actual WebGL appearance and Android frame rates still require device verification; automated scene checks are not rendered screenshot validation.
