import test from "node:test";
import assert from "node:assert/strict";
import { EXERCISES,gradeAnswers,createPracticeRecord,validPracticeRecord,transcript,PASS_SCORE } from "../src/assessment.js";
const ids=new Set(["forge","coherence","scout","rook","nyx","vault"]);
test("six exercises have unique prompts and one valid answer per item",()=>{
  assert.equal(EXERCISES.length,6);
  for(const ex of EXERCISES){
    assert.equal(ex.questions.length,3);
    assert.equal(new Set(ex.questions.map(q=>q.id)).size,3);
    for(const q of ex.questions)assert.ok(q.options.some(o=>o.id===q.correct));
  }
});
test("fixed-rubric assessment scores independently of claimed roles",()=>{
  const ex=EXERCISES[0];
  const correct=ex.questions.map(q=>q.correct);
  const wrong=ex.questions.map(q=>q.options.find(o=>o.id!==q.correct).id);
  assert.deepEqual(gradeAnswers(ex.id,correct),{score:100,correctCount:3,total:3,passed:true});
  assert.equal(gradeAnswers(ex.id,wrong).passed,false);
  assert.equal(gradeAnswers(ex.id,[correct[0],correct[1],wrong[2]]).score,PASS_SCORE);
  assert.equal(gradeAnswers("not-a-course",correct),null);
  assert.equal(gradeAnswers(ex.id,["bogus",correct[1],correct[2]]),null);
});
test("records never certify actual models and reject score tampering",()=>{
  const ex=EXERCISES[0];
  const record=createPracticeRecord(ex.id,"forge",ex.questions.map(q=>q.correct),1,"2026-10-18T12:00:00.000Z");
  assert.equal(validPracticeRecord(record,ids),true);
  assert.equal(record.origin,"SIMULATED");
  assert.equal(record.verified,false);
  assert.equal(record.method,"OPERATOR_SELECTED");
  assert.equal(validPracticeRecord({...record,verified:true},ids),false);
  assert.equal(validPracticeRecord({...record,score:20},ids),false);
});
test("transcripts report only mock course passes, not real credentials",()=>{
  const e=EXERCISES[0];
  const r=createPracticeRecord(e.id,"forge",e.questions.map(q=>q.correct),1,"2026-10-18T12:00:00.000Z");
  const t=transcript([r],"forge");
  assert.equal(t.passed,1);
  assert.equal(t.attempts,1);
  assert.equal(t.realCredentials,0);
  assert.equal(transcript([r],"scout").passed,0);
});
