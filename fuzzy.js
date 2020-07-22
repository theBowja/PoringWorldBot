const fuzzysort = require('fuzzysort');
const lists = require('./lists.js');

let fuzzy = {};


fuzzy.enchant = function(query) {
	let result = fuzzysort.go(query, lists.enchant, { limit: 1 })[0]
	return result === undefined ? result : result.target;
}












module.exports = fuzzy;
