// One bounded maize plot; farm-day growth continues only through Next day.
export const FIELD={x:-8.4,z:15.3,width:10.1,depth:10.2,minX:-13.45,maxX:-3.35,minZ:10.2,maxZ:20.4,approach:{x:-3,z:15}};
export const WALK_SPEED=4.5;
export function ensureCrops(s){s.inventory??={};if(!Number.isFinite(s.inventory.seeds))s.inventory.seeds=8;if(!('crop' in s))s.crop=null;if(Array.isArray(s.offers)&&!s.offers.some(o=>o.good==='seeds'))s.offers.push({good:'seeds',seller:'Sunfield Seed House',price:3,stock:160,buy:60});return s;}
export function cropStage(s){if(!s.crop)return 'empty';if(s.crop.wateredDay===null)return 'planted';return s.day>s.crop.wateredDay?'ready':'growing';}
export function plantSeeds(s){ensureCrops(s);if(s.crop)throw Error('Harvest the current crop before planting again.');if(s.inventory.seeds<4)throw Error('Planting needs 4 maize seeds. Buy seeds at the market.');s.inventory.seeds-=4;s.crop={plantedDay:s.day,wateredDay:null};return 4;}
export function waterCrop(s){if(!s.crop)throw Error('Plant seeds before watering the plot.');if(s.crop.wateredDay!==null)throw Error('This crop has already been watered.');if(s.inventory.water<6)throw Error('The plot needs 6 water.');s.inventory.water-=6;s.crop.wateredDay=s.day;return 6;}
export function harvestCrop(s){if(cropStage(s)!=='ready')throw Error(s.crop?'Water the crop, then advance a farm day before harvesting.':'Plant seeds first. There is no crop to harvest.');s.inventory.maize+=24;s.crop=null;s.cropReady=0;return 24;}
