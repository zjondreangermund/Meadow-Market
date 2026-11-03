# Coordinated racehorse / jockey art upgrade

The current prototype uses existing Quaternius CC0 models. The movement/camera update below improves them but does not replace them with a premium coordinated race set.

## Candidate researched on 3 November 2026
Enozone: **Sport Horses with jockey, rider, sulky**
https://marketplace.unity.com/packages/3d/characters/animals/mammals/sport-horses-with-jockey-rider-sulky-237878

The official listing showed US$70. Checkout taxes and the final price can vary. The listing describes rigged horses and jockeys, keyed gallop/start/idle/trot animations, horse coat variants, silk textures and detail maps. The source package is listed as 1.9 GB and targets Unity. This is a candidate, not an installed asset and not yet a verified drop-in for this Three.js game. Verify included source/export formats, material conversion and permitted web distribution before buying.

No paid asset was bought or imported. The user has not provided a spending budget or the licensed package. Do not fetch copies from unofficial paid-asset mirrors. Keep any subsequently licensed source files out of publicly accessible source repositories; preserve vendor licence requirements.

## Acceptance checks before integration
- Horse and jockey clips share a coherent gait phase and mounted pose.
- Export to a locally served GLB with embedded or local textures; validate UVs, normals, skeleton, scale, transforms, tack and reins.
- Convert/resize source materials for mobile; retain albedo/normal/roughness detail and LOD options rather than forcing uniform colour.
- Benchmark on the user's Android phone. Avoid promising that Unity HDRP screenshots match the browser rendering.
- Retain the deterministic race rules and saved farm progress.
- Use the existing collision-aware camera and run mounted-motion/scene/replay tests, then inspect actual rendered gameplay.

## Already implemented without a purchase
`mounted-motion.js`: eight-key, horse-phase-synchronised racing seat, with body/torso pitch, hip rise, hand travel and effort changes. The existing humanoid rig uses it with seated IK and a smooth transition from idle.

`race-camera.js`: padded obstruction checks and alternative camera positions for nearby runners and track structures. Camera interpolation is also checked so the lens does not pass through a body between shots. Start/countdown now frames the entrant rather than showing only the distant stadium.

These changes use the existing art. Full professional model/material replacement is still pending asset selection and access. Browser WebGL remains disabled in this environment; numerical/pose tests are not a substitute for final rendered visual review.
