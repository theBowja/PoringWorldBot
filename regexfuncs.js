
var regexfuncs = {};

/**
 * @param itemstring {string} - the "name" part of the snap taken from poringworld
 * @returns object with properties: name, refine, broken, enchant, enchantlevel, slots
 */
regexfuncs.parseItem = function(itemstring) {
	var props = {};
	var abomination = /^(\+(\d*)\s)?(((?!\s(\(broken\)|\[\d]|<.*>)).)*)(\s\[(\d)])?(\s<(.*)\s(\d)>)?(\s\(broken\))?/.exec(itemstring);
	props.name = abomination[3];
	props.refine = abomination[2] === undefined ? 0 : abomination[2];
	props.broken = abomination[11] === undefined ? false : true;
	props.enchant = abomination[9] === undefined ? 'none' : abomination[9];
	props.enchantlevel = abomination[10] === undefined ? 0 : abomination[10];
	props.slots = abomination[7] === undefined ? 0 : abomination[7];
	return props;
};


module.exports = regexfuncs;