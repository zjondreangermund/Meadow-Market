# Production and growing simulation — Visual v15

Updates the existing browser save (`meadow-cycle-v2`) additively. Existing stock, cash, horse records, coats, vehicles, cargo and exchange orders are retained.

## Independent crop beds

Open the kitchen garden or More → Crop beds. Each of four beds has its own crop, seed cost, watering, timer and harvest. Maize takes 24 real hours, wheat 18, sunflower 36 and vegetables 12. Growth is continuous while open and catches up from saved timestamps after closing. Next day advances the equivalent of 24 growing hours. Water is required to start growing. Two animal fertiliser units shorten one bed's cycle by 20%, once per planting. Only the selected bed displays its crop.

The old single maize planting becomes bed 1, retaining its harvest. Other beds start empty. New finite seed and produce markets are added once; existing orders and escrow stay intact.

County fields and regional crop farms show progressive planted rows. Purchased orchards have distinct apple, pear, orange and plum trees, which mature over 72 growing hours and retain their trees after fruit collection. New fruit grows during subsequent production cycles. Fruit remains the existing common fruit-feed economy item.

## Grain trailer and mill route

1. Visit the farm garage and buy the 60-unit grain trailer for 250 coins (Production → Trailer). It is parked at −41, 17.
2. Reverse the tractor or pickup's rear hitch close to its drawbar and select Hitch. The tractor's cultivator is stowed while towing. Unhitch before tractor field work.
3. Centre the **trailer**, rather than the tow vehicle, in the farm storage bay at −23, 26. Load up to 20 maize.
4. Drive to the home mill bay at −22.3, 10, or County Mill at 75, 28. Tip maize into the intake. The home mill requires the Feed miller role; the county mill requires ownership.
5. Start processing: home mill uses 10 maize and 1 power, taking 30 seconds; county mill uses 20 maize and 2 power, taking 60 seconds. Grain must first be delivered to the intake. Power represents the grid.
6. Centre the trailer below the outlet and load feed. The visible grain stream fills the trailer over six seconds.
7. Return to farm storage and unload. Only then is this feed available for animal care and trading.

Transfers commit once after six seconds. Moving the trailer cancels without consuming source goods. Saved trailers retain cargo when detached or reloaded. Legacy county mill jobs become pending output in that mill. Milling no longer instantly credits feed to farm inventory.

Use Show this loading bay / trailer for a close camera view. Vehicle entry/exit remains the nearby button or E. Trailer payload reduces towing speed. Trailer wheels, drawbar following, tipping bed and grain level animate separately. Collision checks cover the tow vehicle and trailer. The loading lane, gantry supports and storage tank have checked clearances.

## Rendering and limits

Vehicles retain the bundled metre-scale GLB meshes and native wheel pivots, with paint/glass tuning, contact shadows and a baked sky reflection texture for PBR surfaces. Fixed industrial detail is batched by material; growing fields use instanced meshes. The grain trailer and industrial loading structures are local geometry without third-party network requests.

Automated scene and rule checks cover growth, save migration, exchange preservation, physical loading, processing, cargo conservation, real controller towing and loading clearance. The available cloud browser lacks WebGL, so rendered pixels, touch driving and actual GPU performance remain unverified. This is a local solo simulation; it does not add a multiplayer server.

## Neighbours and estates — Visual v16

The four original estate IDs and prices are retained. Six distinct farms now have complete pre-sale houses, working buildings and planting/turnout layouts. Crop estates have arable rows and grain storage; the orchard has mixed fruit rows and a packing shed; the dairy has open grazing, milking buildings and milk storage; the boarding farm has stables and a sand turnout/lunging ring.

Two additional premium properties have real recipe differences: Highplain costs 4,600 coins, consumes 12 seeds and 12 water, and yields 132 maize in 36 real hours (or two manual farm days). Greenhaven costs 6,200 coins and produces 34 milk, 8 eggs and 14 fertiliser using 14 feed, 18 water and 2 fruit per day. Purchasing never changes an existing horse, coat, trailer load or farm record.

Each estate has two adult residents and a child, using independent clones of the existing animated male/female farmer rigs with different proportions. A dog and cat have articulated legs, heads and tails. Residents have separate random seeds, walking/resting/looking/working routines and contextual local dialogue. Children do not perform work animations. These are local NPC routines and scripted contextual replies, not an external language-model service.

Home animals and estate livestock now use independent weighted behaviour schedules and animation offsets. Movement turns toward a path before advancing, checks swept clearance around food bowls and obstacles, avoids nearby agents and stays inside the appropriate garden or pasture. Food and water troughs and pet bowls also block the player's routes. Static farm buildings are batched by material; resident/animal detail is distance-culled, with fewer active farms on mobile.

