export function mobileDevice(){return (typeof innerWidth==='number'&&innerWidth<750)||(typeof matchMedia==='function'&&matchMedia('(pointer: coarse)').matches);}
export function graphicsProfile(high=!mobileDevice(),mobile=mobileDevice()){
 return {high,pixelRatio:Math.min(typeof devicePixelRatio==='number'?devicePixelRatio:1,high?(mobile?1.5:2):1),shadows:high,shadowSize:high?2048:1024,maxFps:mobile?30:60};
}
