// THIS FILE IS OUTDATED AND SHOULD NOT BE USED

const db = require('better-sqlite3')('ohsnap.db');

var schema = require('./schemas.js');
var regexfuncs = require('./regexfuncs.js');
var allSettled = require('promise.allsettled');
allSettled.shim(); // adds this function to global Promise

// delete tables. tables is an array of strings. will be deleted in order
function deleteTables(tables) {
  for(let t of tables)
  	db.exec('DROP TABLE IF EXISTS ' + t);
}
deleteTables(['requirements', 'listener', 'currentsnap']);

// init tables
// create all tables that don't exist
for (var key in schema.defs) {
	if (!schema.defs.hasOwnProperty(key)) continue;
	var sqlxd = 'CREATE TABLE IF NOT EXISTS ' + schema.defs[key];
	db.exec(sqlxd);
}

// TODO: populate with general listeners if they don't exist
/*
var zzz = db.prepare('INSERT INTO listener (channelid) VALUES ("1234")');
zzz.run();
zzz = db.prepare('INSERT INTO requirements (name, listenerID) VALUES ("tights", 1)');
zzz.run();
*/

var dbfuncs = {};

/// lmao synchronous db calls

/**
 * Clears expired snaps from the database
 * @throws - maybe the query run will fail idk
 * @returns the number of rows deleted
 */
dbfuncs.clearExpiredSnaps = async function() {
	var current = Math.floor(new Date()/1000);
	var query = db.prepare('DELETE FROM currentsnap WHERE snapend < ?');
	var info = query.run(current);
 	return info.changes;
};

/**
 * Only inserts/updates if snap not existing or if increase in stock
 * @param snap - snap object
 * @return the snap if a new or increase in stock. false if already existed
 * @throws gives warning if number of snaps in database exceeds 100
 */
dbfuncs.addSnap = async function(snap) {
	var item = regexfuncs.parseItem(snap.name);
	var s = {
		snapid: snap.id,
		name: item.name,
		slots: item.slots,
		refine: item.refine,
		broken: item.broken ? 1 : 0,
		price: snap.lastRecord.price,
		buyers: snap.lastRecord.snapBuyers,
		enchant: item.enchant,
		enchantlevel: item.enchantlevel,
		category: snap.category,
		snapend: snap.lastRecord.snapEnd,
		stock: snap.lastRecord.stock
	};
  var queryget = db.prepare('SELECT stock FROM currentsnap WHERE snapid=@snapid');
  var resget = queryget.get(s);
  if(resget === undefined) { // new item
 		var queryins = db.prepare('INSERT INTO currentsnap (snapid, name, slots, refine, broken, price, buyers, enchant, enchantlevel, category, snapend, stock) VALUES (@snapid, @name, @slots, @refine, @broken, @price, @buyers, @enchant, @enchantlevel, @category, @snapend, @stock)');
		queryins.run(s);
		return s;
  } else { // existing item
  	if(resget.stock !== s.stock) { // change in stock
  		var queryupd = db.prepare('UPDATE currentsnap SET stock=@stock WHERE snapid=@snapid');
  		queryupd.runs(s);
  		return s;
	  } else { // no change in stock
  		return false;
	  }
	}
};

/**
 * Calls addSnap multiple times.
 * @param snaps - array of snap objects
 * @return subset of the array of snaps that previously did not exist in the database
 * @throws this function does not throw anything.
 */
dbfuncs.addSnaps = async function(snaps) {
	var snapReturn = [];
	var promises = [];
	for(let s of snaps)
		promises.push(dbfuncs.addSnap(s));

	return Promise.allSettled(promises)
		.then(function(results) {
			for(let res of results) {
				if(res.status === 'rejected')
					console.error("addSnap failed because: " + res.reason);
				else if(res.hasOwnProperty('value') && res.value !== false) // assume 'fulfilled'
					snapReturn.push(res.value);
			}
			return snapReturn;
		});
};

/**
 * @returns array of snap objects
 */
dbfuncs.getSnaps = async function() {
	var query = db.prepare('SELECT * FROM currentsnap');
 	var info = query.run();
	return info;
	// TODO ???
};

/**
 * Adds listener to database
 * @returns the id of the inserted row
 */
dbfuncs.addListener = async function(listener) {
	var zzz = db.prepare('INSERT INTO listener (channelid, discordid) VALUES (@channelid, @discordid)');
	var info = zzz.run(listener);
	return info.lastInsertRowid;
};

/**
 * Gets the listener record using their discordid
 */
dbfuncs.getListener = async function(discordid) {

};

dbfuncs.listListeners = async function() {
	var zzz = db.prepare('SELECT *  FROM listener');
	console.log(zzz.all());
	return;
};

/**
 * Removes listener to database
 * Warning: this will also remove all related 'requirements' rows
 * @param type - enum('channel', 'user')
 * @param typeid - id of the channel of user to delete
 */
dbfuncs.removeListener = async function(type, typeid) {
 // TODO: cascade delete
};

/**
 * Adds requirement to database
 */
dbfuncs.addRequirement = async function(requirement) {
	requirement.listenerID = await dbfuncs.addListener(requirement);
	console.log(requirement);
	var zzz = db.prepare('INSERT INTO requirements (name, listenerID) VALUES ("Monocle", @listenerID)');
	zzz.run(requirement);
};

/**
 * removes requirement using its id
 * verification: needs matching listenerid or higher access level
 */
dbfuncs.removeRequirement = async function(userid, reqid) {

};

/**
 * @param type - enum('general', channel', 'user')
 * @param typeid - id of the channel of user to delete
 * @return array of requirement objects of given type:typeid
 */
dbfuncs.listRequirements = async function(type, typeid) {
	// TODO
};

/**
 * Given a snap, returns a array of requirements that match it
 * @param snap - an object record of currentsnap
 */
dbfuncs.findRequirements = async function(snap) {
	snap.slotscode = Math.pow(2, snap.slots);
	snap.refinecode = Math.pow(2, snap.refine);
	snap.brokencode = Math.pow(2, snap.broken);
	snap.enchantlevelcode = Math.pow(2, snap.enchantlevel);

	var query = db.prepare(`
		SELECT R.reqID, R.message, L.channelid, L.discordid
		FROM requirements R 
		INNER JOIN listener L ON R.listenerid=L.lisID
		WHERE (R.name IS NULL OR R.name=@name) AND
		      (R.slots & @slotscode) != 0 AND
		      (R.refine & @refinecode) != 0 AND
		      (R.broken & @brokencode) != 0 AND
		      (R.price IS NULL OR R.price>=@price) AND
		      (R.buyers IS NULL OR R.buyers<=@buyers) AND
		      (R.enchant='none' OR R.enchant=@enchant) AND
		      (R.enchantlevel & @enchantlevelcode) != 0 AND
		      (R.category IS NULL OR R.category=@category)
	`);
	var result = query.all(snap);
	return result;
};

module.exports = dbfuncs;