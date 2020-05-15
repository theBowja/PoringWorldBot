var assert = require('assert');

var regexfuncs = require('../regexfuncs.js');

// test cases
var items = [
	{
		label: "Staunch Cape <Arcane 4>",
		name: "Staunch Cape",
		refine: 0,
		broken: false,
		enchant: "Arcane",
		enchantlevel: 4,
		slots: 0
	},
	{
		label: "+4 Eye of Dullahan (broken)",
		name: "Eye of Dullahan",
		refine: 4,
		broken: true,
		enchant: "none",
		enchantlevel: 0,
		slots: 0
	},
	{
		label: "Cross Bow [1]",
		name: "Cross Bow",
		refine: 0,
		broken: false,
		enchant: "none",
		enchantlevel: 0,
		slots: 1
	},
	{
		label: "Transformation Scroll (Garm)",
		name: "Transformation Scroll (Garm)",
		refine: 0,
		broken: false,
		enchant: "none",
		enchantlevel: 0,
		slots: 0
	},
	{
		label: "+3 Angry Snarl <Armor 2> (broken)",
		name: "Angry Snarl",
		refine: 3,
		broken: true,
		enchant: "Armor",
		enchantlevel: 2,
		slots: 0
	},
	{
		label: "+13 Sniping Suit [1] <Arch 1> (broken)",
		name: "Sniping Suit",
		refine: 13,
		broken: true,
		enchant: "Arch",
		enchantlevel: 1,
		slots: 1
	}
];

describe('regexfuncs', function() {
  describe('#parseItem()', function() {
  	it('should pass all test cases', function() {
  		for(let item of items) {
  			var parsed = regexfuncs.parseItem(item.label);
  			for(let prop in parsed) {
  				if(parsed.hasOwnProperty(prop))
  					assert.equal(parsed[prop], item[prop]);
  			}
  		}
  	});
  });
});