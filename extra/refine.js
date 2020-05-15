console.clear();
var refineStart = 10;
var refineStop = 15;
var failChance = 0.5;
var brokenChance = 0.25;
var numberOfItems = 100000; // aka trials
if(numberOfItems > 10000000) throw new Error("numberOfItems exceeds limits of the universe");
var numlist = []
// init
var elunium = 0;
var success = 0;
var fail = 0;
var repairs = 0;
var zeny = 0;

console.log("simulation: refining from "+refineStart+" to "+refineStop+" repairing with stopping at +9");
for(let i = 0; i < numberOfItems; i++) { // noprotect
  var refineLvl = refineStart;
  while(refineLvl>=10 && refineLvl<refineStop) { // noprotect
    elunium++;
    zeny += 100000;

    var rand = Math.random();
    refineLvl += rand > failChance ? 1 : -1;
//    numitems += rand < brokenChance ? 1 : 0;
    if (rand<failChance){
      if (rand < brokenChance && refineLvl>=10 ){
        repairs+=1;
      }
    }

  }
      if (refineLvl == refineStop){
      success++;
    } else {
      fail++;
    }
}

console.log("success: " + (success/numberOfItems));
console.log("fail: " + (fail/numberOfItems));
console.log("repair per success: " + (repairs/numberOfItems));
//console.log("success: " + (success/numberOfItems));

/*
console.log(repairs+" times repaired\n"+numberOfItems+" items\n"+elunium+" elunium total used\n"+zeny+" zeny total spent");
console.log("expected "+round(repairs/numberOfItems)+" repairs per success\nexpected "+round(elunium/numberOfItems)+" elunium per success\nexpected "+round(zeny/numberOfItems)+" zeny per success");
console.log("expected broken items "+round(broken_items/numberOfItems) + ' ' + round(broken_items_got/numberOfItems));

/*
console.log(getSD(numlist));
console.log(median(numlist));
console.log(ninety(numlist));

function round(percent) { return Math.round(percent*1000) / 1000; }
function mean(numbers) {
    var total = 0, i;
    for (i = 0; i < numbers.length; i += 1) {
        total += numbers[i];
    }
    return total / numbers.length;
}
 
/**
 * The "median" is the "middle" value in the list of numbers.
 *
 * @param {Array} numbers An array of numbers.
 * @return {Number} The calculated median value from the specified numbers.
 */
function median(numbers) {
    // median of [3, 5, 4, 4, 1, 1, 2, 3] = 3
    var numsLen = numbers.length;
    numbers.sort(function(a, b){return a-b});
    numsLen -= numsLen%2 + 1
 
    if (
        numsLen % 2 === 0 // is even
    ) {
        // average of two middle numbers
        median = (numbers[numsLen / 2 - 1] + numbers[numsLen / 2]) / 2;
    } else { // is odd
        // middle number only
        median = numbers[(numsLen - 1) / 2];
    }
 
    return median;
}
function getSD (data) {
    m = mean(data);
    return Math.sqrt(data.reduce(function (sq, n) {
            return sq + Math.pow(n - m, 2);
        }, 0) / (data.length - 1));
};
function ninety(numbers) {
    // median of [3, 5, 4, 4, 1, 1, 2, 3] = 3
    var numsLen = numbers.length;
    numbers.sort(function(a, b){return a-b});
    numsLen = .95*numsLen
    numsLen -= numsLen%2 + 1
 
    if (
        numsLen % 2 === 0 // is even
    ) {
        // average of two middle numbers
        median = (numbers[numsLen / 2 - 1] + numbers[numsLen / 2]) / 2;
    } else { // is odd
        // middle number only
        median = numbers[(numsLen - 1) / 2];
    }
 
    return numbers[numsLen];
}

