import test from "node:test";
import assert from "node:assert/strict";
import { EXERCISES } from "../src/assessment.js";
import { runLocalClassroom } from "../src/localRunner.js";
import { addLocalReport,makeInitialState,upgradeSnapshot,validateSnapshot,snapshot } from "../src/sim.js";
const e=EXERCISES[0];
const response=JSON.stringify({answers:e.questions.map(q=>({id:q.id,choice:q.correct}))});
async function makeRecord(){
  return runLocalClassroom({
    model:"granite4.2:8b",courseId:"orientation",agentId:"coherence",
    uuid:()=>"aaaa1234-1234-4123-8123-111111111111",
    clock:()=>100,
    fetchImpl:async()=>({ok:true,text:async()=>JSON.stringify({response})})
  });
}
test("v0.4 records separate imported observed reports from simulated answer sheets",async()=>{
  const before=makeInitialState();
  const record=await makeRecord();
  const after=addLocalReport(before,record);
  assert.equal(before.localRuns.length,0);
  assert.equal(after.localRuns.length,1);
  assert.equal(after.assessments.length,0);
  assert.equal(after.localRuns[0].verification,"UNVERIFIED");
  assert.equal(validateSnapshot(snapshot(after)),true);
  assert.equal(addLocalReport(after,record),after,"duplicate run rejected");
});
test("v0.3 saves upgrade to v0.4 with practices and receipts preserved",()=>{
  const s=makeInitialState();
  s.version=2;delete s.localRuns;
  const upgraded=upgradeSnapshot(s);
  assert.equal(upgraded.version,3);
  assert.deepEqual(upgraded.localRuns,[]);
  assert.equal(upgraded.tasks.length,s.tasks.length);
  assert.equal(validateSnapshot(upgraded),true);
});
test("import of forged verified fields is rejected",async()=>{
  const sample=await makeRecord();
  const s=makeInitialState();
  assert.equal(addLocalReport(s,{...sample,verification:"VERIFIED"}),s);
  assert.equal(addLocalReport(s,{...sample,grade:{score:1000}}),s);
  assert.equal(validateSnapshot({...s,localRuns:[{...sample,verification:"VERIFIED"}]}),false);
});
