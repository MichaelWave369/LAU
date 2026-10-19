import { useRef,useState } from "react";
import { AGENTS, COURSES } from "./sim.js";
import { MODEL_RE, inspectEvidence } from "./evidence.js";

export default function LivingClassroom({reports,onImportReports}) {
  const [model,setModel]=useState("granite4.2:8b");
  const [course,setCourse]=useState("records");
  const [agent,setAgent]=useState("vault");
  const [trials,setTrials]=useState(3);
  const [notice,setNotice]=useState("");
  const input=useRef(null);
  const latest=reports.at(-1)||null;
  const command=["npm run evaluate -- --model",model,course==="all"?"--all":"--courses "+course,"--trials",trials,"--agent",agent].join(" ");
  const canCopy=MODEL_RE.test(model);
  const doImport=async event=>{
    const files=Array.from(event.target.files||[]);
    if(!files.length)return;
    try{
      if(files.length>30)throw new Error("Select at most 30 reports at once");
      const parsed=[];
      for(const file of files){
        if(file.size>30000)throw new Error(file.name+" exceeds the 30 KB per-report limit");
        const report=JSON.parse(await file.text());
        const check=await inspectEvidence(report);
        if(!check.ok)throw new Error(file.name+": "+check.reason);
        parsed.push(report);
      }
      if(!onImportReports(parsed))throw new Error("Duplicate ID, invalid batch, or 80-report limit reached");
      setNotice(parsed.length+" report(s) imported after individual hash/rubric checks. Source remains UNVERIFIED.");
    }catch(error){setNotice("Import rejected (no records added): "+(error?.message||"Unexpected error"));}
    finally{event.target.value="";}
  };
  return <section className="panel living-panel" aria-label="Living Classroom">
    <div className="panel-title-row">
      <div><p className="overline">LAU V0.5 · SUPERVISED LOCAL EVALUATION</p><h2>The Living Classroom</h2></div>
      <span className="chapter">LOCAL OLLAMA · IMPORT ONLY</span>
    </div>
    <div className="living-body">
      <div className="living-warning"><strong>No browser-to-PC connection.</strong> Run up to 30 sequential evaluations on your PC and import their reports. This public site never contacts Ollama directly.</div>
      <div className="living-steps"><span>01 · Plan a batch</span><span>02 · Run locally</span><span>03 · Import reports</span></div>
      <div className="living-settings">
        <label>INSTALLED OLLAMA MODEL
          <input value={model} maxLength={100} onChange={e=>setModel(e.target.value.trim())} list="lau-model-options" spellCheck={false} aria-invalid={!canCopy}/>
          <datalist id="lau-model-options"><option value="granite4.2:8b"/><option value="qwen3.5:9b"/><option value="gemma3:12b"/></datalist>
        </label>
        <label>COURSE
          <select value={course} onChange={e=>setCourse(e.target.value)}><option value="all">All six courses</option>{COURSES.map(c=><option value={c.id} key={c.id}>{c.title}</option>)}</select>
        </label>
        <label>RESIDENT LABEL
          <select value={agent} onChange={e=>setAgent(e.target.value)}>{AGENTS.map(a=><option value={a.id} key={a.id}>{a.name}</option>)}</select>
        </label>
        <label>REPEAT EACH COURSE
          <select value={trials} onChange={e=>setTrials(Number(e.target.value))}>{[1,2,3,4,5].map(n=><option value={n} key={n}>{n} trial{n===1?"":"s"}</option>)}</select>
        </label>
      </div>
      <p className="living-direction">Clone LAU to the same PC running Ollama, then execute this command in the repository folder. It makes {course==="all"?6*trials:trials} sequential, bounded local generation request(s), writes one JSON file per completed call to <code>reports/</code>, and performs no tool calls.</p>
      {canCopy?<pre className="living-command">{command}</pre>:<p className="living-invalid">Model name is not a valid Ollama tag.</p>}
      <div className="living-buttons">
        <button className="secondary-button" type="button" disabled={!canCopy} onClick={()=>{
          navigator.clipboard.writeText(command).then(()=>setNotice("Copied local command."),()=>setNotice("Clipboard unavailable. Select and copy the command manually."));
        }}>Copy evaluation command</button>
        <button className="primary-button" type="button" onClick={()=>input.current?.click()}>↑ Import report JSONs</button>
        <input type="file" multiple accept=".json,application/json" className="sr-only" ref={input} onChange={doImport}/>
      </div>
      {notice&&<p className="living-notice" role="status">{notice}</p>}
      <div className="living-results"><div className="living-results-head"><strong>Imported local reports</strong><span>{reports.length} · ALL UNVERIFIED</span></div>
        {latest?<article className="living-evidence">
          <div className="living-evidence-title"><strong>{latest.courseId} · {latest.model}</strong><span>{latest.status==="GRADED"?latest.grade.score+"% rubric match":"Invalid response"}</span></div>
          <p>Resident label: {latest.agentId} · Reported runtime: {latest.timingMs} ms · {latest.generatedAt.slice(0,10)}</p>
          <p className="living-provenance">LOCAL RUNNER REPORTED · FILE HASH MATCHED ON IMPORT · SOURCE NOT AUTHENTICATED · UNVERIFIED</p>
          <details><summary>Inspect original model response</summary><pre>{latest.response}</pre></details>
        </article>:<p className="living-empty">No local reports yet. Your demonstration gradebook remains separate from imported model-output evidence.</p>}
      </div>
      <p className="living-disclaimer">These reports summarize responses to a small, fixed multiple-choice rubric. Repeated exposure may encourage memorization and cannot establish general competence. A SHA-256 match detects alterations; it is not a signature, independent audit, training event, or certified capability. Never upload secrets.</p>
    </div>
  </section>;
}