Browser WebGL remains unavailable in the testing environment, so no new rendered screenshots or real-device performance claims are made.


## Visual v17: local time, neighbours and fishing

The sky and automatic building/street lights follow Africa/Windhoek real-world time (CAT). Next day advances production, not the real clock. Seasonal daylight is approximated for Windhoek.

Adults make scheduled daytime trips to the co-op or mill, park, walk inside and return. These ambient errands never consume the player's stock or money. Children attend school on weekday mornings, sleep overnight and alternate outdoor play with time at home.

Use Lake to walk to the fishing pier. Casting costs one maize. Wait for the bite alert, then press Reel in within ten seconds. Catches enter inventory and can be sold through the market. Leaving the pier cancels the cast without refunding bait.

Smooth graphics is now the default on desktop and mobile: pixel ratio 1, no shadow maps. High remains optional with reduced pixel/shadow budgets. Static scenery is batched (481 submissions removed in the full-scene construction check), distant agents update less often, and ambient cars use a one/two vehicle pool on mobile/desktop. This is a CPU/construction measurement, not measured GPU FPS.

Automated tests exercise scene construction, routes, clock/light state, fishing, migrations and existing gameplay. The available browser does not support WebGL, so rendered appearance and physical-device performance remain unverified.


## Visual v18: detailed neighbours, roads and riding

Children and elders now have separate articulated geometry, age-specific proportions, faces, clothing and gait; children are no longer scaled adult farmers. Adults retain their native rigs with seeded facial proportions, build, skin/hair and outfit variations. Every estate adds an elder. Dogs and cats have different anatomy, detailed faces, paws and ears; cats have six permanent identity-based coat patterns. Rigid details are batched within moving parts. These are code-authored models, not scanned human/pet assets.

All regional farms show kitchen gardens with visibly different maize, vegetables and sunflowers, plus fruit trees. Unpurchased crop farms show maintained fields. Dairy/boarding/mixed estates have larger, different herds; hens have separate moving heads, wings and legs. Adult chores require arrival at a real bed or trough; idle random work no longer displays tools. Neighbour activity is ambient and does not spend player inventory.

New collector loops join all farm approaches, with village/mill/exchange and estate parking areas. Tests verify regional routes and road/building separation.

The garage offers three original pickup designs inspired by Amarok, Hilux and Ranger double cabs. They have different dimensions/front treatments, slanted windows, doors, seams, mirrors, grille, lights, open cargo beds and articulated alloy wheels. These are original inspired designs, not manufacturer replicas or licensed assets. Change body style while parked through Vehicles; ownership, cargo and charge are retained.

Open an adult owned horse profile and select Ride on the farm, or press R / Ride nearby. Finish the task queue and leave any vehicle first. Use W/S or touch arrows to move forward/back and A/D to steer. The mounted HUD switches walk, trot and canter. R / Dismount finds clear ground; the horse stays nearby for the current session. Foals, resting pregnant mares and exhausted horses cannot be ridden. Riding preserves stats, energy, coats and breeding records. Parked horse positions are session-local; reload returns the horses to their normal home placements.

35 automated checks pass, including full scene construction and actual rig/asset parsing. Rendered quality and device frame rates remain unverified because the available browser lacks WebGL.


## Visual v19: portrait garden graphics trial

Open an adult horse profile and select Portrait garden. The separate showcase.html scene reads saved adult horses and their existing coats/avatar without writing localStorage. With no saved adult horse it displays a clearly named Portrait Bay study horse. No coins, production or race results are awarded.

The original authored animated skeleton is retained. The horse receives bounded shoulder/haunch/chest sculpting, a desktop-only extra subdivision pass, generated coat bump detail, bone-attached mane/tail clumps, muzzle details and leather/metal bridle. The rider retains the existing native humanoid rig and racing seat. This is an incremental art trial, not a new production horse asset or a claim of matching the supplied commercial game's quality.

A pavilion, railings, terrace, instanced hedges/flowers/grass, sky gradient, warm sun, fill/rim light, reflections, ACES tone mapping and contact shadows provide close-up framing. Drag/orbit, pinch/wheel zoom, reset view and idle/walking/canter circuits are available. Smooth defaults to pixel ratio 1 without shadow maps; High enables capped pixel ratios and 512/1024 shadow maps. A live FPS/draw-call/triangle counter measures real elapsed frame time. High automatically returns to Smooth after sustained low frame rates. The phone path uses fewer geometry subdivisions and hair clumps, and targets 30 FPS. These are budgets/targets, not measured performance claims.

36 automated checks passed before final cache packaging. The available browser explicitly reports no WebGL; scene appearance, shader rendering, GPU frame rate and physical Android touch response remain unverified.
