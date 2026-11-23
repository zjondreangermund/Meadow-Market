"""Blender 5.2+: export a mobile GLB from the user's Afterfall Leaper source.
Run headless with --source SOURCE.blend --armor AFTERFALL_V26_SCRIPT --output OUTPUT.glb.
The source .blend is opened without embedded scripts and is never saved/overwritten.
"""
import bpy,sys,argparse,runpy,math,json
from pathlib import Path
args=sys.argv[sys.argv.index('--')+1:]
p=argparse.ArgumentParser();p.add_argument('--source',required=True);p.add_argument('--armor',required=True);p.add_argument('--output',required=True);a=p.parse_args(args)
bpy.ops.wm.open_mainfile(filepath=str(Path(a.source).resolve()),use_scripts=False)
module=runpy.run_path(a.armor);module['apply_armor']()
rig=bpy.data.objects['ARM_Leaper_Final'];scene=bpy.context.scene;scene.frame_set(1)
meshes=[o for o in scene.objects if o.type=='MESH' and not o.hide_render and not o.hide_viewport and any(m.type=='ARMATURE' and m.object==rig for m in o.modifiers)]
assert meshes,'No visible original-rig meshes'
# Export constant PBR material values, preserving signal/weak-point names; the
# original Blender procedural rust shader is not silently claimed to transfer.
for o in meshes:
 for i,slot in enumerate(o.material_slots):
  if slot.material:o.data.materials[i]=slot.material
for material in {slot.material for o in meshes for slot in o.material_slots if slot.material}:
 if material.use_nodes:
  node=material.node_tree.nodes.get('Principled BSDF')
  if node:
   for link in list(material.node_tree.links):
    if link.to_node==node:material.node_tree.links.remove(link)
   node.inputs['Base Color'].default_value=material.diffuse_color
# Bake non-armature detail modifiers before joining; skin weights stay attached.
bpy.ops.object.select_all(action='DESELECT')
for o in meshes:
 o.hide_set(False);bpy.context.view_layer.objects.active=o;o.select_set(True)
 for mod in list(o.modifiers):
  if mod.type!='ARMATURE':bpy.ops.object.modifier_apply(modifier=mod.name)
 o.select_set(False)
for o in meshes:o.select_set(True)
bpy.context.view_layer.objects.active=meshes[0];bpy.ops.object.join();body=bpy.context.view_layer.objects.active;body.name='Afterfall_Leaper_Mobile_Armor'
triangles=sum(len(p.vertices)-2 for p in body.data.polygons)
if triangles>45000:
 mod=body.modifiers.new('Mobile geometry budget','DECIMATE');mod.ratio=45000/triangles;bpy.ops.object.modifier_apply(modifier=mod.name)
# Keep the exact 33-bone final rig and existing authored actions. No invented crawl clip.
for o in list(scene.objects):
 if o not in (body,rig) and o.type not in ('LIGHT','CAMERA'):o.hide_set(True)
body.hide_set(False);rig.hide_set(False);rig.data.pose_position='POSE'
bpy.ops.object.select_all(action='DESELECT');body.select_set(True);rig.select_set(True);bpy.context.view_layer.objects.active=rig
Path(a.output).parent.mkdir(parents=True,exist_ok=True)
bpy.ops.export_scene.gltf(filepath=a.output,export_format='GLB',use_selection=True,export_animations=True,export_animation_mode='ACTIONS',export_skins=True,export_yup=True,export_apply=False)
print('AFTERFALL_MOBILE_EXPORT',json.dumps({'source_meshes':len(meshes),'bones':len(rig.data.bones),'triangles':sum(len(p.vertices)-2 for p in body.data.polygons),'actions':[x.name for x in bpy.data.actions],'bytes':Path(a.output).stat().st_size}))
