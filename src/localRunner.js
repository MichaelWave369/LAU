// Explicit opt-in, local-only runner. There are no remote endpoints or tool-calling.
import { classroomPrompt, COURSES, MODEL_RE, AGENT_IDS, parseChoices, sha256, sealEvidence, inspectEvidence, MAX_RESPONSE } from "./evidence.js";
import { gradeAnswers } from "./assessment.js";
const ENDPOINT="http://127.0.0.1:11434/api/generate";
export const DEFAULT_TIMEOUT_MS=120000;

export async function runLocalClassroom({model,courseId,agentId="forge",timeoutMs=DEFAULT_TIMEOUT_MS,fetchImpl=fetch,clock=()=>Date.now(),uuid=()=>crypto.randomUUID()}){
  if(!MODEL_RE.test(model||"")||!COURSES.has(courseId)||!AGENT_IDS.has(agentId))throw new Error("Invalid model, course or agent");
  if(!Number.isSafeInteger(timeoutMs)||timeoutMs<1000||timeoutMs>300000)throw new Error("Timeout out of bounds");
  const prompt=classroomPrompt(courseId);
  const controller=new AbortController();
  const timeout=setTimeout(()=>controller.abort(),timeoutMs);
  const started=clock();
  let response;
  try{
    response=await fetchImpl(ENDPOINT,{
      method:"POST",signal:controller.signal,
      headers:{"content-type":"application/json"},
      body:JSON.stringify({
        model,prompt,stream:false,format:"json",options:{temperature:0,num_predict:256,num_ctx:2048}
      })
    });
    if(!response.ok)throw new Error("Local Ollama returned HTTP "+response.status);
    const raw=await response.text();
    if(raw.length>100000)throw new Error("Oversize Ollama response");
    const payload=JSON.parse(raw);
    if(!payload||typeof payload.response!=="string"||payload.response.length>MAX_RESPONSE)throw new Error("Model response missing or oversized");
    const answers=parseChoices(courseId,payload.response);
    const grade=answers?gradeAnswers(courseId,answers):null;
    const candidate={
      schemaVersion:1,id:uuid(),generatedAt:new Date().toISOString(),
      model,courseId,agentId,temperature:0,numPredict:256,
      timingMs:Math.min(30000000,Math.max(0,Math.round(clock()-started))),
      requestPromptHash:await sha256(prompt),responseHash:await sha256(payload.response),
      response:payload.response,answers:answers||[],grade,
      status:grade?"GRADED":"INVALID_RESPONSE",
      origin:"LOCAL_RUNNER_REPORTED",verification:"UNVERIFIED"
    };
    const record=await sealEvidence(candidate);
    const validation=await inspectEvidence(record);
    if(!validation.ok)throw new Error("Local report generation failed validation: "+validation.reason);
    return record;
  } finally {clearTimeout(timeout);}
}
