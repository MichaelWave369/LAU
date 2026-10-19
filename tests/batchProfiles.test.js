import test from "node:test";
import assert from "node:assert/strict";
import { runEvaluationBatch,validatePlan,MAX_BATCH_RUNS } from "../src/batch.js";
import { buildCapabilityProfiles } from "../src/profiles.js";

const plan={model:"granite4.2:8b",courseIds:["records","research"],agentId:"vault",trials:3,timeoutMs:120000};
test("bounded evaluation plans reject invalid inputs before a call",()=>{
  assert.equal(validatePlan(plan),6);
  assert.equal(MAX_BATCH_RUNS,30);
  for(const p of [
    {...plan,model:"https://other-host"},
    {...plan,courseIds:["research","research"]},
    {...plan,courseIds:[]},
    {...plan,trials:6},
    {...plan,trials:0},
    {...plan,agentId:"fake"},
    {...plan,timeoutMs:999},
  ])assert.throws(()=>validatePlan(p));
});
test("runs sequentially and preserves partial success and failures",async()=>{
  let concurrent=0,maxConcurrent=0;
  const saved=[];
  const run=async args=>{
    concurrent++;maxConcurrent=Math.max(concurrent,maxConcurrent);
    const n=saved.length+1;
    await Promise.resolve();
    concurrent--;
    if(args.courseId==="research")throw new Error("Local Ollama offline");
    return {id:"report-"+n,model:args.model,courseId:args.courseId};
  };
  const result=await runEvaluationBatch(plan,{runner:run,onRecord:async r=>saved.push(r)});
  assert.equal(maxConcurrent,1);
  assert.equal(result.planned,6);
  assert.equal(result.completed,3);
  assert.equal(result.failed,3);
  assert.equal(saved.length,3);
  assert.deepEqual(result.failures.map(f=>f.trial),[1,2,3]);
});
test("disk-save errors cannot become completed receipts",async()=>{
  const result=await runEvaluationBatch({...plan,courseIds:["records"],trials:1},{
    runner:async()=>({id:"r"}),onRecord:async()=>{throw new Error("Disk full");}});
  assert.equal(result.completed,0);
  assert.equal(result.failed,1);
});
test("profiles display format validity and descriptive scores only",()=>{
  const reports=[
    {model:"granite4.2:8b",courseId:"records",requestPromptHash:"abc",status:"GRADED",grade:{score:100}},
    {model:"granite4.2:8b",courseId:"records",requestPromptHash:"abc",status:"GRADED",grade:{score:67}},
    {model:"granite4.2:8b",courseId:"records",requestPromptHash:"abc",status:"INVALID_RESPONSE",grade:null},
    {model:"qwen3.5:9b",courseId:"research",requestPromptHash:"def",status:"GRADED",grade:{score:33}}
  ];
  const p=buildCapabilityProfiles(reports);
  const g=p.find(x=>x.model==="granite4.2:8b");
  assert.equal(g.total,3);assert.equal(g.formatRate,67);
  assert.equal(g.realCredentials,0);assert.equal(g.verification,"UNVERIFIED");
  assert.deepEqual(g.courses[0],{courseId:"records",runs:3,valid:2,invalid:1,formatRate:67,
    mean:84,median:83.5,best:100,worst:67,passCount:2,rubricVariants:1});
  assert.equal(p.find(x=>x.model==="qwen3.5:9b").courses[0].mean,33);
  assert.deepEqual(buildCapabilityProfiles([]),[]);
});
