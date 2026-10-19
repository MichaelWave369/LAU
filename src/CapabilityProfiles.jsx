import {useState} from "react";
import {COURSES} from "./sim.js";
import {buildCapabilityProfiles} from "./profiles.js";

const titleFor=id=>COURSES.find(c=>c.id===id)?.title||id;
export default function CapabilityProfiles({reports}){
  const profiles=buildCapabilityProfiles(reports);
  const [choice,setChoice]=useState("");
  const selected=profiles.find(p=>p.model===choice)||profiles[0];
  return <section className="panel profile-panel" aria-label="Reported model capability profiles">
    <div className="panel-title-row">
      <div><p className="overline">LAU V0.5 · EVIDENCE BEFORE CLAIMS</p><h2>Model capability profiles</h2></div>
      <span className="chapter">DESCRIPTIVE · UNVERIFIED</span>
    </div>
    <div className="profile-body">
      <p className="profile-intro">These are <strong>reported local model outputs</strong>, not certificates, skill rankings or independently verified performance. Each sample is one imported classroom response. Repeating the same questions does not constitute generalization testing.</p>
      {profiles.length===0?
        <div className="profile-empty">No imported model reports yet. Run an opt-in local evaluation and import its JSON files above. Demo student transcript scores are deliberately excluded.</div>:
        <>
          <label className="profile-select">REPORTED MODEL TAG
            <select value={selected.model} onChange={e=>setChoice(e.target.value)}>
              {profiles.map(p=><option key={p.model} value={p.model}>{p.model}</option>)}
            </select>
          </label>
          <div className="profile-metrics">
            <div><strong>{selected.total}</strong><span>Reported samples</span></div>
            <div><strong>{selected.valid}</strong><span>Parseable answers</span></div>
            <div><strong>{selected.invalid}</strong><span>Invalid answers</span></div>
            <div><strong>{selected.formatRate}%</strong><span>Valid-response rate</span></div>
          </div>
          <div className="profile-course-list">
            {COURSES.map(course=>{
              const row=selected.courses.find(c=>c.courseId===course.id);
              return <article className="profile-course" key={course.id}>
                <div className="profile-course-title"><strong>{titleFor(course.id)}</strong><span>{row?row.runs+" reported run"+(row.runs===1?"":"s"):"NOT TESTED"}</span></div>
                {row?<>
                  <div className="profile-bars" aria-label={"Valid JSON choices in "+row.valid+" of "+row.runs+" responses"}>
                    <span style={{width:row.formatRate+"%"}}/>
                  </div>
                  <div className="profile-course-details">
                    <span>{row.valid} valid · {row.invalid} invalid</span>
                    <span>{row.mean===null?"No gradeable samples":"Mean "+row.mean+"% · Median "+row.median+"%"}</span>
                  </div>
                  <div className="profile-course-details">
                    <span>{row.mean===null?"No score range":"Rubric match range "+row.worst+"–"+row.best+"%"}</span>
                    <span>{row.passCount} / {row.runs} sample runs at ≥67%</span>
                  </div>
                  {row.rubricVariants>1&&<p className="profile-mixed">Mixed question versions ({row.rubricVariants} hashes). Scores may not be comparable.</p>}
                </>:<p className="profile-untested">No report has been imported for this course and model tag.</p>}
              </article>;
            })}
          </div>
          <p className="profile-disclaimer">A local JSON file can be forged even with valid SHA-256 hashes. The tag is self-reported; sample counts do not establish model identity. These are fixed, disclosed multiple-choice questions and may be memorized. Verified competencies: <strong>0</strong>.</p>
        </>
      }
    </div>
  </section>;
}
