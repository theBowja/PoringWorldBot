let assert = require('assert');

let parsefuncs = require('../parse.js');
let config = require('../config.js');

describe('parsefuncs', function() {

	describe('#parseItem()', function() {
		let items = require('./cases/itemnames.json'); // load test cases
		for(let item of items) {
			it(item.input, function() {
				let parsed = parsefuncs.parseItem(item.input);
				assert.equal(parsed.name, item.output.name);
				assert.equal(parsed.refine, item.output.refine);
				assert.equal(parsed.broken, item.output.broken);
				assert.equal(parsed.enchant, item.output.enchant);
				assert.equal(parsed.enchantlevel, item.output.enchantlevel);	
			});
		}
	});

	describe('#parseReqs()', function() {
		let reqs = require('./cases/reqbody.json'); // load test cases
		var callback = function() {
			var parsed = parsefuncs.parseReqs(req.input);
			for(let prop in parsed) {
				if(parsed.hasOwnProperty(prop))
					assert.equal(parsed[prop], req.output[prop]);
			} 			
		};
		for(var req of reqs) {
			it(req.input, callback);
		}
	});

	describe('#parseContent()', function() {
		let msgcontent = require('./cases/messagecontent.json'); // load test cases
		config.summonstrings = msgcontent.summonstrings;
		for(let con of msgcontent.contents) {
			it(con.input, function() {
				let obj = parsefuncs.parseContent(con.input.toLowerCase());
				assert.equal(obj.summon, con.output.summon);
				assert.equal(obj.command, con.output.command);
				assert.equal(obj.body, con.output.body);
			});
		}
	});

	describe('#parseTargetID', function() {
		let cases = require('./cases/targetbody.json'); // load test cases
		for(let c of cases) {
			it(c.input, function() {
				let res = parsefuncs.parseTargetID(c.input.toLowerCase());
				if(c.output === undefined) {
					assert.equal(res, c.output);
				} else {
					assert.equal(res.body, c.output.body);
					assert.equal(res.targetID, c.output.targetID);
				}
			});
		}
	});
});