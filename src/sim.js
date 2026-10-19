import { createPracticeRecord, validPracticeRecord } from "./assessment.js";
import { validateImportedReports } from "./evidence.js";

export const VERSION = 3;
export const STORAGE_KEY = "lau-campus-v01";

export const AGENTS = Object.freeze([
  { id:"forge", name:"Forge", role:"Builder / Engineer", focus:"Build things that work", color:"#f7aa7c", initials:"FG", grounds:[205,330], office:[195,335], academy:[205,360] },
  { id:"coherence", name:"Coherence", role:"Dean / Coordinator", focus:"Connect people and plans", color:"#92c7fa", initials:"CO", grounds:[490,250], office:[455,310], academy:[475,250] },
  { id:"scout", name:"Scout", role:"Research Fellow", focus:"Investigate and cite evidence", color:"#b5e1aa", initials:"SC", grounds:[730,310], office:[725,295], academy:[730,315] },
  { id:"rook", name:"Rook", role:"Campus Operations", focus:"Keep systems safe", color:"#c5b6fa", initials:"RK", grounds:[265,500], office:[280,510], academy:[265,505] },
  { id:"nyx", name:"Nyx", role:"Creative Instructor", focus:"Invent, explore and design", color:"#f4b7cf", initials:"NX", grounds:[795,490], office:[770,495], academy:[790,480] },
  { id:"vault", name:"VaultBot", role:"Records Keeper", focus:"Preserve the true ledger", color:"#f5d68f", initials:"VB", grounds:[530,470], office:[535,475], academy:[520,515] }
]);

export const COURSES = Object.freeze([
  { id:"orientation", title:"Agent Orientation", category:"Foundations", role:"coherence", description:"Roles, permissions, and how to report uncertainty." },
  { id:"fieldcraft", title:"Build & Debug Lab", category:"Engineering", role:"forge", description:"Practice planning and testable deliverables." },
  { id:"research", title:"Source & Evidence", category:"Research", role:"scout", description:"Distinguish claims, sources, and observed outcomes." },
  { id:"safety", title:"Permission Boundaries", category:"Operations", role:"rook", description:"Study approvals, limits, and safe escalation." },
  { id:"design", title:"Creative Commons", category:"Design", role:"nyx", description:"Prototype and explain new ideas collaboratively." },
  { id:"records", title:"Ledger Above Ego", category:"Accountability", role:"vault", description:"Practice clear receipts and provenance labels." }
]);

export const BUILDINGS = Object.freeze({
  grounds: [
    { id:"hall", title:"Welcome Hall", x:120, y:165, w:225, h:130, gain:"Morale", subtitle:"Meet the team" },
    { id:"library", title:"Library", x:405, y:125, w:205, h:125, gain:"Knowledge", subtitle:"Open learning" },
    { id:"workshop", title:"Maker Yard", x:700, y:180, w:235, h:135, gain:"Materials", subtitle:"Build and experiment" },
    { id:"commons", title:"The Commons", x:380, y:395, w:240, h:125, gain:"Morale", subtitle:"Community first" },
    { id:"observatory", title:"Observatory", x:735, y:400, w:175, h:110, gain:"Compute", subtitle:"Look outward" }
  ],
  office: [
    { id:"engineering", title:"Engineering", x:115, y:185, w:210, h:150, gain:"Materials", subtitle:"Build bench" },
    { id:"council", title:"Planning Room", x:380, y:150, w:250, h:145, gain:"Morale", subtitle:"The stand-up" },
    { id:"research", title:"Research", x:685, y:160, w:230, h:160, gain:"Knowledge", subtitle:"Field notes" },
    { id:"ops", title:"Operations", x:125, y:400, w:225, h:145, gain:"Compute", subtitle:"Health and safety" },
    { id:"records", title:"Records Vault", x:415, y:400, w:250, h:145, gain:"Records", subtitle:"Evidence ledger" },
    { id:"design", title:"Design Studio", x:715, y:410, w:210, h:140, gain:"Morale", subtitle:"Creative tools" }
  ],
  academy: [
    { id:"lecture", title:"Lecture Hall", x:130, y:175, w:245, h:145, gain:"Knowledge", subtitle:"Theory and questions" },
    { id:"lab", title:"Practicum Lab", x:445, y:160, w:255, h:170, gain:"Compute", subtitle:"Exercises and tests" },
    { id:"archive", title:"Evidence Wing", x:745, y:190, w:215, h:140, gain:"Records", subtitle:"Accountability" },
    { id:"garden", title:"Reflection Garden", x:365, y:420, w:330, h:130, gain:"Morale", subtitle:"Rest and connect" },
    { id:"dean", title:"Dean\u0027s Office", x:87, y:428, w:220, h:120, gain:"Records", subtitle:"Student records & practice assessments" }
  ]
});

