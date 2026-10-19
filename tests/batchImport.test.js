import test from "node:test";
import assert from "node:assert/strict";
import { EXERCISES } from "../src/assessment.js";
import {runLocalClassroom} from "../src/localRunner.js";
import {inspectEvidence} from "../src/evidence.js";
import {makeInitialState,addLocalReports,validateSnapshot} from "../src/sim.js";

const q=EXERCISES.find(x=>x.id==="records");
const modelResponse=JSON.stringify({answers:q.questions.map(x=>({id:x.id,choice:x.correct}))});
async function report(id){
  return runLocalClassroom({model:"granite4.2:8b",courseId:"records",agentId:"vault",
    uuid:()=>id,clock:()=>100,
    fetchImpl:async (url,opts)=>{
      assert.equal(url,"http://127.0.0.1:11434/api/generate");
      assert.equal(opts.redirect,"error","disallow following Ollama redirects to other hosts");
      return {ok:true,text:async()=>JSON.stringify({response:modelResponse})};
    }
  });
}
test("v0.5 multi-report import is atomic and does not alter demo transcripts",async()=>{
  const a=await report("aaaa1234-1234-4123-8123-111111111111");
  const b=await report("bbbb1234-1234-4123-8123-222222222222");
  assert.equal((await inspectEvidence(a)).ok,true);
  assert.equal((await inspectEvidence(b)).ok,true);
  const start=makeInitialState();
  const imported=addLocalReports(start,[a,b]);
  assert.equal(start.localRuns.length,0);
  assert.equal(imported.localRuns.length,2);
  assert.equal(imported.assessments.length,0);
  assert.equal(validateSnapshot(imported),true);
  assert.equal(addLocalReports(imported,[a]),imported,"duplicate rejects whole batch");
  assert.equal(addLocalReports(start,[a,{...b,verification:"VERIFIED"}]),start,"forged status rejects whole batch");
  assert.equal(addLocalReports(start,[a,a]),start,"duplicate within incoming batch rejects whole batch");
});
