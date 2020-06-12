var assert = require('assert');

var parsefuncs = require('../parse.js');
var config = require('../config.js');

// input and outputs
var items = [
	{
		input: "Staunch Cape <Arcane 4>",
		category: "Equipment - Garment",
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
		category: "Equipment - Accessory",
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
		category: "Equipment - Weapon",
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
		category: "Item - Scroll/Album",
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
		category: "Headwear - Mouth",
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
		category: "Equipment - Armor",
		output: {
			name: "Sniping Suit",
			refine: 13,
			broken: true,
			enchant: "Arch",
			enchantlevel: 1,
			slots: 1
		}
	},
	{
		input: "+5 Southern Lute[2] <Morale 4> (broken)",
		category: "Equipment - Weapon",
		output: {
			name: "Southern Lute",
			refine: 5,
			broken: true,
			enchant: "Morale",
			enchantlevel: 4,
			slots: 2
		}
	},
	{
		input: "Aries Diadem [1] Blueprint",
		category: "Blueprint",
		output: {
			name: "Aries Diadem [1] Blueprint",
			refine: 0,
			broken: false,
			enchant: "none",
			enchantlevel: 0,
			slots: 0
		}
	}
];

var reqs = [
	{
		input: "-name eye of dullahan -refine 12",
		output: {
			message: "-name eyeofdullahan -refine 12",
			name: "eyeofdullahan",
			refine: 4096
		}
	},
	{
		input: "-name sTATIc shield -en tenacity -el 3,4 -asdf",
		output: {
			message: "-name staticshield -en tenacity -el 3,4",
			name: "staticshield",
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
			message: "-name runeboots -ph 5",
			name: "runeboots",
			pricehigher: 5
		}
	},
];

var summonstrings = ["@poringworldbot ", "!", "!$", "omg ", "omg"];
// all summonstrings and inputs should be lowercase
var contents = [
	{
		input: "help",
		output: { }
	},
	{
		input: "@poringworldbot ",
		output: {
			summon: "@poringworldbot ",
			command: "",
			body: "",
		}
	},
	{
		input: "@poringworldbot help",
		output: {
			summon: "@poringworldbot ",
			command: "help",
			body: "",
		}
	},
	{
		input: "@poringworldbot help me",
		output: {
			summon: "@poringworldbot ",
			command: "help",
			body: "me",
		}
	},
	{
		input: "! ping",
		output: {
			summon: "!",
			command: "",
			body: "ping",
		}
	},
	{
		input: "!$ping you",
		output: {
			summon: "!",
			command: "$ping",
			body: "you",
		}
	},
	{
		input: "omg look over there guys",
		output: {
			summon: "omg ",
			command: "look",
			body: "over there guys",
		}
	},
];

/* ====================================================================================== */
/* =================================== TEST CASES ======================================= */
/* ====================================================================================== */

describe('parsefuncs', function() {

	describe('#parseItem()', function() {
		for(let item of items) {
			it(item.input, function() {
				let parsed = parsefuncs.parseItem(item.input, item.category);
				assert.equal(parsed.name, item.output.name);
				assert.equal(parsed.refine, item.output.refine);
				assert.equal(parsed.broken, item.output.broken);
				assert.equal(parsed.enchant, item.output.enchant);
				assert.equal(parsed.enchantlevel, item.output.enchantlevel);	
			});
		}
	});

	describe('#parseReqs()', function() {
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
		config.summonstrings = summonstrings;
		for(let con of contents) {
			it(con.input, function() {
				let obj = parsefuncs.parseContent(con.input);
				assert.equal(obj.summon, con.output.summon);
				assert.equal(obj.command, con.output.command);
				assert.equal(obj.body, con.output.body);
			});
		}
	});
});