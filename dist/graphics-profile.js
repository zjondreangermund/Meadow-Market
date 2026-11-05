export function mobileDevice(){return (typeof innerWidth==='number'&&innerWidth<750)||(typeof matchMedia==='function'&&matchMedia('(pointer: coarse)').matches);}
export function graphicsProfile(high=false,mobile=mobileDevice()){
 return {high,pixelRatio:Math.min(typeof devicePixelRatio==='number'?devicePixelRatio:1,high?(mobile?1.5:1.5):1),shadows:high,shadowSize:high?(mobile?512:1024):512,maxFps:mobile?30:60};
}
