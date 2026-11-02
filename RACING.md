# Horse racing design

Current implementation is a practice calculator, not a competitive race service.

## Race engine
Use coded rules for results. Do not ask a language model to select a winner. The same stats, distance, rules version and random seed should replay the same result. AI may later generate commentary or choose a rival's strategy within fixed rules; the race engine must validate strategy and determine the outcome.

The local prototype simulates 20 m segments. Speed controls base pace; power affects the opening 100 m; stamina delays fatigue and reduces its penalty. Energy and condition multiply pace. A bounded per-horse form factor (0.96–1.04) varies the result. Distances are 400, 800 and 1600 m. This is provisional game balancing, not a biological model or proven economic design.

Training: once per horse per farm day, costs 2 grain feed + 2 water and 25 energy. Adds 1 selected attribute up to 95. Complete daily horse rations restore 35 energy and add 4 condition at day advance. Missed rations restore 5 energy and subtract 6 condition. Energy max 100; condition range 20–100. Practice calculations are free previews and do not consume energy or award anything.

## Competitive implementation next
Run stats, training, race entry and settlement on the server. Snapshot immutable race entrants and stats; use a versioned engine with secure random seeds and an auditable seed-commit/reveal design. Keep the presentation a replay of the simulation rather than letting frame rate or client position decide results. Race IDs and settlement must prevent duplicate entry or rewards. Test long-distance stamina advantages, sprint power advantages, uncertainty, ties and abuse before setting fees or prizes.

Add a visible track, countdown, gallop animations, distance/energy indicators, finish photo and replay. Then add matchmaking, rival strategy and breeding/lifecycle limits. The browser-only alpha cannot enforce competitive integrity or support real-money outcomes.
