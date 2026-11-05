export const HOUR=3600000;
export function growthProgress(job,day,now=Date.now()){if(!job)return 0;const days=Math.max(1,(job.readyDay??day+1)-(job.startedDay??day)),duration=job.durationMs||days*24*HOUR,elapsed=Math.max(Number.isFinite(job.startedAt)?now-job.startedAt:0,Math.max(0,day-(job.startedDay??day))*24*HOUR);return Math.max(0,Math.min(1,elapsed/duration));}
export const growthReady=(job,day,now=Date.now())=>!!job&&growthProgress(job,day,now)>=1;
