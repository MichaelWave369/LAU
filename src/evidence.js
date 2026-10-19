// Shared browser/Node validation for *reported* Ollama classroom evidence.
// A matching hash detects changes to a file; it NEVER authenticates the model or operator.
import { EXERCISES, gradeAnswers } from "./assessment.js";

export const CLASSROOM_SCHEMA=1;
export const MAX_RESPONSE=12000;
export const MODEL_RE=/^[a-zA-Z0-9][a-zA-Z0-9._:/-]{0,99}$/;
export const AGENT_IDS=new Set(["forge","coherence","scout","rook","nyx","vault"]);
export const COURSES=new Map(EXERCISES.map(course=>[course.id,course]));
const HEX=/^[a-f0-9]{64}$/;
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MAX_REPORTS=80;

export function classroomPrompt(courseId) {
  const course=COURSES.get(courseId);
  if(!course)throw new Error("Unknown course");
  const questions=course.questions.map(q=>({
    id:q.id,prompt:q.prompt,options:q.options.map(o=>({id:o.id,text:o.text}))
  }));
  // Importantly, the grading keys are NOT included in the model prompt.
  return [
    "You are taking a supervised evaluation exercise. No tools or external actions are allowed.",
    "Choose the best option for each question. Return only strict JSON.",
    'Output format: {"answers":[{"id":"question-id","choice":"option-id"}]}',
    "Return exactly one entry for each question. No explanations or other fields.",
    JSON.stringify(questions)
  ].join("\n");
}

export function parseChoices(courseId,response) {
  const exercise=COURSES.get(courseId);
  if(!exercise||typeof response!=="string"||response.length>MAX_RESPONSE)return null;
  let payload;
  try{payload=JSON.parse(response);}catch{return null;}
  if(!payload||!Array.isArray(payload.answers)||payload.answers.length!==exercise.questions.length)return null;
  const ids=new Set();
  for(const entry of payload.answers){
    if(!entry||typeof entry.id!=="string"||typeof entry.choice!=="string"||
      ids.has(entry.id)||!exercise.questions.some(q=>q.id===entry.id))return null;
    ids.add(entry.id);
  }
  const answers=exercise.questions.map(q=>payload.answers.find(a=>a.id===q.id)?.choice);
  return gradeAnswers(courseId,answers)?answers:null;
}

export async function sha256(text) {
  const data=new TextEncoder().encode(text);
  const bytes=await globalThis.crypto.subtle.digest("SHA-256",data);
  return Array.from(new Uint8Array(bytes),x=>x.toString(16).padStart(2,"0")).join("");
}

function unsigned(record) {
  const {integrityHash,...rest}=record;
  return rest;
}
export async function sealEvidence(record) {
  return {...record,integrityHash:await sha256(JSON.stringify(unsigned(record)))};
}
export async function inspectEvidence(record) {
  if(!record||typeof record!=="object"||Array.isArray(record)||
    record.schemaVersion!==CLASSROOM_SCHEMA||
    typeof record.id!=="string"||!UUID.test(record.id)||
    typeof record.generatedAt!=="string"||record.generatedAt.length>40||!Number.isFinite(Date.parse(record.generatedAt))||
    !MODEL_RE.test(record.model||"")||
    !COURSES.has(record.courseId)||!AGENT_IDS.has(record.agentId)||
    record.origin!=="LOCAL_RUNNER_REPORTED"||record.verification!=="UNVERIFIED"||
    record.temperature!==0||record.numPredict!==256||
    !Number.isSafeInteger(record.timingMs)||record.timingMs<0||record.timingMs>30000000||
    typeof record.response!=="string"||record.response.length>MAX_RESPONSE||
    !HEX.test(record.requestPromptHash||"")||!HEX.test(record.responseHash||"")||
    !HEX.test(record.integrityHash||"")) return {ok:false,reason:"Invalid report schema"};
  if(Object.keys(record).sort().join(",")!==[
    "agentId","answers","courseId","generatedAt","grade","id","integrityHash",
    "model","numPredict","origin","requestPromptHash","response","responseHash",
    "schemaVersion","status","temperature","timingMs","verification"
  ].sort().join(","))return {ok:false,reason:"Unexpected report fields"};
  const chosen=parseChoices(record.courseId,record.response);
  const graded=chosen?gradeAnswers(record.courseId,chosen):null;
  if(graded){
    if(record.status!=="GRADED"||!Array.isArray(record.answers)||
      JSON.stringify(chosen)!==JSON.stringify(record.answers)||
      !record.grade||JSON.stringify(graded)!==JSON.stringify(record.grade))
      return {ok:false,reason:"Response and grade disagree"};
  } else if(record.status!=="INVALID_RESPONSE"||record.grade!==null||
    !Array.isArray(record.answers)||record.answers.length!==0)
    return {ok:false,reason:"Invalid response incorrectly graded"};
  if(await sha256(classroomPrompt(record.courseId))!==record.requestPromptHash||
    await sha256(record.response)!==record.responseHash||
    await sha256(JSON.stringify(unsigned(record)))!==record.integrityHash)
    return {ok:false,reason:"Hash mismatch: report was altered or is incompatible"};
  return {ok:true,reason:"Structure and hashes match; source is NOT authenticated"};
}
export function validateImportedReports(reports) {
  // In-memory validation for state restoration. File hashes are checked before initial import.
  // Imported records stay explicitly unverified even if later modified in localStorage.
  if(!Array.isArray(reports)||reports.length>MAX_REPORTS)return false;
  const ids=new Set();
  return reports.every(r=>{
    if(!r||typeof r!=="object"||typeof r.id!=="string"||!UUID.test(r.id)||ids.has(r.id)||
      r.schemaVersion!==CLASSROOM_SCHEMA||!AGENT_IDS.has(r.agentId)||!COURSES.has(r.courseId)||
      !MODEL_RE.test(r.model||"")||r.origin!=="LOCAL_RUNNER_REPORTED"||
      r.verification!=="UNVERIFIED"||!HEX.test(r.integrityHash||"")||
      typeof r.response!=="string"||r.response.length>MAX_RESPONSE||
      !["GRADED","INVALID_RESPONSE"].includes(r.status))return false;
    ids.add(r.id);
    const answers=parseChoices(r.courseId,r.response);
    const grade=answers?gradeAnswers(r.courseId,answers):null;
    return grade?(r.status==="GRADED"&&JSON.stringify(r.answers)===JSON.stringify(answers)&&JSON.stringify(r.grade)===JSON.stringify(grade)):
      (r.status==="INVALID_RESPONSE"&&r.grade===null&&Array.isArray(r.answers)&&r.answers.length===0);
  });
}
