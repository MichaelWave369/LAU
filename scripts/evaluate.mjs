#!/usr/bin/env node
// Human-started local-only batch evaluation. No scheduler, training, or external endpoints.
import {mkdir,writeFile} from "node:fs/promises";
import {join,resolve} from "node:path";
import {runEvaluationBatch,validatePlan} from "../src/batch.js";
import {COURSES} from "../src/evidence.js";

const help=[
"LAU v0.5 · Local supervised repeated evaluation",
"",
"  npm run evaluate -- --model granite4.2:8b --courses records,research --trials 3 --agent vault",
"  npm run evaluate -- --model qwen3.5:9b --all --trials 2 --agent scout",
"",
"Options:",
"  --model NAME       Installed local Ollama model (required)",
"  --courses A,B      Comma-delimited course IDs (or use --all)",
"  --all              Evaluate all six courses; incompatible with --courses",
"  --trials N         1..5 sequential attempts per course (default 3)",
"  --agent ID         Campus resident label (default forge)",
"  --timeout MS       Per-call timeout 1000..300000 (default 120000)",
"  --help             Show this help",
"",
"Maximum 30 calls. Each successful call is written immediately as a separate,",
"non-overwriting local JSON report in reports/. Other failures are logged.",
"Reports remain LOCAL_RUNNER_REPORTED / UNVERIFIED. They are NOT certificates."
].join("\n");
const raw=process.argv.slice(2);
if(raw.includes("--help")){console.log(help);process.exit(0);}
const flags={};
let bad=false;
for(let i=0;i<raw.length;i++){
  const key=raw[i];
  if(key==="--all"){if(flags[key])bad=true;flags[key]=true;continue;}
  if(!["--model","--courses","--trials","--agent","--timeout"].includes(key)||
     flags[key]!==undefined||i+1>=raw.length||raw[i+1].startsWith("--")){bad=true;break;}
  flags[key]=raw[++i];
}
const courseIds=flags["--all"]?Array.from(COURSES.keys()):(flags["--courses"]||"").split(",");
const numeric=(s,defaultValue)=>s===undefined?defaultValue:/^[0-9]+$/.test(s)?Number(s):NaN;
const plan={model:flags["--model"],courseIds,agentId:flags["--agent"]||"forge",
  trials:numeric(flags["--trials"],3),timeoutMs:numeric(flags["--timeout"],120000)};
try{
  if(bad||flags["--all"]&&flags["--courses"]||!flags["--model"])throw new Error("Invalid command options");
  validatePlan(plan);
}catch(error){
  console.error("LAU: "+error.message+"\n\n"+help);
  process.exit(2);
}
const folder=resolve("reports");
await mkdir(folder,{recursive:true});
console.log("LAU: starting "+plan.courseIds.length*plan.trials+" sequential LOCAL Ollama requests.");
console.log("No external model endpoints. Nothing is certified.");
const results=await runEvaluationBatch(plan,{
  onRecord:async (record,{courseId,trial})=>{
    const filename=join(folder,"lau-"+courseId+"-"+record.id+".json");
    await writeFile(filename,JSON.stringify(record,null,2)+"\n",{encoding:"utf8",flag:"wx",mode:0o600});
    console.log("Saved "+courseId+" trial "+trial+": "+record.status+" / "+(record.grade?.score??"not graded")+" · "+filename);
  },
  onFailure:async ({courseId,trial,message})=>{
    console.error("FAILED "+courseId+" trial "+trial+": "+message);
  }
});
console.log("Finished "+results.completed+" saved, "+results.failed+" failed, "+results.planned+" planned.");
console.log("Use the Living Classroom import control to select multiple report JSON files.");
console.log("Every imported result stays UNVERIFIED and separate from fictional student grades.");
if(results.failed)process.exitCode=1;
