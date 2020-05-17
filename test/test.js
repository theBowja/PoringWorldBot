var assert = require('assert');

var regexfuncs = require('../parse.js');

// test cases
var items = [
	{
		input: "Staunch Cape <Arcane 4>",
		output: {
			name: "Staunch Cape",
			refine: 0,
			broken: false,
			enchant: "Arcane",
			enchantlevel: 4,
			slots: 0
		}
	},
	{
		input: "+4 Eye of Dullahan (broken)",
		output: {
			name: "Eye of Dullahan",
			refine: 4,
			broken: true,
			enchant: "none",
			enchantlevel: 0,
			slots: 0
		}
	},
	{
		input: "Cross Bow [1]",
		output: {
			name: "Cross Bow",
			refine: 0,
			broken: false,
			enchant: "none",
			enchantlevel: 0,
			slots: 1
		}
	},
	{
		input: "Transformation Scroll (Garm)",
		output: {
			name: "Transformation Scroll (Garm)",
			refine: 0,
			broken: false,
			enchant: "none",
			enchantlevel: 0,
			slots: 0
		}
	},
	{
		input: "+3 Angry Snarl <Armor 2> (broken)",
		output: {
			name: "Angry Snarl",
			refine: 3,
			broken: true,
			enchant: "Armor",
			enchantlevel: 2,
			slots: 0
		}
	},
	{
		input: "+13 Sniping Suit [1] <Arch 1> (broken)",
		output: {
			name: "Sniping Suit",
			refine: 13,
			broken: true,
			enchant: "Arch",
			enchantlevel: 1,
			slots: 1
		}
	}
];

var reqs = [
	{
		input: "-name eye of dullahan -refine 12",
		output: {
			message: "-name eye of dullahan -refine 12",
			name: "eye of dullahan",
			refine: 4096
		}
	},
	{
		input: "-name sTATIc shield -en tenacity -el 3,4 -asdf",
		output: {
			message: "-name static shield -en tenacity -el 3,4",
			name: "static shield",
			enchant: 'tenacity',
			enchantlevel: 24
		}
	},
	{
		input: "-ca headwearface -enchant morale -el 2,3,4,5,",
		output: {
			message: "-ca headwearface -enchant morale -el 2,3,4",
			category: "Headwear - Face",
			enchant: 'morale',
			enchantlevel: 28
		}
	},
	{
		input: "-category headwear  tail -enchant aRCh -pricehigher 24,041,000 -pl 100 000 000",
		output: {
			message: "-category headweartail -enchant arch -pricehigher 24041000 -pl 100000000",
			category: "Headwear - Tail",
			enchant: 'arch',
			pricehigher: 24041000,
			pricelower: 100000000,
		}
	},
	{
		input: "-name monocle -refine 3, 4,5,^,a -broken yes -enchant none",
		output: {
			message: "-name monocle -refine 3,4,5 -broken yes -enchant none",
			name: "monocle",
			refine: 56,
			broken: 1,
			enchant: 'none'
		}
	},
	{
		input: "-name rune boots -slots 3 -st 1 -broken yeah -ph 5 -pl 3",
		output: {
			message: "-name rune boots -ph 5",
			name: "rune boots",
			pricehigher: 5
		}
	},
];

describe('parsefuncs', function() {

	describe('#parseItem()', function() {
		var callback = function() {
			var parsed = regexfuncs.parseItem(item.input);
			for(let prop in parsed) {
				if(parsed.hasOwnProperty(prop))
					assert.equal(parsed[prop], item.output[prop]);
			} 			
		};
		for(var item of items) {
			it(item.input, callback);
		}
	});

	describe('#parseReqs()', function() {
		var callback = function() {
			var parsed = regexfuncs.parseReqs(req.input);
			for(let prop in parsed) {
				if(parsed.hasOwnProperty(prop))
					assert.equal(parsed[prop], req.output[prop]);
			} 			
		};
		for(var req of reqs) {
			it(req.input, callback);
		}
	});
});