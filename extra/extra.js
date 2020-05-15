console.clear();
var refineStart = 8;
var refineStop = 9;
var failChance = 0.5;
var brokenChance = 0.25;
var numberOfItems = 2000000; // aka trials
if(numberOfItems > 10000000) throw new Error("numberOfItems exceeds limits of the universe")

// init
var elunium = 0;
var zeny = 0;
var brokenCount = new Array(15).fill(0);
var succeedToStop = 0;

console.log("simulation: refining from "+refineStart+" to "+refineStop+" without repairing")
for(let i = 0; i < numberOfItems; i++) { // noprotect
  var refineLvl = refineStart;
  var broken = false;
  while(!broken && refineLvl<refineStop) { // noprotect
    elunium++;
    zeny += (refineLvl+1)*10000;
    if(refineLvl<4) {
      refineLvl++;
      continue;
    }
    var rand = Math.random();
    refineLvl += rand > failChance ? 1 : -1;
    broken = rand < brokenChance ? true : false;
  }
  if(broken)
    brokenCount[refineLvl]++;
  else
    succeedToStop++;
}
var successProp = succeedToStop/numberOfItems;
var brokenProp = brokenCount.map(function(n) { return n/numberOfItems; });
console.log(numberOfItems+" items\n"+elunium+" elunium total used\n"+zeny+" zeny total spent");
console.log(succeedToStop+"/"+numberOfItems+" items succeeded\n"+round(successProp*100)+"% got to refine "+refineStop+" without breaking")
console.log("expected "+round(numberOfItems/succeedToStop)+" items per success\nexpected "+round(elunium/succeedToStop)+" elunium per success\nexpected "+round(zeny/succeedToStop)+" zeny per success");
var str = "";
for(let i = 3; i < refineStop-1; i++)
  str += round(brokenProp[i]*100)+"% at broken +"+i+"\n";
console.log(str);
var str = "";
for(let i = 3; i < refineStop-1; i++)
  str += "expected "+round(brokenCount[i]/succeedToStop)+" broken +"+i+" per success\n";
console.log(str);


function round(percent) { return Math.round(percent*1000) / 1000; }

// oh so you want to calculate your chances with repairing factored in? well too bad. do it yourself.

var useBrokenLimit = 4;
//console.log("simulation: repairing with items up to broken+"+useBrokenLimit)

// while still items up to broken limit
// get highest refine
// keep refining
// add to stats
// zzz

// report profit

function takeLowestBroken() {
  for(let i = 3; i <= refineStop-2; i++) {
    if(brokenCount[i]>0) {
      brokenCount[i]--;
      return i;
    }
  }
  return -1;
}
function takeHighestBroken() {
  for(let i = refineStop-2; i >=3; i--) {
    if(brokenCount[i]>0) {
      brokenCount[i]--;
      return i;
    }
  }
  return -1;
}

