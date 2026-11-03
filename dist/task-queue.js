// Session-only FIFO: queued work continues while the game is open.
export class TaskQueue{
 constructor(start,changed=()=>{},limit=20){this.start=start;this.changed=changed;this.limit=limit;this.waiting=[];this.active=null;this.nextId=1;}
 get busy(){return !!this.active;}
 enqueue(job){if(this.waiting.length>=this.limit)throw Error('Queue is full. Wait for a task to finish.');if(job.key&&[this.active,...this.waiting].some(x=>x?.key===job.key))throw Error('That task is already active or queued.');const entry={...job,id:this.nextId++};this.waiting.push(entry);this.changed();this.pump();return entry;}
 pump(){if(this.active||!this.waiting.length)return;this.active=this.waiting.shift();this.changed();try{this.start(this.active);}catch(e){this.finish(e);}}
 finish(error=null){const done=this.active;if(!done)return;this.active=null;this.changed(done,error);this.pump();}
 remove(id){this.waiting=this.waiting.filter(x=>x.id!==id);this.changed();}
 clearWaiting(){this.waiting=[];this.changed();}
}
