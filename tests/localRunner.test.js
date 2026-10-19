import test from "node:test";
import assert from "node:assert/strict";
import { EXERCISES } from "../src/assessment.js";
import { classroomPrompt,parseChoices,sealEvidence,inspectEvidence } from "../src/evidence.js";
import { runLocalClassroom } from "../src/localRunner.js";

const case1=EXERCISES.find(e=>e.id==="records");
const choices=case1.questions.map(q=>({id:q.id,choice:q.correct}));
const mockReply=JSON.stringify({answers:choices});
function mockFetch(body,{ok=true,status=200}={}){
  return async (url,opts)=>{
    assert.equal(url,"http://127.0.0.1:11434/api/generate");
    const req=JSON.parse(opts.body);
    assert.equal(req.model,"granite4.2:8b");
    assert.equal(req.stream,false);
    assert.equal(req.options.temperature,0);
    assert.equal(req.options.num_predict,256);
    assert.equal(req.options.num_ctx,2048);
    assert.equal(req.format,"json");
    assert.ok(!req.prompt.includes('"correct"'),"answer keys are not sent");
    return {ok,status,text:async()=>JSON.stringify({response:body})};
  };
}
const args={model:"granite4.2:8b",courseId:"records",agentId:"vault",clock:()=>1000,uuid:()=>"12345678-1234-4123-8123-123456789abc"};
test("local Ollama runner produces a schema-checked unverified observed response",async()=>{
  const r=await runLocalClassroom({...args,fetchImpl:mockFetch(mockReply)});
  assert.equal(r.grade.score,100);
  assert.equal(r.verification,"UNVERIFIED");
  assert.equal(r.origin,"LOCAL_RUNNER_REPORTED");
  assert.equal(r.model,"granite4.2:8b");
  assert.deepEqual(await inspectEvidence(r),{ok:true,reason:"Structure and hashes match; source is NOT authenticated"});
});
test("model is not given scoring answers and options are serialized",()=>{
  const prompt=classroomPrompt("records");
  assert.ok(prompt.includes("records-q1"));
  assert.ok(!prompt.includes('"correct"'));
  assert.ok(!prompt.includes("Append a correction while preserving prior evidence." )||prompt.includes('"options"'));
});
test("invalid or hallucinated output is logged as invalid, never graded",async()=>{
  const r=await runLocalClassroom({...args,fetchImpl:mockFetch("I think B because...")});
  assert.equal(r.status,"INVALID_RESPONSE");
  assert.equal(r.grade,null);
  assert.deepEqual(r.answers,[]);
});
test("report hash and grading checks catch tampering",async()=>{
  const r=await runLocalClassroom({...args,fetchImpl:mockFetch(mockReply)});
  assert.equal((await inspectEvidence({...r,response:"fake"})).ok,false);
  assert.equal((await inspectEvidence({...r,verification:"VERIFIED"})).ok,false);
  const altered=await sealEvidence({...r,grade:{...r.grade,score:0}});
  assert.equal((await inspectEvidence(altered)).ok,false);
  const spoof=await sealEvidence({...r,model:"another:latest"});
  assert.equal((await inspectEvidence(spoof)).ok,true);
  // A hash is not a signature: a forger can recalculate it. UI must always say UNVERIFIED.
});
test("runner blocks arbitrary model strings and nonlocal URLs cannot be configured",async()=>{
  await assert.rejects(()=>runLocalClassroom({...args,model:"http://evil.com"}),/Invalid model/);
  await assert.rejects(()=>runLocalClassroom({...args,courseId:"does-not-exist"}),/Invalid model/);
  await assert.rejects(()=>runLocalClassroom({...args,timeoutMs:999}),/Timeout/);
});
