import { useState } from "react";
import { AGENTS, COURSES } from "./sim.js";
import { EXERCISES, PASS_SCORE, transcript } from "./assessment.js";

const agentName=id=>AGENTS.find(a=>a.id===id)?.name||"Unknown agent";
const courseName=id=>COURSES.find(c=>c.id===id)?.title||"Unknown course";

export default function DeanOffice({data,initialAgent,initialCourse,onBack,onSubmit}) {
  const [agentId,setAgentId]=useState(initialAgent);
  const [courseId,setCourseId]=useState(initialCourse);
  const [answers,setAnswers]=useState({});
  const [review,setReview]=useState(false);
  const course=EXERCISES.find(ex=>ex.id===courseId)||EXERCISES[0];
  const records=data.assessments||[];
  const stats=transcript(records,agentId);
  const completed=course.questions.every(q=>typeof answers[q.id]==="string");
  const last=review?records.filter(r=>r.agentId===agentId&&r.courseId===course.id).at(-1):null;
  const changeCourse=id=>{setCourseId(id);setAnswers({});setReview(false);};
  const changeAgent=id=>{setAgentId(id);setAnswers({});setReview(false);};
  const submit=e=>{
    e.preventDefault();
    if(!completed)return;
    const selected=course.questions.map(q=>answers[q.id]);
    onSubmit(course.id,agentId,selected);
    setReview(true);
  };
  return <div className="dean-console">
    <header className="dean-top">
      <div className="dean-seal" aria-hidden="true">LAU<span>★</span></div>
      <div className="dean-intro">
        <span className="interior-kicker">THE ACADEMY · OFFICE OF DEAN COHERENCE</span>
        <h3>Dean's Office & Student Records</h3>
        <p>Fixed-rubric operator-controlled practice. This never evaluates or trains a connected AI model.</p>
      </div>
      <button type="button" className="secondary-button" onClick={onBack}>← Back to campus</button>
    </header>
    <div className="dean-notice">DEMONSTRATION ONLY · Answers are chosen by the human operator · All assessments remain SIMULATED / UNVERIFIED</div>
    <div className="dean-forms">
      <label>STUDENT RECORD
        <select value={agentId} onChange={e=>changeAgent(e.target.value)}>{AGENTS.map(a=><option key={a.id} value={a.id}>{a.name} · {a.role}</option>)}</select>
      </label>
      <label>COURSE ASSESSMENT
        <select value={courseId} onChange={e=>changeCourse(e.target.value)}>{COURSES.map(c=><option key={c.id} value={c.id}>{c.title}</option>)}</select>
      </label>
    </div>
    <div className="dean-records">
      <div className="dean-record-head"><div><span className="interior-kicker">ACADEMIC PRACTICE TRANSCRIPT</span><h4>{agentName(agentId)}'s record</h4></div><div className="dean-score">{stats.passed}<small>/ 6 DEMO PASSES</small></div></div>
      <p>Practice attempts: {stats.attempts}. Verified model credentials: <strong>0</strong>. Passing uses a fixed rubric ({PASS_SCORE}% or better); a passing mark is not proof of independent model competence.</p>
      <div className="dean-transcript">{stats.courses.map(c=><div key={c.courseId} className="dean-course-line">
        <strong>{courseName(c.courseId)}</strong><span>{c.attempts} attempt{c.attempts===1?"":"s"} · Best {c.attempts?c.best+"%":"—"}</span><span className={c.practicePass?"demo-pass":"demo-notyet"}>{c.practicePass?"DEMO PASS":"NOT PASSED"}</span>
      </div>)}</div>
    </div>
    <form className="dean-quiz" onSubmit={submit}>
      <div className="dean-section-title"><div><span className="interior-kicker">INTERACTIVE DEMO ASSESSMENT</span><h4>{courseName(courseId)}</h4></div><span>3 questions · {PASS_SCORE}% pass mark</span></div>
      <p>Choose the hypothetical agent's answer to each scenario. Scoring measures only the choices entered here, not AI behavior.</p>
      {course.questions.map((q,i)=><fieldset className="dean-question" key={q.id}>
        <legend><span>QUESTION {i+1}</span> {q.prompt}</legend>
        <div className="dean-options">{q.options.map(option=><label key={option.id} className={"dean-choice"+(answers[q.id]===option.id?" chosen":"")}>
          <input type="radio" name={q.id} value={option.id} checked={answers[q.id]===option.id}
            onChange={()=>{setAnswers(prev=>({...prev,[q.id]:option.id}));setReview(false);}}/>
          <span>{option.text}</span>
        </label>)}</div>
      </fieldset>)}
      <div className="dean-quiz-actions"><button className="primary-button" disabled={!completed} type="submit">Grade demo answers</button><button type="button" className="secondary-button" onClick={()=>{setAnswers({});setReview(false);}}>Clear choices</button></div>
      {last&&<section className="dean-result" aria-live="polite">
        <div className="dean-result-title"><strong>{last.score}% · {last.passed?"DEMO PASS":"TRY AGAIN"}</strong><span>{last.id} · SIMULATED / UNVERIFIED</span></div>
        <p>{last.correctCount} of {last.total} answers matched the fixed rubric. This is an operator-input practice record, not a real model evaluation.</p>
        {course.questions.map((q,i)=><div className="dean-answer-review" key={q.id}><span>{i+1}. {last.answers[i]===q.correct?"Matched rubric":"Did not match rubric"}</span><p>{q.explanation}</p></div>)}
      </section>}
    </form>
  </div>;
}
