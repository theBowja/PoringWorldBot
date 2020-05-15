var allSettled = require('promise.allsettled');
allSettled.shim(); // will be a no-op if not needed

//async function a() { return "plsreturn"; }
async function a() { return "plsreturn"; }
async function b() { throw "plsthrow"; }

function sleep(delay) {
	console.log("start sleep");
  var start = new Date().getTime();
  while (new Date().getTime() < start + delay);
  console.log("end sleep");
}

function sleepthrow(delay) {
	var start = new Date().getTime();
  while (new Date().getTime() < start + delay);
  plsthrow();
}

async function asdf() {
	var lowres = [];
	var promises = [a(), b(), a(), a()];
  return Promise.allSettled(promises)
		.then(function(results) {
			for(let res of results) {
				if(res.status === 'fulfilled')
					lowres.push(res.value);
			}
			return lowres;
		})
	//return lowres;
}

async function ups() {
	try {
		var sol = await asdf();
		console.log(sol);
	} catch (e) {
		console.log("downs "+e);
	}
}
///ups();
var num = 235123523515123;
var aabb = num.toLocaleString();
console.log(aabb);

console.log("end");