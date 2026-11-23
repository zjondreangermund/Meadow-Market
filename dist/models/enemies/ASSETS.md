# Afterfall Leaper in Frontier

This is the user's existing Afterfall Leaper, not a human scavenger or a newly invented substitute.

- Source: user-provided `Leaper_Standard_Final(1).blend`, obtained read-only on 23 November 2026.
- Armor source: `zjondreangermund/Afterfall-Mobile`, main commit `63b37a936df93badea783fd0bf5b31391b919670`, `Tools/Blender/afterfall_leaper_v26_fitted_combat_armor.py`.
- Provenance: the user's own project/source; do not relabel this asset CC0 or apply a third-party asset licence.
- Export: official Blender 5.2.2 LTS, with the existing V26 armor pass; original file never overwritten.
- Output: `afterfall-leaper.glb`, 33-bone final rig, 16,030 triangles, 20 material primitives, 1,636,180 bytes. Visible skinned geometry is joined for bounded draw calls; hidden superseded armor and the historical V11 rig are excluded.
- Retained authored actions: `LEAP_Alert_Predator_HIGH`, `Leaper_V18_FaceMotion`, `Leaper_V19_PredatorReaction`.
- Procedural rust is reduced to constant PBR material values for the mobile export; this is not a faithful shader bake.
- Source contains no crawl action. Frontier adds a provisional bone-driven ground gait and a game-controlled physical pounce; it does not claim an imported production crawl clip, wall traversal, breakable armor, weak-point loot, or the complete Unreal AI.

Reproduce with Blender 5.2+ using `tools/export-afterfall-leaper.py --source SOURCE.blend --armor AFTERFALL_V26_SCRIPT --output OUTPUT.glb` after Blender's `--` separator. Keep the source model and its armor script revision together.

The mobile state machine follows Afterfall's `Docs/Enemies/Leaper_Predator_Behaviour.md` and `Docs/Enemies/Machine_Rig_Combat_Roster.md`: white scanning, yellow alert/investigation, red attack, readable wind-up, committed pounce and recovery. Spider Gunner, SKYHOUND and GRAVEDROP remain future roster integrations and are not present in the live browser build.
