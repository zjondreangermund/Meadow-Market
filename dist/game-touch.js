// Suppress browser text selection/callouts only on the game surface.
export function installGameTouch(surface){
 const prevent=event=>event.preventDefault();
 for(const type of ['contextmenu','selectstart','dragstart'])surface.addEventListener?.(type,prevent);

}
