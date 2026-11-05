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
