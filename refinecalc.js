const prepName = require('./parse.js').prepName;

let refinecalc = {};

// all arrays must be exactly length 2
refinecalc.refinemap = [
	// WEAPON
	["Cross Bow", "Mystery Bow"],
	["Cross Bow", "Bow of the Wind Chaser"],

	["Holy Stick", "Nemesis"],
	["Holy Stick", "O’Neill’s Staff"],
	["Cardo", "Green Steel Pike"],
	["Cardo", "Saintly Glaive"],
	["Desert Twilight", "Sandstorm"],
	["Desert Twilight", "Desert Storm"],

	["Orcish Axe", "Vecer Axe"],
	["Orcish Axe", "Destroyer’s War Axe"],

	// OFFHAND
	["Memory Book", "Life Magic Book"],
	["Memory Book", "Arcane Codex"],
	["Skull Bracer", "Evil Bracer"],
	["Skull Bracer", "Skeleton Bracer"],
	["Floral Bracelet", "Rosa Bracelet"],
	["Floral Bracelet", "Rosa Chain"],
	["Fox Wrist Guard", "Noble Bracer"],
	["Fox Wrist Guard", "Golden Wrist"],
	["Statue Of Guardian Angel", "Statue Of Archangel"]




	// ARMOR



	// GARMENT



	// SHOE



	// ACCESSORY


].flat().map(ele => prepName(ele));

/**
 * Returns 0 if ("Cross Bow", "Cross Bow")
 * Returns -2 if ("Cross Bow", "Mystery Bow")
 * Returns 2 if ("Mystery Bow", "Cross Bow")
 */
refinecalc.calc = function(original, aliased) {
	let indexOriginal = refinecalc.refinemap.indexOf(prepName(original));
	let indexAliased = refinecalc.refinemap.indexOf(prepName(aliased));
	if(indexOriginal === -1 || indexAliased === -1) return 0;
	// console.log(original + ", "+aliased+" "+(indexOriginal%2 - indexAliased%2)*2)
	return (indexOriginal%2 - indexAliased%2)*2;
}


module.exports = refinecalc;