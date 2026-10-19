#!/usr/bin/env node
// Runs ONLY when a local user explicitly invokes this command.
// Never used by GitHub Pages, CI, or npm install.
import { mkdir, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { runLocalClassroom } from "../src/localRunner.js";
import { AGENT_IDS, COURSES, MODEL_RE } from "../src/evidence.js";

const HELP=[
  "LAU Living Classroom: opt-in local Ollama evaluation",
  "",
  "Usage:",
  "  npm run classroom -- --model granite4.2:8b --course records --agent vault",
  "  npm run classroom -- --model qwen3.5:9b --course research --agent scout",
  "",
  "Options:",
  "  --model <name>      REQUIRED exact local Ollama model tag",
  "  --course <id>       REQUIRED: "+Array.from(COURSES.keys()).join(", "),
  "  --agent <id>        Optional role label: "+Array.from(AGENT_IDS).join(", ")+" (default forge)",
  "  --timeout <ms>      1000 to 300000 (default 120000)",
  "  --out <path>        Optional local evidence JSON path (never overwrite)",
  "  --help              Show this message",
  "",
  "This command sends fixed questions to http://127.0.0.1:11434/api/generate.",
  "It does NOT execute commands proposed by the model, modify source files, train a model,",
  "call external servers or authenticate the result as a verified capability.",
  "All generated reports remain UNVERIFIED until independently evaluated."
].join("\n");
function usageFail(message){
  process.stderr.write("LAU error: "+message+"\n\n"+HELP+"\n");
  process.exitCode=2;
}
const args={};
const argv=process.argv.slice(2);
let malformed=false;
for(let i=0;i<argv.length;i++){
  const flag=argv[i];
  if(flag==="--help"){console.log(HELP);process.exit(0);}
  if(!["--model","--course","--agent","--out","--timeout"].includes(flag)||i===argv.length-1||args[flag]){
    malformed=true;break;
  }
  args[flag]=argv[++i];
}
if(malformed||!MODEL_RE.test(args["--model"]||"")||!COURSES.has(args["--course"])||
  !AGENT_IDS.has(args["--agent"]||"forge")||
  (args["--timeout"]!==undefined&&(!/^\d+$/.test(args["--timeout"])||
    Number(args["--timeout"])<1000||Number(args["--timeout"])>300000))){
  usageFail("Missing or invalid options");
} else {
  try{
    const report=await runLocalClassroom({
      model:args["--model"],courseId:args["--course"],
      agentId:args["--agent"]||"forge",
      timeoutMs:args["--timeout"]?Number(args["--timeout"]):120000
    });
    const dir=resolve("reports");
    await mkdir(dir,{recursive:true});
    const name="lau-"+report.courseId+"-"+report.id+".json";
    const file=args["--out"]?resolve(args["--out"]):join(dir,name);
    await writeFile(file,JSON.stringify(report,null,2)+"\n",{encoding:"utf8",flag:"wx",mode:0o600});
    console.log("LAU local classroom report written: "+file);
    console.log("Model (self-reported tag): "+report.model);
    console.log("Assessment: "+report.courseId+" | "+report.status+" | Score: "+(report.grade?.score??"not scored"));
    console.log("Provenance: LOCAL_RUNNER_REPORTED / UNVERIFIED. File hash is NOT proof of origin.");
    console.log("Import this JSON into the LAU Living Classroom panel on GitHub Pages.");
  }catch(error){
    const hint=error?.name==="AbortError"?" (timeout; try --timeout 180000)":"";
    console.error("LAU local classroom failed: "+(error?.message||String(error))+hint);
    console.error("Make sure Ollama is running locally and the model is already installed.");
    process.exitCode=1;
  }
}
