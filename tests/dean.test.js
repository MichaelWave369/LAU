import test from "node:test";
import assert from "node:assert/strict";
import { makeInitialState, recordPractice, upgradeSnapshot, validateSnapshot, snapshot } from "../src/sim.js";
import { EXERCISES, transcript } from "../src/assessment.js";

test("v0.3 state starts with an empty dean's transcript",()=>{
  const s=makeInitialState();
  assert.equal(s.version,3);
  assert.deepEqual(s.assessments,[]);
  assert.equal(validateSnapshot(s),true);
});
test("legacy v0.2 snapshots upgrade without losing receipts or tasks",()=>{
  const s=makeInitialState();
  s.receipts.push({id:"DEMO-0001",taskId:1,title:"Test",agent:"forge",at:"14:20",step:1,origin:"SIMULATED",verified:false});
  const legacy=structuredClone(s);
  legacy.version=1;
  delete legacy.assessments;
  delete legacy.localRuns;
  const upgraded=upgradeSnapshot(legacy);
  assert.equal(upgraded.version,3);
  assert.deepEqual(upgraded.receipts,legacy.receipts);
  assert.deepEqual(upgraded.tasks,legacy.tasks);
  assert.deepEqual(upgraded.assessments,[]);
  assert.deepEqual(upgraded.localRuns,[]);
  assert.equal(validateSnapshot(upgraded),true);
});
test("operator-selected course answers generate only simulated records",()=>{
  const x=EXERCISES.find(a=>a.id==="research");
  const answers=x.questions.map(q=>q.correct);
  const before=makeInitialState();
  const after=recordPractice(before,"research","scout",answers,"2026-10-18T14:20:00.000Z");
  assert.equal(before.assessments.length,0);
  assert.equal(after.assessments.length,1);
  assert.equal(after.assessments[0].score,100);
  assert.equal(after.assessments[0].verified,false);
  assert.equal(transcript(after.assessments,"scout").passed,1);
  assert.equal(transcript(after.assessments,"scout").realCredentials,0);
  assert.equal(validateSnapshot(snapshot(after)),true);
});
test("reject invalid assessments and tampered evidence on imports",()=>{
  const sample=makeInitialState();
  assert.equal(recordPractice(sample,"no-course","forge",["0","1","2"]),sample);
  assert.equal(recordPractice(sample,"research","not-an-agent",["0","1","2"]),sample);
  const x=EXERCISES[0];
  const after=recordPractice(sample,x.id,"forge",x.questions.map(q=>q.correct),"2026-10-18T14:20:00.000Z");
  const bad=structuredClone(after);
  bad.assessments[0].verified=true;
  assert.equal(validateSnapshot(bad),false);
  assert.equal(upgradeSnapshot(bad),null);
  bad.assessments[0].verified=false;
  bad.assessments[0].score=25;
  assert.equal(validateSnapshot(bad),false);
  bad.assessments[0].score=100;
  bad.assessments.push({...bad.assessments[0]});
  assert.equal(validateSnapshot(bad),false);
});
test("never promote a forged v1 snapshot containing new academic fields",()=>{
  const s=makeInitialState();
  s.version=1;
  assert.equal(upgradeSnapshot(s),null);
});