const IDS = new Set(AGENTS.map(a=>a.id));
const SCENES = new Set(Object.keys(BUILDINGS));
const STATUS = new Set(["queued","working","done"]);

export function makeInitialState() {
  return {
    version:VERSION, scene:"grounds", season:"autumn", step:0, selected:"forge",
    morale:78, resources:{ Materials:16, Knowledge:24, Compute:12, Records:3 },
    agents:AGENTS.map(a=>({id:a.id, energy:85, xp:0, dx:0, dy:0})),
    tasks:[
      {id:1,title:"Draw the LAU campus plan",role:"nyx",status:"queued",remaining:3,effort:3},
      {id:2,title:"Map campus security boundaries",role:"rook",status:"queued",remaining:4,effort:4}
    ],
    receipts:[], assessments:[], localRuns:[], log:[{at:"00:00",kind:"info",msg:"LAU opened. Everything here is SIMULATED until a real adapter is connected."}]
  };
}
function stamp() { return new Date().toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"}); }
function copy(s) { return structuredClone(s); }
function event(s,msg,kind="info") {
  s.log.unshift({at:stamp(),kind,msg});
  s.log=s.log.slice(0,80);
}
export function assignTask(state, title, role, effort=3) {
  const cleaned=String(title).trim();
  if (!cleaned || cleaned.length>100 || !IDS.has(role) || !Number.isInteger(effort) || effort<1 || effort>10 || state.tasks.length>=150) return state;
  const s=copy(state);
  const id=Math.max(0,...s.tasks.map(t=>t.id))+1;
  s.tasks.push({id,title:cleaned,role,status:"queued",remaining:effort,effort});
  event(s,"Queued demo task #"+id+" for "+AGENTS.find(a=>a.id===role).name+": "+cleaned);
  return s;
}
export function advanceState(state) {
  const s=copy(state);
  s.step++;
  const task=s.tasks.find(t=>t.status==="working") || s.tasks.find(t=>t.status==="queued");
  if (!task) {
    const a=s.agents[s.step % s.agents.length];
    a.energy=Math.min(100,a.energy+2);
    event(s,"No assignments queued. "+AGENTS.find(r=>r.id===a.id).name+" is taking a break.");
    return s;
  }
  const a=s.agents.find(a=>a.id===task.role);
  if (task.status==="queued") {
    task.status="working";
    event(s,AGENTS.find(r=>r.id===task.role).name+" started simulated assignment #"+task.id+".");
  }
  task.remaining=Math.max(0,task.remaining-1);
  a.energy=Math.max(15,a.energy-2);
  a.xp++;
  a.dx=[-10,6,12,0][s.step%4];
  a.dy=[0,-8,4,8][s.step%4];
  if (task.remaining===0) {
    task.status="done";
    const id="DEMO-"+String(s.receipts.length+1).padStart(4,"0");
    s.receipts.unshift({id,taskId:task.id,title:task.title,agent:task.role,at:stamp(),step:s.step,origin:"SIMULATED",verified:false});
    s.resources.Records++;
    s.morale=Math.min(100,s.morale+1);
    event(s,"Demo task #"+task.id+" finished. "+id+" issued (SIMULATED, UNVERIFIED).","receipt");
  } else {
    event(s,"Simulated progress: "+task.title+" ("+(task.effort-task.remaining)+"/"+task.effort+").");
  }
  return s;
}
export function visitBuilding(state, buildingId) {
  const b=BUILDINGS[state.scene].find(b=>b.id===buildingId);
  if (!b) return state;
  const s=copy(state);
  if (b.gain==="Morale") s.morale=Math.min(100,s.morale+2);
  else s.resources[b.gain]++;
  event(s,"Visited "+b.title+". +"+(b.gain==="Morale"?2:1)+" SIMULATED "+b.gain+".");
  return s;
}
// Results come only from a human selecting answers in the demo classroom.
// Never issue verified model credentials from these records.
export function recordPractice(state,courseId,agentId,answers,at=new Date().toISOString()){
  if(!IDS.has(agentId)||!Array.isArray(state.assessments)||state.assessments.length>=200)return state;
  const nextNumber=Math.max(0,...state.assessments.map(r=>Number(r.id.slice(6))))+1;
  const attempt=createPracticeRecord(courseId,agentId,answers,nextNumber,at);
  if(!attempt||!validPracticeRecord(attempt,IDS))return state;
  const s=copy(state);
  s.assessments.push(attempt);
  s.resources.Records=Math.min(1000000,s.resources.Records+1);
  event(s,"Operator entered demo answers for "+agentId+" in "+courseId+": "+attempt.score+"% ("+(attempt.passed?"demo pass":"retry")+"). SIMULATED / UNVERIFIED.","receipt");
  return s;
}
// A file import is a user-selected claim about a local run; it is NOT independent verification.
export function addLocalReport(state,record){
  if(!validateImportedReports([record])||!Array.isArray(state.localRuns)||
    state.localRuns.length>=80||state.localRuns.some(r=>r.id===record.id))return state;
  const next=copy(state);
  next.localRuns.push(record);
  event(next,"Imported local runner REPORT for "+record.agentId+": "+record.courseId+" ("+
    (record.grade?.score??"invalid response")+"). Origin unverified; hash-checked on import.","receipt");
  return next;
}
export function setScene(state,scene) { return SCENES.has(scene)?{...state,scene}:state; }
export function toggleSeason(state) { return {...state,season:state.season==="autumn"?"winter":"autumn"}; }
export function clearCompleted(state) {
  const s=copy(state);
  s.tasks=s.tasks.filter(t=>t.status!=="done");
  event(s,"Cleared completed tasks from board; receipt history preserved.");
  return s;
}
const numeric=(x,min,max)=>Number.isSafeInteger(x)&&x>=min&&x<=max;
const short=(x,max)=>typeof x==="string"&&x.length<=max;
export function validateSnapshot(s) {
  if (!s || typeof s!=="object" || s.version!==VERSION || !SCENES.has(s.scene) || !["autumn","winter"].includes(s.season)
      || !numeric(s.step,0,1000000) || !numeric(s.morale,0,100) || !IDS.has(s.selected)) return false;
  if (!s.resources || !["Materials","Knowledge","Compute","Records"].every(k=>numeric(s.resources[k],0,1000000))) return false;
  if (!Array.isArray(s.agents)||s.agents.length!==AGENTS.length||
      !AGENTS.every(role=>s.agents.some(a=>a&&a.id===role.id&&numeric(a.energy,0,100)&&numeric(a.xp,0,1000000)&&numeric(a.dx,-30,30)&&numeric(a.dy,-30,30)))) return false;
  if (!Array.isArray(s.tasks)||s.tasks.length>150||!s.tasks.every(t=>t&&numeric(t.id,1,10000000)&&short(t.title,100)&&t.title.trim().length>0&&IDS.has(t.role)
      &&STATUS.has(t.status)&&numeric(t.remaining,0,10)&&numeric(t.effort,1,10)&&t.remaining<=t.effort)) return false;
  if (new Set(s.tasks.map(t=>t.id)).size!==s.tasks.length) return false;
  if (!Array.isArray(s.receipts)||s.receipts.length>2000||!s.receipts.every(r=>r&&short(r.id,24)&&short(r.title,100)&&IDS.has(r.agent)&&short(r.at,50)&&numeric(r.step,0,1000000)&&r.origin==="SIMULATED"&&r.verified===false)) return false;
  if(!Array.isArray(s.assessments)||s.assessments.length>200||
      !s.assessments.every(r=>validPracticeRecord(r,IDS)))return false;
  if(new Set(s.assessments.map(r=>r.id)).size!==s.assessments.length)return false;
  if(!validateImportedReports(s.localRuns))return false;
  if (!Array.isArray(s.log)||s.log.length>80||!s.log.every(e=>e&&short(e.at,50)&&short(e.msg,240)&&["info","receipt"].includes(e.kind))) return false;
  return true;
}
// Preserve earlier browser saves without turning legacy simulation into "real" evidence.
export function upgradeSnapshot(raw){
  if(!raw||typeof raw!=="object")return null;
  if(raw.version===VERSION)return validateSnapshot(raw)?raw:null;
  if(raw.version===2&&!Object.prototype.hasOwnProperty.call(raw,"localRuns")){
    const upgraded={...raw,version:VERSION,localRuns:[]};
    return validateSnapshot(upgraded)?upgraded:null;
  }
  if(raw.version===1&&!Object.prototype.hasOwnProperty.call(raw,"assessments")&&
    !Object.prototype.hasOwnProperty.call(raw,"localRuns")){
    const upgraded={...raw,version:VERSION,assessments:[],localRuns:[]};
    return validateSnapshot(upgraded)?upgraded:null;
  }
  return null;
}
export function snapshot(state) {
  const data=copy(state);
  if (!validateSnapshot(data)) throw new Error("Invalid campus state");
  return data;
}
