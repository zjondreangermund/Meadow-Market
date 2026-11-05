import assert from 'node:assert/strict';import fs from 'node:fs';import {installMobileUI} from '../dist/mobile-ui.js';
globalThis.window={};let content='';installMobileUI({modal:html=>content=html});window.openMobileMenu();
for(const action of ['showAvatar','openFarmPanel','openBreeding','openTraining','nextDay','home','toggleGraphics','openCycle'])assert.ok(content.includes(action+'()'),action+' reachable in phone menu');
assert.ok(content.includes('saved in this browser'));const html=fs.readFileSync(new URL('../dist/farm.html',import.meta.url),'utf8');assert.equal((html.match(/class="mobile-dock"/g)||[]).length,3);assert.ok(html.includes('aria-label="More farm actions"'));assert.ok(!html.includes('user-scalable=no'));
const source=fs.readFileSync(new URL('../dist/farm.js',import.meta.url),'utf8');assert.ok(source.includes("lostpointercapture"));assert.ok(source.includes("touches.clear()"));assert.ok(source.includes('distance+d,15,220'));
console.log('PASS: phone menu reaches all farm actions, compact dock, viewport scaling, lost-touch reset and consistent camera zoom bounds.');
