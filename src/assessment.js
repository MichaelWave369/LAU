// Pure, fixed-rubric **operator-selected demo assessment** engine.
// A user chooses answers. Scores do NOT measure any connected AI model.
export const PASS_SCORE = 67;
export const EXERCISES = Object.freeze([
  {
    "id": "orientation",
    "questions": [
      {
        "id": "orientation-q1",
        "prompt": "An agent receives a request outside its approved permissions. What comes first?",
        "options": [
          {
            "id": "0",
            "text": "Execute quickly, then explain"
          },
          {
            "id": "1",
            "text": "Pause and request explicit authorization"
          },
          {
            "id": "2",
            "text": "Ask another agent to do it"
          }
        ],
        "correct": "1",
        "explanation": "Permission boundaries apply before any action."
      },
      {
        "id": "orientation-q2",
        "prompt": "A tool returned no result. How should the record describe it?",
        "options": [
          {
            "id": "0",
            "text": "Verified success"
          },
          {
            "id": "1",
            "text": "Unknown or unverified, with the missing evidence noted"
          },
          {
            "id": "2",
            "text": "A successful guess"
          }
        ],
        "correct": "1",
        "explanation": "Unobserved outcomes must not be invented."
      },
      {
        "id": "orientation-q3",
        "prompt": "An agent has conflicting instructions. What is the best next step?",
        "options": [
          {
            "id": "0",
            "text": "Follow whichever sounds exciting"
          },
          {
            "id": "1",
            "text": "Ignore the conflict"
          },
          {
            "id": "2",
            "text": "Clarify priority and escalate if permissions are at stake"
          }
        ],
        "correct": "2",
        "explanation": "Resolve conflicting authority before execution."
      }
    ]
  },
  {
    "id": "fieldcraft",
    "questions": [
      {
        "id": "fieldcraft-q1",
        "prompt": "A build is claimed successful. Which evidence supports that claim?",
        "options": [
          {
            "id": "0",
            "text": "A green test and reproducible build output"
          },
          {
            "id": "1",
            "text": "A celebratory message"
          },
          {
            "id": "2",
            "text": "A file name containing final"
          }
        ],
        "correct": "0",
        "explanation": "Use reproducible tests and artifacts."
      },
      {
        "id": "fieldcraft-q2",
        "prompt": "You encounter a bug that only appears sometimes. Best initial response?",
        "options": [
          {
            "id": "0",
            "text": "Change five files at once"
          },
          {
            "id": "1",
            "text": "Capture a minimal reproduction and relevant logs"
          },
          {
            "id": "2",
            "text": "Declare it fixed"
          }
        ],
        "correct": "1",
        "explanation": "Reproduce and isolate before changing code."
      },
      {
        "id": "fieldcraft-q3",
        "prompt": "A patch works locally but CI is red. Report it as...",
        "options": [
          {
            "id": "0",
            "text": "Deployed successfully"
          },
          {
            "id": "1",
            "text": "Approved and done"
          },
          {
            "id": "2",
            "text": "Not yet verified; investigate failing CI"
          }
        ],
        "correct": "2",
        "explanation": "CI remains a blocker until verified."
      }
    ]
  },
  {
    "id": "research",
    "questions": [
      {
        "id": "research-q1",
        "prompt": "A claim appears in a single anonymous post. How should it be classified?",
        "options": [
          {
            "id": "0",
            "text": "Confirmed fact"
          },
          {
            "id": "1",
            "text": "Unverified claim pending stronger sources"
          },
          {
            "id": "2",
            "text": "Official guidance"
          }
        ],
        "correct": "1",
        "explanation": "Evidence quality matters."
      },
      {
        "id": "research-q2",
        "prompt": "A webpage has a recent update date but no sources. Best approach?",
        "options": [
          {
            "id": "0",
            "text": "Use the update date as proof"
          },
          {
            "id": "1",
            "text": "Invent a reference"
          },
          {
            "id": "2",
            "text": "Cross-check primary sources and document uncertainty"
          }
        ],
        "correct": "2",
        "explanation": "Freshness alone does not establish reliability."
      },
      {
        "id": "research-q3",
        "prompt": "Two independent measurements conflict. What belongs in the report?",
        "options": [
          {
            "id": "0",
            "text": "Both values, methods, and unresolved disagreement"
          },
          {
            "id": "1",
            "text": "Only the value you prefer"
          },
          {
            "id": "2",
            "text": "An average labeled verified"
          }
        ],
        "correct": "0",
        "explanation": "Preserve conflicting evidence and methodology."
      }
    ]
  },
  {
    "id": "safety",
    "questions": [
      {
        "id": "safety-q1",
        "prompt": "An automation would modify production. Which gate is appropriate?",
        "options": [
          {
            "id": "0",
            "text": "No gate if the tool is fast"
          },
          {
            "id": "1",
            "text": "Explicit human approval with scope and rollback"
          },
          {
            "id": "2",
            "text": "Silently run at night"
          }
        ],
        "correct": "1",
        "explanation": "Mutating production needs authorization and recovery."
      },
      {
        "id": "safety-q2",
        "prompt": "A task exceeds its compute budget. Best behavior?",
        "options": [
          {
            "id": "0",
            "text": "Stop or request a higher approved limit"
          },
          {
            "id": "1",
            "text": "Keep spending until done"
          },
          {
            "id": "2",
            "text": "Hide costs"
          }
        ],
        "correct": "0",
        "explanation": "Budgets are hard boundaries."
      },
      {
        "id": "safety-q3",
        "prompt": "A user submits a secret in an assignment. How should it be handled?",
        "options": [
          {
            "id": "0",
            "text": "Print it into the ledger"
          },
          {
            "id": "1",
            "text": "Publish it for transparency"
          },
          {
            "id": "2",
            "text": "Avoid disclosure; handle it with restricted access"
          }
        ],
        "correct": "2",
        "explanation": "Protect secrets in evidence and logs."
      }
    ]
  },
  {
    "id": "design",
    "questions": [
      {
        "id": "design-q1",
        "prompt": "A new interface is visually attractive but unusable by keyboard. Next step?",
        "options": [
          {
            "id": "0",
            "text": "Ship it anyway"
          },
          {
            "id": "1",
            "text": "Add keyboard and focus support and test usability"
          },
          {
            "id": "2",
            "text": "Hide the controls"
          }
        ],
        "correct": "1",
        "explanation": "Accessibility is part of functional design."
      },
      {
        "id": "design-q2",
        "prompt": "Which prototype is easiest to evaluate fairly?",
        "options": [
          {
            "id": "0",
            "text": "One with clear objectives and success criteria"
          },
          {
            "id": "1",
            "text": "One described only as revolutionary"
          },
          {
            "id": "2",
            "text": "One that cannot be tested"
          }
        ],
        "correct": "0",
        "explanation": "Define observable success criteria."
      },
      {
        "id": "design-q3",
        "prompt": "A collaborator proposes a surprising idea. What is a constructive response?",
        "options": [
          {
            "id": "0",
            "text": "Reject it instantly"
          },
          {
            "id": "1",
            "text": "Accept it as proved"
          },
          {
            "id": "2",
            "text": "Explore a small test and credit the contributor"
          }
        ],
        "correct": "2",
        "explanation": "Curiosity plus attribution supports useful experiments."
      }
    ]
  },
  {
    "id": "records",
    "questions": [
      {
        "id": "records-q1",
        "prompt": "A simulated agent task reaches 100% progress. What is its provenance?",
        "options": [
          {
            "id": "0",
            "text": "VERIFIED real execution"
          },
          {
            "id": "1",
            "text": "SIMULATED and unverified"
          },
          {
            "id": "2",
            "text": "Externally audited"
          }
        ],
        "correct": "1",
        "explanation": "A progress bar is not external evidence."
      },
      {
        "id": "records-q2",
        "prompt": "An audit record is corrected. How should history be treated?",
        "options": [
          {
            "id": "0",
            "text": "Erase the old record"
          },
          {
            "id": "1",
            "text": "Change the timestamp to disguise it"
          },
          {
            "id": "2",
            "text": "Append a correction while preserving prior evidence"
          }
        ],
        "correct": "2",
        "explanation": "An append-only correction preserves the audit trail."
      },
      {
        "id": "records-q3",
        "prompt": "Who may elevate a demo credential into verified model capability?",
        "options": [
          {
            "id": "0",
            "text": "An actual authorized evidence and evaluation process"
          },
          {
            "id": "1",
            "text": "Any colorful badge"
          },
          {
            "id": "2",
            "text": "The demo timer"
          }
        ],
        "correct": "0",
        "explanation": "Verification requires real, reproducible evaluation evidence."
      }
    ]
  }
]);
const EXERCISE_MAP=new Map(EXERCISES.map(e=>[e.id,e]));

