import test from "node:test";
import assert from "node:assert/strict";
import { makeInitialState, assignTask, advanceState, visitBuilding, setScene, toggleSeason, validateSnapshot, snapshot, clearCompleted } from "../src/sim.js";

test("starts with six simulated agents and no verified receipts", () => {
  const s=makeInitialState();
  assert.equal(s.agents.length,6);
  assert.equal(s.receipts.length,0);
  assert.equal(validateSnapshot(s),true);
});
test("assigned work progresses and only yields simulated receipts", () => {
  const initial=makeInitialState();
  let s=assignTask({...initial,tasks:[]},"Test a course","scout",2);
  assert.equal(initial.tasks.length,2);
  s=advanceState(s);
  assert.equal(s.tasks[0].status,"working");
  s=advanceState(s);
  assert.equal(s.tasks[0].status,"done");
  assert.equal(s.receipts[0].origin,"SIMULATED");
  assert.equal(s.receipts[0].verified,false);
  assert.equal(validateSnapshot(s),true);
});
test("locations and seasons stay within demo boundary",()=>{
  const initial=makeInitialState();
  const s=visitBuilding(setScene(initial,"office"),"records");
  assert.equal(s.resources.Records,initial.resources.Records+1);
  assert.equal(toggleSeason(s).season,"winter");
});
test("malformed snapshots are rejected",()=>{
  const s=makeInitialState();
  const x=snapshot(s);
  x.receipts.push({id:"R",title:"Fake",agent:"forge",step:0,at:"today",origin:"VERIFIED",verified:true});
  assert.equal(validateSnapshot(x),false);
  assert.equal(validateSnapshot({...s,scene:"admin"}),false);
});
test("completion cleanup preserves receipts",()=>{
  let s={...makeInitialState(),tasks:[]};
  s=assignTask(s,"Plan a lesson","nyx",1);
  s=clearCompleted(advanceState(s));
  assert.equal(s.tasks.length,0);
  assert.equal(s.receipts.length,1);
});
