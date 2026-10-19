// Supervised, explicit, sequential sample collection. No parallel model calls.
// This is *not* model training, independent evaluation or a certification engine.
import { runLocalClassroom } from "./localRunner.js";
import { AGENT_IDS, COURSES, MODEL_RE } from "./evidence.js";

export const MAX_TRIALS=5;
export const MAX_BATCH_RUNS=30;
export function validatePlan({model,courseIds,agentId="forge",trials=3,timeoutMs=120000}={}) {
  if(!MODEL_RE.test(model||"")) throw new Error("Invalid local Ollama model tag");
  if(!AGENT_IDS.has(agentId)) throw new Error("Unknown campus resident label");
  if(!Array.isArray(courseIds)||courseIds.length<1||courseIds.length>6||
     new Set(courseIds).size!==courseIds.length||!courseIds.every(id=>COURSES.has(id)))
    throw new Error("Choose 1 to 6 unique valid courses");
  if(!Number.isSafeInteger(trials)||trials<1||trials>MAX_TRIALS)
    throw new Error("Trial count must be between 1 and 5");
  if(courseIds.length*trials>MAX_BATCH_RUNS)
    throw new Error("Evaluation batch is limited to 30 calls");
  if(!Number.isSafeInteger(timeoutMs)||timeoutMs<1000||timeoutMs>300000)
    throw new Error("Timeout must be 1000 to 300000 milliseconds");
  return courseIds.length*trials;
}

export async function runEvaluationBatch(plan,{runner=runLocalClassroom,onRecord=async()=>{},onFailure=async()=>{}}={}){
  const planned=validatePlan(plan);
  const successes=[];
  const failures=[];
  // The user chooses the model, and calls are one-at-a-time to limit machine load.
  for(const courseId of plan.courseIds) {
    for(let trial=1;trial<=plan.trials;trial++) {
      try{
        const record=await runner({model:plan.model,courseId,agentId:plan.agentId||"forge",timeoutMs:plan.timeoutMs??120000});
        // Failed persistence must not be counted as successful evidence.
        await onRecord(record,{courseId,trial});
        successes.push(record);
      }catch(error){
        const failure={courseId,trial,message:String(error?.message||error).slice(0,200)};
        failures.push(failure);
        await onFailure(failure);
      }
    }
  }
  return {planned,completed:successes.length,failed:failures.length,successes,failures};
}