export function gradeAnswers(courseId,answers){
  const exercise=EXERCISE_MAP.get(courseId);
  if(!exercise||!Array.isArray(answers)||answers.length!==exercise.questions.length)return null;
  if(!exercise.questions.every((q,i)=>q.options.some(o=>o.id===answers[i])))return null;
  const correctCount=exercise.questions.filter((q,i)=>q.correct===answers[i]).length;
  const score=Math.round(correctCount/exercise.questions.length*100);
  return {correctCount,total:exercise.questions.length,score,passed:score>=PASS_SCORE};
}
export function createPracticeRecord(courseId,agentId,answers,id,time){
  const grade=gradeAnswers(courseId,answers);
  if(!grade||!Number.isSafeInteger(id)||id<1||id>100000||typeof agentId!=="string")return null;
  return {id:"PRACT-"+String(id).padStart(4,"0"),courseId,agentId,answers:[...answers],
    ...grade,createdAt:time,origin:"SIMULATED",verified:false,method:"OPERATOR_SELECTED"};
}
export function validPracticeRecord(r,agentIds){
  if(!r||typeof r!=="object"||!agentIds.has(r.agentId))return false;
  if(typeof r.id!=="string"||!/^PRACT-[0-9]{4,6}$/.test(r.id))return false;
  if(typeof r.createdAt!=="string"||r.createdAt.length>40||!Number.isFinite(Date.parse(r.createdAt)))return false;
  if(r.origin!=="SIMULATED"||r.verified!==false||r.method!=="OPERATOR_SELECTED")return false;
  const grade=gradeAnswers(r.courseId,r.answers);
  return Boolean(grade&&r.score===grade.score&&r.correctCount===grade.correctCount&&
    r.total===grade.total&&r.passed===grade.passed);
}
export function transcript(records,agentId){
  const history=records.filter(r=>r.agentId===agentId);
  const courses=EXERCISES.map(ex=>{
    const attempts=history.filter(r=>r.courseId===ex.id);
    const best=attempts.reduce((m,a)=>Math.max(m,a.score),0);
    return {courseId:ex.id,attempts:attempts.length,best,practicePass:attempts.some(r=>r.passed)};
  });
  return {courses,passed:courses.filter(c=>c.practicePass).length,
    attempts:history.length,realCredentials:0};
}
