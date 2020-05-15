console.clear();
var refineStart = 4;
var refineStop = 15;
var failChance = 0.5;
var brokenChance = 0.25;
var numberOfItems = 1000000; // aka trials
if(numberOfItems > 10000000) throw new Error("numberOfItems exceeds limits of the universe");

// init
var elunium = 0;
var repairs = 0;
var zeny = 0;

console.log("simulation: refining from "+refineStart+" to "+refineStop+" repairing without stopping");
for(let i = 0; i < numberOfItems; i++) {
  var refineLvl = refineStart;
  while(refineLvl<refineStop) {
    elunium++;
    zeny += (refineLvl+1)*10000;
    if(refineLvl<4) {
      refineLvl++;
      continue;
    }
    var rand = Math.random();
    refineLvl += rand > failChance ? 1 : -1;
    repairs += rand < brokenChance ? 1 : 0;
  }
}

console.log(repairs+" times repaired\n"+numberOfItems+" items\n"+elunium+" elunium total used\n"+zeny+" zeny total spent");
console.log("expected "+round(repairs/numberOfItems)+" repairs per success\nexpected "+round(elunium/numberOfItems)+" elunium per success\nexpected "+round(zeny/numberOfItems)+" zeny per success");


function round(percent) { return Math.round(percent*1000) / 1000; }

