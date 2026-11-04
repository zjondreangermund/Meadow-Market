import {COATS,visualSeed} from './coat-variants.js';
// Save identity once; reorderings, training and renaming never repaint animals.
export function animalIdentity(state,type,id,preferred){
 const choices=COATS[type];if(!choices)throw Error('Unknown animal species');
 const key=type+':'+id;
 if(!state.animalIdentities||typeof state.animalIdentities!=='object')state.animalIdentities={};
 let identity=state.animalIdentities[key];
 if(!identity||!choices.some(c=>c.id===identity.coatId)){
  const coat=typeof preferred==='string'?choices.find(c=>c.id===preferred):choices[Number.isInteger(preferred)?preferred%choices.length:visualSeed(key)%choices.length];
  identity={coatId:(coat||choices[0]).id,appearanceSeed:visualSeed(key)};
  state.animalIdentities[key]=identity;
 }
 if(!Object.isFrozen(identity))Object.freeze(identity);
 return identity;
}
