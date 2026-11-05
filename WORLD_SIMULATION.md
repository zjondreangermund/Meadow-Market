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

This is a browser-local simulation foundation, not a finished multiplayer or cash economy. Vehicle traffic is ambient: vehicles are not yet player-drivable and do not carry a player's deliveries. House interiors, road traffic physics, employees, shared servers, seasons and automatic logistics are not implemented. New county structures are lightweight procedural meshes; no claim of a new HD asset pack is made.

Automated tests cover migration, costs, production, request expiry, duplicate-reward prevention, long-distance obstacle routing, queued depot arrival, scene geometry and district activation. Browser UI previews can verify map and forms; actual WebGL appearance and Android frame rates still require a capable device.
