import { useEffect, useRef, useState } from "react";
import {
  AGENTS, BUILDINGS, COURSES, STORAGE_KEY, makeInitialState, assignTask,
  advanceState, visitBuilding, setScene, toggleSeason, clearCompleted,
  validateSnapshot, snapshot, upgradeSnapshot, recordPractice
} from "./sim.js";
import { spawnWalkers, pathToBuilding, travelOneStep } from "./navigation.js";
import RoomInterior from "./RoomInterior.jsx";
import DeanOffice from "./DeanOffice.jsx";
import { transcript } from "./assessment.js";

const SCENES = [
  {id:"grounds",name:"Campus Grounds",symbol:"⌂",sub:"Explore the living town"},
  {id:"office",name:"BotOffice",symbol:"▦",sub:"Coordinate simulated work"},
  {id:"academy",name:"The Academy",symbol:"✦",sub:"Lessons and practica"}
];
const SCENE_COLORS={grounds:"#72b89e",office:"#7eacc4",academy:"#d6b27a"};
function role(id){return AGENTS.find(a=>a.id===id) || AGENTS[0];}
function readState() {
  try {
    const saved=localStorage.getItem(STORAGE_KEY);
    if(saved){const parsed=upgradeSnapshot(JSON.parse(saved)); if(parsed) return parsed;}
  } catch { /* Invalid or unavailable local storage starts a fresh simulation. */ }
  return makeInitialState();
}
function download(filename, content) {
  const blob=new Blob([content],{type:"application/json"});
  const url=URL.createObjectURL(blob);
  const link=document.createElement("a");
  link.href=url;
  link.download=filename;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
}
function Building({item,scene,onVisit}) {
  const color=SCENE_COLORS[scene];
  const isOffice=scene==="office";
  const {x,y,w,h}=item;
  return (
    <g role="button" tabIndex={0} aria-label={"Visit "+item.title} onClick={()=>onVisit(item.id)}
       onKeyDown={e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();onVisit(item.id);}}}
       className="svg-building">
      <rect x={x+8} y={y+12} width={w} height={h} rx="10" fill="#082533" opacity=".28"/>
      {!isOffice && <path d={"M "+(x-9)+" "+(y+14)+" L "+(x+w/2)+" "+(y-31)+" L "+(x+w+9)+" "+(y+14)+" Z"} fill={color} stroke="#243a48" strokeWidth="5"/>}
      <rect className="building-body" x={x} y={y+12} width={w} height={h-12} rx={isOffice?8:4} fill={isOffice?"#253b4a":"#f0e9d7"} stroke="#314653" strokeWidth="5"/>
      {Array.from({length:3},(_,i)=><rect key={i} x={x+20+i*(w-55)/3} y={y+42} width="29" height="32" rx="3" fill={isOffice?"#78c4c6":"#91bed2"} stroke="#4e7483" strokeWidth="3"/>)}
      <rect x={x+w/2-20} y={y+h-52} width="40" height="40" rx="3" fill={isOffice?"#63889b":"#af907c"} stroke="#304956" strokeWidth="3"/>
      <rect x={x+9} y={y+h-28} width={w-18} height="24" rx="3" fill="#142a3a" />
      <text x={x+w/2} y={y+h-11} textAnchor="middle" fontSize="16" fill="#f5f2e6" fontWeight="800" letterSpacing=".1">{item.title}</text>
      <title>{"Visit "+item.title+"; gain demo "+item.gain}</title>
    </g>
  );
}
function Character({agent,record,position,selected,working,onSelect,scene}) {
  const [x,y]=agent[scene];
  const shownX=position?.x??(x+(record?.dx||0));
  const shownY=position?.y??(y+(record?.dy||0));
  return (
    <g role="button" tabIndex={0} aria-label={"Select "+agent.name}
      className={"character"+(selected?" chosen":"")}
      onClick={()=>onSelect(agent.id)}
      onKeyDown={e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();onSelect(agent.id);}}}
      transform={"translate("+shownX+","+shownY+")"}>
      <ellipse cy="28" rx="26" ry="8" fill="#0e2530" opacity=".35"/>
      {selected&&<circle r="37" cy="-3" fill="none" stroke="#ffde8d" strokeWidth="4" strokeDasharray="7 5" className="halo"/>}
      <path d="M -18 -11 L -20 23 L 20 23 L 18 -11 Z" fill={agent.color} stroke="#263e4d" strokeWidth="4"/>
      <rect x="-22" y="-45" width="44" height="33" rx="11" fill="#f2f0e8" stroke="#293e4d" strokeWidth="4"/>
      <rect x="-17" y="-35" width="34" height="15" rx="5" fill="#253b49"/>
      <circle cx="-8" cy="-27" r="3.3" fill={agent.color}/>
      <circle cx="8" cy="-27" r="3.3" fill={agent.color}/>
      <path d="M 0 -45 L 0 -55" stroke="#293e4d" strokeWidth="4"/>
      <circle cy="-58" r="5" fill={agent.color} stroke="#293e4d" strokeWidth="2"/>
      <rect x="-14" y="22" width="9" height="10" rx="2" fill="#283e4d"/>
      <rect x="5" y="22" width="9" height="10" rx="2" fill="#283e4d"/>
      <text x="0" y="10" textAnchor="middle" fontSize="12" fontWeight="900" fill="#243d4a">{agent.initials}</text>
      <g className="agent-nameplate">
        <rect x="-39" y="36" width="78" height="21" rx="5" fill="#142b3a" stroke={agent.color} strokeWidth="2"/>
        <text x="0" y="51" textAnchor="middle" fontSize="13" fill="#f8f4e7" fontWeight="bold">{agent.name}</text>
      </g>
      {working&&<g transform="translate(26,-64)"><circle r="13" fill="#f9cb80" stroke="#293e4d" strokeWidth="3"/><text y="4" textAnchor="middle" fontSize="14" fill="#263e4d" fontWeight="bold">!</text></g>}
      <title>{agent.name+" · "+agent.role}</title>
    </g>
  );
}
function GroundsDecoration({season}) {
  const snowy=season==="winter";
  return <>
    <rect width="1050" height="640" fill={snowy?"#c1d9df":"#98cbb4"}/>
    <path d="M0 123 Q200 55 385 133 T770 118 T1050 90 L1050 0 L0 0Z" fill={snowy?"#a5c5d7":"#77b49d"} />
    <path d="M0 610 Q220 550 470 601 T1050 584 L1050 640 L0 640Z" fill={snowy?"#e3e8ec":"#71b29c"}/>
    <path d="M515 85 L515 610 M55 385 L1000 385" stroke={snowy?"#eef2ec":"#ead6ab"} strokeWidth="67" strokeLinecap="round" opacity=".9"/>
    <path d="M515 85 L515 610 M55 385 L1000 385" stroke="#ffffff" strokeWidth="3" strokeDasharray="10 13" opacity=".4"/>
    {Array.from({length:16},(_,i)=>{const x=50+(i%8)*127,y=i<8?86:580;return <g key={i} transform={"translate("+x+","+y+")"}><rect x="-4" y="-2" width="8" height="25" fill="#7c6e5a"/><circle cy="-9" r="24" fill={snowy?"#e4f0f2":i%2?"#5a987d":"#e4aa65"} stroke="#567c70" strokeWidth="3"/></g>;})}
    <rect x="19" y="18" width="244" height="46" rx="6" fill="#173e45" opacity=".93"/>
    <text x="33" y="48" fontSize="19" fontWeight="900" fill="#fff4d9">LAU · Living Town</text>
  </>;
}
function OfficeDecoration() {
  return <>
    <rect width="1050" height="640" fill="#557582"/>
    {Array.from({length:21},(_,i)=><path key={i} d={"M0 "+(i*32)+" H1050"} stroke="#7c98a1" strokeWidth="2" opacity=".4"/>)}
    {Array.from({length:32},(_,i)=><path key={i} d={"M"+(i*33)+" 0 V640"} stroke="#7c98a1" strokeWidth="2" opacity=".24"/>)}
    <rect x="34" y="68" width="980" height="530" rx="30" fill="#a0adb0" opacity=".2" stroke="#d9d6c7" strokeWidth="8"/>
    <path d="M525 68 V600 M34 365 H1014" stroke="#e8dcc6" strokeWidth="45" opacity=".65"/>
    <rect x="25" y="16" width="330" height="46" rx="6" fill="#192d42"/>
    <text x="39" y="47" fontSize="20" fontWeight="900" fill="#f1e6cf">BOTOFFICE · West Wing</text>
  </>;
}
function AcademyDecoration({season}) {
  return <>
    <rect width="1050" height="640" fill={season==="winter"?"#b8cfda":"#b8c7a4"}/>
    <path d="M0 55 H1050 V630 H0Z" fill="none" stroke="#dfdcbf" strokeWidth="14" strokeDasharray="10 8" opacity=".65"/>
    <path d="M500 65 V620 M95 365 H985" stroke="#eee0c3" strokeWidth="68" strokeLinecap="round"/>
    {Array.from({length:11},(_,i)=><circle key={i} cx={50+i*96} cy={i%2?96:589} r="19" fill={season==="winter"?"#eaf2f2":"#92b08b"} stroke="#7a9981" strokeWidth="3"/>)}
    <rect x="20" y="17" width="370" height="46" rx="6" fill="#344b48"/>
    <text x="34" y="47" fontSize="20" fontWeight="900" fill="#f9eac6">LAU ACADEMY · East Wing</text>
  </>;
}
function CampusMap({state,choose,visit,walkers}) {
  const scene=state.scene;
  return <svg className="campus-map" viewBox="0 0 1050 640" role="img" aria-label={"Interactive "+scene+" map with campus buildings and six agents"}>
    {scene==="grounds"?<GroundsDecoration season={state.season}/>:scene==="office"?<OfficeDecoration/>:<AcademyDecoration season={state.season}/>}
    {BUILDINGS[scene].map(b=><Building key={b.id} item={b} scene={scene} onVisit={visit}/>)}
    {AGENTS.map(a=>walkers[a.id]?.route.length>0
      ? <polyline key={"route-"+a.id} className="route-hint" points={[[walkers[a.id].x,walkers[a.id].y],...walkers[a.id].route].map(v=>v.x+","+v.y).join(" ")}/>
      : null)}
    {AGENTS.map(a=><Character key={a.id} agent={a} record={state.agents.find(s=>s.id===a.id)} position={walkers[a.id]} selected={state.selected===a.id} working={state.tasks.some(t=>t.role===a.id&&t.status==="working")} onSelect={choose} scene={scene}/>)}
  </svg>;
}
function Metric({label,value,sub,icon}) {
  return <div className="metric"><div className="metric-heading"><span>{label}</span><span aria-hidden="true">{icon}</span></div><strong>{value}</strong><small>{sub}</small></div>;
}
function App() {
  const [data,setData]=useState(readState);
  const [running,setRunning]=useState(false);
  const [speed,setSpeed]=useState(2200);
  const [taskTitle,setTaskTitle]=useState("");
  const [taskRole,setTaskRole]=useState("forge");
  const [notice,setNotice]=useState("");
  const [help,setHelp]=useState(false);
  const [deanCourse,setDeanCourse]=useState("orientation");
  const [walkers,setWalkers]=useState(()=>spawnWalkers(data.scene));
  const [travelling,setTravelling]=useState(null);
  const [room,setRoom]=useState(null);
  const travelSerial=useRef(0);
  const arrivedSerial=useRef(0);
  const upload=useRef(null);
  useEffect(()=>{
    if(!running) return undefined;
    const interval=setInterval(()=>setData(s=>advanceState(s)),speed);
    return ()=>clearInterval(interval);
  },[running,speed]);
  useEffect(()=>{
    if(!travelling)return undefined;
    const interval=setInterval(()=>{
      setWalkers(old=>{
        const actor=old[travelling.agentId];
        if(!actor||actor.route.length===0)return old;
        return {...old,[travelling.agentId]:travelOneStep(actor)};
      });
    },85);
    return ()=>clearInterval(interval);
  },[travelling]);
  useEffect(()=>{
    if(!travelling||data.scene!==travelling.scene)return;
    const actor=walkers[travelling.agentId];
    if(!actor||actor.arrived!==travelling.buildingId||arrivedSerial.current===travelling.serial)return;
    arrivedSerial.current=travelling.serial;
    setRoom({id:travelling.buildingId,scene:travelling.scene,agentId:travelling.agentId});
    setData(v=>visitBuilding(v,travelling.buildingId));
    setTravelling(null);
  },[travelling,walkers,data.scene]);

  function openDean(courseId="orientation"){
    setTravelling(null);
    setRoom({id:"dean",scene:"academy",agentId:data.selected});
    setWalkers(spawnWalkers("academy"));
    setDeanCourse(courseId);
    setData(s=>setScene(s,"academy"));
  }
  function submitPractice(courseId,agentId,answers){
    setData(s=>recordPractice(s,courseId,agentId,answers));
    notify("Practice answer sheet recorded as SIMULATED / UNVERIFIED.");
  }
  function changeScene(scene) {
    setTravelling(null);
    setRoom(null);
    setWalkers(spawnWalkers(scene));
    setData(s=>setScene(s,scene));
  }
  function enterBuilding(buildingId){
    const actorId=data.selected;
    const actor=walkers[actorId];
    if(!actor)return;
    const path=pathToBuilding(data.scene,actor,buildingId);
    if(!path.length){
      setRoom({id:buildingId,scene:data.scene,agentId:actorId});
      setData(s=>visitBuilding(s,buildingId));
      return;
    }
    const serial=++travelSerial.current;
    setRoom(null);
    setWalkers(prev=>({...prev,[actorId]:{...prev[actorId],route:path,destination:buildingId,arrived:null}}));
    setTravelling({serial,scene:data.scene,buildingId,agentId:actorId});
  }
  function cancelWalk(){
    if(travelling){
      const id=travelling.agentId;
      setWalkers(prev=>({...prev,[id]:{...prev[id],route:[],destination:null,arrived:null}}));
    }
    setTravelling(null);
  }
  function resetCampus(){
    setRunning(false);setTravelling(null);setRoom(null);setWalkers(spawnWalkers("grounds"));
    setData(makeInitialState());
    try{localStorage.removeItem(STORAGE_KEY);}catch{/* blocked */}
    notify("Campus reset.");
  }
  const completed=data.tasks.filter(t=>t.status==="done").length;
  const selected=role(data.selected);
  const selectedStats=data.agents.find(a=>a.id===selected.id);
  const working=data.tasks.find(t=>t.role===selected.id&&t.status==="working");
  const queued=data.tasks.filter(t=>t.status!=="done").length;
  const notify=(msg)=>setNotice(msg);
  const handleSave=()=>{try{localStorage.setItem(STORAGE_KEY,JSON.stringify(snapshot(data)));notify("Saved locally in this browser.");}catch{notify("Browser storage is unavailable. Try Export JSON.");}};
  const handleExport=()=>{try{download("lau-demo-snapshot.json",JSON.stringify(snapshot(data),null,2));notify("JSON exported to your device.");}catch{notify("Could not export this state.");}};
  const handleImport=async(e)=>{
    const file=e.target.files?.[0]; if(!file)return;
    setRunning(false);
    try{
      if(file.size>1200000)throw new Error("File is over 1.2 MB");
      const parsed=upgradeSnapshot(JSON.parse(await file.text()));
      if(!parsed)throw new Error("Invalid or unsupported LAU snapshot");
      setTravelling(null);setRoom(null);setWalkers(spawnWalkers(parsed.scene));
      setData(parsed);
      notify("Validated snapshot imported. Travel positions restart in this scene.");
    }catch(err){notify("Import rejected: "+err.message);}
    finally{e.target.value="";}
  };
  const handleAdd=(e)=>{e.preventDefault();if(!taskTitle.trim())return;const previous=data;const next=assignTask(previous,taskTitle,taskRole);if(next===previous){notify("Task must be 1-100 characters and the queue has room for 150.");return;}setData(next);setTaskTitle("");notify("Assignment queued as simulation.");};
  const handleReset=()=>{if(window.confirm("Reset this LAU demo? Browser save will be removed.")) resetCampus();};
  return <div className="app">
    <header className="site-header">
      <div className="identity"><div className="crest" aria-hidden="true"><span>LAU</span><small>✦</small></div><div><p className="overline">THE LIVING AGENT CAMPUS · EST. 2026</p><h1>LivingAgent<span>University</span></h1><p className="header-sub">Where little agents practice doing big things together.</p></div></div>
      <div className="header-actions"><span className="demo-pill"><span className="status-dot"/> SIMULATION ONLY · NO AI CONNECTED</span><button className="ghost-button" type="button" onClick={()=>setHelp(v=>!v)} aria-expanded={help}>How it works <span aria-hidden="true">ⓘ</span></button></div>
    </header>

    {help&&<section className="help-panel"><strong>Welcome to LAU.</strong> Explore three scenes, select an agent, then click a building to walk there and enter an illustrated room. Building visits add simulated resources; interiors can queue practica. Dean\u0027s Office lets humans choose demo answers and creates records; no model is evaluated. Press <b>Step</b> to advance one simulated tick, or <b>Play</b> to run automatically. Receipts mean a demo task completed, <b>not</b> that actual work happened. Nothing leaves this browser unless you export a file yourself.</section>}

    <section className="metrics" aria-label="Campus overview">
      <Metric label="DEMO ASSIGNMENTS" value={completed+" / "+data.tasks.length} sub="Completed simulated tasks" icon="▥"/>
      <Metric label="CAMPUS RESIDENTS" value="06" sub="Familiar faces, new halls" icon="♧"/>
      <Metric label="CAMPUS MORALE" value={data.morale+"%"} sub="Imaginary, but encouraging" icon="♡"/>
      <Metric label="SIMULATION TICKS" value={String(data.step).padStart(2,"0")} sub="No external activity" icon="◷"/>
    </section>

    <div className="columns">
      <main className="left-column">
        <section className="panel map-panel" aria-label="Campus map">
          <div className="panel-title-row"><div><p className="overline">EXPLORE THE GROUNDS</p><h2>Your campus is alive</h2></div><span className="chapter">CHAPTER 01 / LIVING WORLD</span></div>
          <div className="scene-tabs" role="tablist" aria-label="Campus areas">{SCENES.map(s=><button key={s.id} type="button" role="tab" aria-selected={data.scene===s.id} className={"scene-tab "+(data.scene===s.id?"active":"")} onClick={()=>changeScene(s.id)}><span aria-hidden="true">{s.symbol}</span>{s.name}</button>)}</div>
          <div className="map-frame">
            {room&&room.scene===data.scene&&room.id==="dean"
              ? <DeanOffice
                  key={deanCourse}
                  data={data}
                  initialCourse={deanCourse}
                  initialAgent={room.agentId}
                  onBack={()=>setRoom(null)}
                  onSubmit={submitPractice}
                />
              : room&&room.scene===data.scene
              ? <RoomInterior
                  building={BUILDINGS[room.scene].find(b=>b.id===room.id)}
                  scene={room.scene}
                  agent={role(room.agentId)}
                  onBack={()=>setRoom(null)}
                  onPractice={()=>{setData(s=>assignTask(s,"Practice at "+BUILDINGS[room.scene].find(b=>b.id===room.id).title,room.agentId,3));notify("Simulated practice assignment queued. No AI training occurred.");}}
                />
              : <CampusMap state={data} walkers={walkers} choose={id=>setData(s=>({...s,selected:id}))} visit={enterBuilding}/>}
            {travelling&&!room&&<div className="walking-banner" role="status">
              <span>{role(travelling.agentId).name} is walking to {BUILDINGS[travelling.scene].find(b=>b.id===travelling.buildingId)?.title}…</span>
              <button type="button" onClick={cancelWalk}>Cancel walk</button>
            </div>}
            {!room&&<div className="corner-note">{data.season.toUpperCase()} TERM <span>·</span> {data.scene.toUpperCase()}</div>}
            {!room&&<div className="map-bottom-note">Click a building or agent to interact <span>◈</span> All outcomes simulated</div>}
          </div>
          <div className="map-toolbar"><div className="transport"><button className="primary-button" onClick={()=>setRunning(r=>!r)}>{running?"Ⅱ Pause":"▶ Play"} simulation</button><button className="secondary-button" disabled={running} onClick={()=>setData(s=>advanceState(s))}>↻ Step</button><select aria-label="Simulation speed" value={speed} onChange={e=>setSpeed(Number(e.target.value))}><option value={1200}>Fast</option><option value={2200}>Normal</option><option value={3800}>Chill</option></select></div><button className="secondary-button" onClick={()=>setData(s=>toggleSeason(s))}>☁ Switch season</button></div>
          <p className="map-caption">Choose an agent, then click a building to watch them walk along the campus corridors and enter its illustrated interior. Walking positions restart on reload; task records persist with Save.</p>
        </section>

        <section className="panel academy-panel">
          <div className="panel-title-row"><div><p className="overline">CURRICULUM · PRACTICE MODE</p><h2>Course catalog</h2></div><span className="chapter">{COURSES.length} SHORT COURSES</span></div>
          <div className="courses">{COURSES.map((course,i)=><article className="course" key={course.id}><div className="course-head"><span className="course-number">0{i+1}</span><span className="course-category">{course.category}</span></div><h3>{course.title}</h3><p>{course.description}</p><div className="course-foot"><span>INSTRUCTOR · {role(course.role).name}</span><div className="course-actions"><button type="button" onClick={()=>{setData(s=>assignTask(s,"Practicum: "+course.title,course.role,3));notify("Demo practicum queued. No actual model training.");}}>Queue practicum ↗</button><button type="button" onClick={()=>openDean(course.id)}>Take demo assessment ↗</button></div></div></article>)}</div>
        </section>

        <section className="panel work-panel">
          <div className="panel-title-row"><div><p className="overline">PRACTICE ASSIGNMENTS</p><h2>Campus workboard</h2></div><span className="chapter">{queued} ACTIVE · {completed} DONE</span></div>
          <form className="task-form" onSubmit={handleAdd}><label className="sr-only" htmlFor="task-name">Assignment title</label><input id="task-name" placeholder="Give someone a demo assignment…" value={taskTitle} onChange={e=>setTaskTitle(e.target.value)} maxLength={100}/><label className="sr-only" htmlFor="task-agent">Assigned agent</label><select id="task-agent" value={taskRole} onChange={e=>setTaskRole(e.target.value)}>{AGENTS.map(a=><option key={a.id} value={a.id}>{a.name}</option>)}</select><button className="primary-button" type="submit">+ Assign</button></form>
          <div className="task-list">{data.tasks.length===0?<div className="empty">No assignments yet. Add one to get your campus moving.</div>:data.tasks.slice().reverse().map(t=><article className="task-row" key={t.id}><div className="task-id">#{String(t.id).padStart(2,"0")}</div><div className="task-main"><div className="task-name">{t.title}</div><div className="task-meta">{role(t.role).name} · {t.status==="done"?"demo task finished":t.effort-t.remaining+" of "+t.effort+" steps"} · SIMULATED</div>{t.status!=="done"&&<div className="progress-track"><span style={{width:((t.effort-t.remaining)/t.effort)*100+"%"}}/></div>}</div><span className={"task-state "+t.status}>{t.status}</span></article>)}</div>
          <div className="board-foot"><p>Completed demo work creates unverified receipts, not real-world deliverables.</p><button className="text-button" disabled={completed===0} onClick={()=>setData(s=>clearCompleted(s))}>Clear completed</button></div>
        </section>
      </main>

      <aside className="right-column">
        <section className="panel residents-panel"><div className="panel-title-row"><div><p className="overline">FAMILIAR FACES</p><h2>Campus residents</h2></div><span className="chapter">06 AGENTS</span></div><div className="residents">{AGENTS.map(a=><button key={a.id} type="button" className={"resident "+(data.selected===a.id?"active":"")} onClick={()=>setData(s=>({...s,selected:a.id}))}><span className="mini-avatar" style={{background:a.color}}>{a.initials}</span><span className="resident-info"><b>{a.name}</b><small>{a.role}</small></span><span className="resident-chevron">›</span></button>)}</div><div className="detail"><div className="detail-top"><span className="avatar-large" style={{background:selected.color}}>{selected.initials}</span><div><div className="detail-name">{selected.name}</div><div className="detail-role">{selected.role}</div></div></div><p>{selected.focus}.</p><p className="subtle">{working?"Simulated assignment underway: "+working.title:"Available for a demo assignment."}</p><div className="meter-label"><span>ENERGY</span><span>{selectedStats.energy}%</span></div><div className="meter"><span style={{width:selectedStats.energy+"%"}}/></div><div className="xp-caption">PRACTICE XP: {selectedStats.xp} <span>·</span> MODEL: NOT CONNECTED</div></div></section>

        <section className="panel resources-panel"><div className="panel-title-row"><div><p className="overline">CAMPUS SUPPLIES</p><h2>Resources</h2></div></div><div className="resource-grid">{Object.entries(data.resources).map(([name,value])=><div className="resource-tile" key={name}><strong>{value}</strong><span>{name}</span></div>)}</div><p className="subtle resources-note">These are game resources. No money or compute is being used.</p></section>

        <section className="panel students-panel">
          <div className="panel-title-row"><div><p className="overline">DEAN COHERENCE · REGISTRAR</p><h2>Student records</h2></div><span className="chapter">DEMO CREDENTIALS ONLY</span></div>
          <div className="student-card">
            <div><strong>{selected.name}'s transcript</strong><span>{transcript(data.assessments,selected.id).passed} / 6 demo practice passes · {transcript(data.assessments,selected.id).attempts} attempts</span></div>
            <p>No verified AI competencies or graduation credentials are awarded by this simulator.</p>
            <button className="primary-button" type="button" onClick={()=>openDean()}>Visit the Dean's Office ↗</button>
          </div>
        </section>

        <section className="panel ledger-panel"><div className="panel-title-row"><div><p className="overline">LEDGER ABOVE EGO</p><h2>Evidence & activity</h2></div><span className="chapter">{data.receipts.length} RECEIPTS</span></div><div className="receipt-label">PROVENANCE RULE: DEMO ≠ VERIFIED</div>
          {data.assessments.length>0&&<div className="assessment-receipts"><div className="event-head">OPERATOR-SELECTED PRACTICE RECORDS · {data.assessments.length}</div>{data.assessments.slice(-3).reverse().map(r=><div className="practice-receipt" key={r.id}><strong>{r.id}</strong><span>{r.courseId} · {r.agentId} · {r.score}%</span><small>SIMULATED / UNVERIFIED · NOT A MODEL EVALUATION</small></div>)}</div>}{data.receipts.length>0&&<div className="receipts">{data.receipts.slice(0,5).map((r,i)=><div className="receipt" key={i}><div><b>{r.id}</b><span>SIMULATED / UNVERIFIED</span></div><p>{r.title}</p><small>{role(r.agent).name} · step {r.step}</small></div>)}</div>}<div className="event-head">CAMPUS JOURNAL</div><div className="event-log" aria-live="polite">{data.log.slice(0,12).map((line,i)=><div className={"event "+line.kind} key={i}><span>{line.at}</span><p>{line.msg}</p></div>)}</div></section>

        <section className="panel files-panel"><div className="panel-title-row"><div><p className="overline">YOUR CAMPUS, YOUR DATA</p><h2>Save & portability</h2></div></div><div className="file-actions"><button className="secondary-button" onClick={handleSave}>↓ Save here</button><button className="secondary-button" onClick={handleExport}>⇩ Export JSON</button><button className="secondary-button" onClick={()=>upload.current?.click()}>⇧ Import JSON</button><input ref={upload} type="file" accept=".json,application/json" className="sr-only" onChange={handleImport}/></div><button className="text-button reset-link" onClick={handleReset}>Reset campus demo</button><p className="subtle">Local browser storage only. No accounts or servers.</p></section>
      </aside>
    </div>
    {notice&&<div className="toast" role="status">{notice}<button type="button" aria-label="Dismiss notification" onClick={()=>setNotice("")}>×</button></div>}
    <footer className="site-footer"><div><b>LAU</b> · LivingAgentUniversity · MIT open source</div><div>SIMULATED CAMPUS v0.3 <span>✦</span> BUILT WITH CURIOSITY, GOVERNED BY EVIDENCE</div></footer>
  </div>;
}
export default App;
