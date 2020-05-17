const db = require('better-sqlite3')('ohsnap.db');
var schema = require('./schemas.js');
var parsefuncs = require('./parse.js');

// delete tables. tables is an array of strings. will be deleted in order
function deleteTables(tables) {
  for(let t of tables)
  	db.exec('DROP TABLE IF EXISTS ' + t);
}
deleteTables(['requirements', 'channels', 'discokids', 'currentsnap']);

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
dbfuncs.clearExpiredSnaps = function() {
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
dbfuncs.addSnap = function(snap) {
	var item = parsefuncs.parseItem(snap.name);
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
		stock: snap.lastRecord.stock,
		snapend: snap.lastRecord.snapEnd
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
 * @throws this function does not throw anything yet.
 */
dbfuncs.addSnaps = function(snaps) {
	var snapReturn = [];
	for(let s of snaps) {
		let res = dbfuncs.addSnap(s);
		if(res) snapReturn.push(res);
	}
	return snapReturn;
};

/**
 * probably not needed
 * @returns array of snap objects
 */
dbfuncs.getSnaps = function() {
	var query = db.prepare('SELECT * FROM currentsnap');
 	var info = query.run();
	return info;
	// TODO ???
};

/**
 * Delete everything inside the table currentsnap
 * @returns the number of rows deleted
 */
dbfuncs.deleteAllSnaps = function() {
	var query = db.prepare('DELETE FROM currentsnap');
	var info = query.run();
	return info.changes;
};

/**
 * Adds user to database
 * @returns the id of the inserted row, or -1 if failed
 */
dbfuncs.addDiscokid = function(discordid, permission=0) {
	try {
		let zzz = db.prepare('INSERT INTO discokids (discordid, permission) VALUES (?, ?)');
		var info = zzz.run(discordid, permission);
		return info.lastInsertRowid;
	} catch(e) { return -1; }
};

/**
 * Gets the listener record using their discordid
 * @returns the object or undefined
 */
dbfuncs.getDiscokid = function(discordid) {
	let query = db.prepare('SELECT * FROM discokids WHERE discordid=?');
	return query.get(discordid);
};

// TODO
dbfuncs.listDiscokids = function() {
	var zzz = db.prepare('SELECT *  FROM discokids');
	console.log(zzz.all());
	return;
};

/**
 * Removes listener to database
 * Warning: this will also remove all related 'requirements' rows
 * @param type - enum('channel', 'user')
 * @param typeid - id of the channel of user to delete
 */
dbfuncs.deleteDiscokid = function(type, typeid) {
 // TODO: cascade delete
};

/**
 * Gets the listener record using their discordid
 * @returns the object or undefined
 */
dbfuncs.getChannel = function(channelid) {
	let query = db.prepare('SELECT * FROM channels WHERE discordchid=?');
	return query.get(channelid);
};

/**
 * Adds channel to database
 * @returns the id of the inserted row. otherwise -1 for no row
 */
 dbfuncs.addChannel = function(channelid) {
 	try {
	 	let zzz = db.prepare('INSERT INTO channels (discordchid) VALUES (?)');
		var info = zzz.run(channelid);
		return info.changes === 0 ? -1 : info.lastInsertRowid;
	} catch(e) { return 0; }
};

/**
 * Deletes channel from database
 * @returns true/false if deleted or not
 */
 dbfuncs.deleteChannel = function(channelid) {
 	let query = db.prepare('DELETE FROM channels WHERE discordchid=?');
	var info = query.run(channelid);
	return info.changes === 0 ? false : true;
};

/**
 * Adds requirement to database
 *   checks if channel or user already exists.
 * @param reqs {object} - all properties should match the schema. no extra properties. too lazy to do checking
 * @return true/false if success
 */
dbfuncs.addRequirement = function(reqs) {
	if(!reqs.hasOwnProperty('channelID') || !reqs.hasOwnProperty('discordkidID')) return false;

	let query = db.prepare(`INSERT INTO requirements (${Object.keys(reqs).join(',')}) 
							VALUES (${Object.keys(reqs).map(i => '@'+i).join(',')})`);
	let info = query.run(reqs);
	return info.changes === 1;
	// var zzz = db.prepare('INSERT INTO requirements (name, slots) VALUES ("Monocle", @listenerID)');
	// //var zzz = db.prepare('INSERT INTO requirements (name, listenerID) VALUES ("Monocle", @listenerID)');
	// zzz.run(requirement);
};

/**
 * removes requirement using its id
 * verification: needs matching listenerid or higher access level
 */
dbfuncs.removeRequirement = function(userid, reqid) {

};

/**
 * @param type - enum('general', channel', 'user')
 * @param typeid - id of the channel of user to delete
 * @return array of requirement objects of given type:typeid
 */
dbfuncs.listUserRequirements = function(userid) {
	var query = db.prepare(`SELECT * FROM requirements R
							INNER JOIN discokids U ON R.discordkidID=U.dkidID
							WHERE U.discordid=?`);
	var res = query.all(userid);
	return res;
};

dbfuncs.listAllRequirements = function() {
	var query = db.prepare(`SELECT * FROM requirements R`);
	var res = query.all();
	return res;
};

/**
 * Given a snap, returns a array of requirements that match it
 * @param snap - an object record of currentsnap
 */
dbfuncs.findRequirements = function(snap) {
	snap.refinecode = Math.pow(2, snap.refine);
	snap.enchantlevelcode = Math.pow(2, snap.enchantlevel);

	var query = db.prepare(`
		SELECT R.reqID, C.discordchid, U.discordid
		FROM requirements R 
		INNER JOIN channels C ON R.channelID=C.chID
		INNER JOIN discokids U ON R.discordkidID=U.dkidID
		WHERE (R.name IS NULL OR LOWER(R.name)=LOWER(@name)) AND
		      (R.slots IS NULL OR R.slots=@slots) AND
		      ((R.refine & @refinecode) != 0) AND
		      (R.broken IS NULL OR R.broken=@broken) AND
		      (R.pricehigher IS NULL OR R.pricehigher<=@price) AND
		      (R.pricelower IS NULL OR R.pricelower>=@price) AND
		      (R.buyers IS NULL OR R.buyers<=@buyers) AND
		      (R.enchant IS NULL OR LOWER(R.enchant)=LOWER(@enchant)) AND
		      ((R.enchantlevel & @enchantlevelcode) != 0) AND
		      (R.category IS NULL OR R.category=@category) AND
		      (R.stock IS NULL OR R.stock>=@stock)
	`);

	var result = query.all(snap);
	return result;
};

module.exports = dbfuncs;