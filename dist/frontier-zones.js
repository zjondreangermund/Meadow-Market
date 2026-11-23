export const SAFE_LINE=34;
export const RED_LINE=70;
export function zoneAt(x){return x<SAFE_LINE?'safe':x<RED_LINE?'frontier':'red';}
