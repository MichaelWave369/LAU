import test from "node:test";
import assert from "node:assert/strict";
import { spawnWalkers, entranceFor, pathToBuilding, travelOneStep, anyWalking } from "../src/navigation.js";

test("all six agents spawn in the correct scene",()=>{
  for(const scene of ["grounds","office","academy"]){
    const people=spawnWalkers(scene);
    assert.equal(Object.keys(people).length,6);
    assert.equal(people.forge.route.length,0);
    assert.ok(Number.isFinite(people.forge.x));
  }
});
test("all buildings can be reached via corridor-aligned orthogonal segments",()=>{
  for(const [scene,id] of [["grounds","library"],["grounds","commons"],["office","engineering"],["academy","lab"]]){
    const start={x:205,y:330};
    const route=pathToBuilding(scene,start,id);
    const end=entranceFor(scene,id);
    assert.deepEqual(route.at(-1),end);
    let previous=start;
    for(const point of route){
      assert.ok(point.x===previous.x || point.y===previous.y,"every leg is axis aligned");
      previous=point;
    }
  }
});
test("walker advances on segments with no teleportation and emits one arrival",()=>{
  const start={x:205,y:330};
  const route=pathToBuilding("grounds",start,"library");
  let walker={...start,route,destination:"library",arrived:null};
  let ticks=0;
  while(walker.route.length && ticks<300){
    const next=travelOneStep(walker);
    const displacement=Math.hypot(next.x-walker.x,next.y-walker.y);
    assert.ok(displacement<=13.001);
    walker=next;
    ticks++;
  }
  assert.ok(ticks>5 && ticks<300);
  assert.equal(walker.arrived,"library");
  assert.equal(walker.destination,null);
  assert.equal(walker.route.length,0);
  assert.deepEqual(travelOneStep(walker),walker);
});
test("invalid targets do not create a path",()=>{
  assert.deepEqual(pathToBuilding("grounds",{x:1,y:2},"not-found"),[]);
  assert.equal(entranceFor("unknown","library"),null);
});
test("movement flags include only active routes",()=>{
  const agents=spawnWalkers("grounds");
  assert.equal(anyWalking(agents),false);
  agents.forge.route=[{x:205,y:385}];
  assert.equal(anyWalking(agents),true);
});
