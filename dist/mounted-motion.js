// Hand-keyed two-point racing seat. Values are sampled in the horse gallop's phase,
// not from wall-clock time, so horse and rider share impacts and suspension.
export const MOUNTED_KEYS=[
 {phase:0,hip:.10,body:.43,spine:.56,head:-.38,handY:-.015,handZ:.02},
 {phase:.125,hip:.13,body:.45,spine:.60,head:-.42,handY:-.025,handZ:0},
 {phase:.25,hip:.18,body:.47,spine:.63,head:-.44,handY:0,handZ:-.02},
 {phase:.375,hip:.20,body:.45,spine:.61,head:-.42,handY:.018,handZ:-.035},
 {phase:.5,hip:.16,body:.41,spine:.57,head:-.37,handY:.025,handZ:-.005},
 {phase:.625,hip:.12,body:.40,spine:.55,head:-.35,handY:.012,handZ:.025},
 {phase:.75,hip:.105,body:.42,spine:.56,head:-.36,handY:-.01,handZ:.035},
 {phase:.875,hip:.10,body:.44,spine:.58,head:-.39,handY:-.02,handZ:.025}
];
export function mountedMotion(phase=0,effort=.5,moving=true){if(!moving)return {hip:0,body:.10,spine:.3,head:-.12,handY:0,handZ:0};const u=((phase%1)+1)%1*MOUNTED_KEYS.length,i=Math.floor(u),a=MOUNTED_KEYS[i],b=MOUNTED_KEYS[(i+1)%MOUNTED_KEYS.length],t=(u-i)*(u-i)*(3-2*(u-i)),result={};for(const k of ['hip','body','spine','head','handY','handZ'])result[k]=a[k]+(b[k]-a[k])*t;result.body+=Math.max(0,effort-.5)*.08;result.spine+=Math.max(0,effort-.5)*.05;return result;}
