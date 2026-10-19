// Read-only model-output *diagnostics*, not a verified capability registry.
// The model field and all report origins can be forged, even with matching hashes.
export function buildCapabilityProfiles(reports){
  if(!Array.isArray(reports)) return [];
  const byModel=new Map();
  for(const r of reports){
    if(!r||typeof r.model!=="string"||typeof r.courseId!=="string")continue;
    if(!byModel.has(r.model))byModel.set(r.model,{model:r.model,total:0,valid:0,invalid:0,courses:new Map()});
    const m=byModel.get(r.model);
    m.total++;
    const valid=r.status==="GRADED"&&Number.isInteger(r.grade?.score)&&r.grade.score>=0&&r.grade.score<=100;
    if(valid)m.valid++;else m.invalid++;
    if(!m.courses.has(r.courseId))m.courses.set(r.courseId,{id:r.courseId,runs:0,valid:0,invalid:0,scores:[],rubrics:new Set()});
    const c=m.courses.get(r.courseId);
    c.runs++;
    if(typeof r.requestPromptHash==="string")c.rubrics.add(r.requestPromptHash);
    if(valid){c.valid++;c.scores.push(r.grade.score);}else c.invalid++;
  }
  return [...byModel.values()].map(m=>{
    const courses=[...m.courses.values()].map(c=>{
      const ordered=[...c.scores].sort((a,b)=>a-b);
      const mid=Math.floor(ordered.length/2);
      const median=ordered.length?(ordered.length%2?ordered[mid]:(ordered[mid-1]+ordered[mid])/2):null;
      return {
        courseId:c.id,runs:c.runs,valid:c.valid,invalid:c.invalid,
        formatRate:Math.round(c.valid/c.runs*100),
        mean:c.valid?Math.round(c.scores.reduce((s,n)=>s+n,0)/c.valid):null,
        median,best:c.valid?ordered.at(-1):null,worst:c.valid?ordered[0]:null,
        passCount:c.scores.filter(n=>n>=67).length,
        rubricVariants:c.rubrics.size
      };
    }).sort((a,b)=>a.courseId.localeCompare(b.courseId));
    return {model:m.model,total:m.total,valid:m.valid,invalid:m.invalid,
      formatRate:Math.round(m.valid/m.total*100),
      courses,realCredentials:0,verification:"UNVERIFIED"};
  }).sort((a,b)=>a.model.localeCompare(b.model));
}
