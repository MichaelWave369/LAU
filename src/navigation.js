// Scene paths are illustrative campus corridors, not a collision-aware game engine.
import { AGENTS, BUILDINGS } from "./sim.js";

export const WALK_SPEED = 13;
const WALKWAY_Y = Object.freeze({grounds:385,office:365,academy:365});
const SCENES = Object.keys(WALKWAY_Y);

export function spawnWalkers(scene) {
  if (!SCENES.includes(scene)) throw new Error("Unknown campus scene");
  return Object.fromEntries(AGENTS.map(a=>[a.id,{
    x:a[scene][0],y:a[scene][1],route:[],destination:null,arrived:null
  }]));
}

export function entranceFor(scene, buildingId) {
  const b=BUILDINGS[scene]?.find(v=>v.id===buildingId);
  if (!b) return null;
  const road=WALKWAY_Y[scene];
  // Approach from the open edge beside the central footpath.
  // North-facing rooms are approached from the south; southern rooms from the north.
  const y=b.y+b.h<road ? Math.min(road-12,b.y+b.h+17) : road+10;
  return {x:Math.round(b.x+b.w/2),y};
}

export function pathToBuilding(scene, from, buildingId) {
  const end=entranceFor(scene,buildingId);
  if (!end || !Number.isFinite(from?.x) || !Number.isFinite(from?.y)) return [];
  const road=WALKWAY_Y[scene];
  const raw=[
    {x:from.x,y:road},
    {x:end.x,y:road},
    end
  ];
  const result=[];
  let last={x:from.x,y:from.y};
  for(const p of raw){
    if(Math.hypot(p.x-last.x,p.y-last.y)>0.001)result.push(p);
    last=p;
  }
  return result;
}

export function travelOneStep(walker,speed=WALK_SPEED) {
  if(!walker.route?.length) return walker;
  const [target,...after]=walker.route;
  const dx=target.x-walker.x,dy=target.y-walker.y;
  const distance=Math.hypot(dx,dy);
  if(distance<=speed){
    return {...walker,x:target.x,y:target.y,route:after,
      arrived:after.length===0?walker.destination:null,
      destination:after.length===0?null:walker.destination};
  }
  return {...walker,x:walker.x+dx/distance*speed,y:walker.y+dy/distance*speed,arrived:null};
}

export function anyWalking(walkers) {
  return Object.values(walkers).some(w=>w.route.length>0);
}
