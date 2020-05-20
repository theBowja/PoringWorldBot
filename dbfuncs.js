const db = require('better-sqlite3')('ohsnap.db');
var schema = require('./schemas.js');
var parsefuncs = require('./parse.js');
var config = require('./config.js');

// delete tables. tables is an array of strings. will be deleted in order
function deleteTables(tables) {
  for(let t of tables)
  	db.exec('DROP TABLE IF EXISTS ' + t);
}

if(config.dropdbonstart)
	deleteTables(['requirements', 'channels', 'discokids', 'currentsnap']);

function init() {
	// create all tables that don't exist
	for (var key in schema.defs) {
		if (!schema.defs.hasOwnProperty(key)) continue;
		var sqlxd = 'CREATE TABLE IF NOT EXISTS ' + schema.defs[key];
		db.exec(sqlxd);
	}
	// add the owner if he doesn't exist
	let res = dbfuncs.getDiscokid(config.owner);
	if(res === undefined) {
		if(dbfuncs.addDiscokid(config.owner, config.ownerperm) === -1)
			console.log("ERROR: FAILED TO ADD OWNER");
	} else if(res.permission !== config.ownerperm && !dbfuncs.updateDiscokid(config.owner, config.ownerperm))
		console.log("ERROR: FAILED TO UPDATE OWNER PERMS");
}

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
  			queryupd.run(s);
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
dbfuncs.addDiscokid = function(discordid, guildid, permission=0) {
	try {
		let zzz = db.prepare('INSERT INTO discokids (discordid, guildid, permission) VALUES (?, ?, ?)');
		var info = zzz.run(discordid, guildid, permission);
		return info.lastInsertRowid;
	} catch(e) { return -1; }
};

/**
 * Gets the user record using discordid and guildid
 * @returns the object or undefined
 */
dbfuncs.getDiscokid = function(discordid, guildid) {
	let query = db.prepare('SELECT * FROM discokids WHERE discordid=? AND guildid=?');
	return query.get(discordid, guildid);
};

// TODO
dbfuncs.listDiscokids = function() {
	var zzz = db.prepare('SELECT *  FROM discokids');
	console.log(zzz.all());
	return;
};

/**
 * Updates the permission for a discordkid :)
 * @returns true/false if there was a change or not
 */
dbfuncs.updateDiscokid = function(dkidID, permission) {
	let query = db.prepare('UPDATE discokids SET permission=? WHERE dkidID=?');
	let res = query.run(permission, dkidID);
	return res.changes !== 0;
};

/**
 * Removes user to database
 * Warning: this will also remove all related 'requirements' rows
 * @param type - enum('channel', 'user')
 */
dbfuncs.deleteDiscokid = function(dkidID) {
 	let query = db.prepare('DELETE FROM discokids WHERE dkidID=?');
	var info = query.run(dkidID);
	return info.changes === 0 ? false : true;
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
 dbfuncs.addChannel = function(channelid, limitedto) {
 	try {
	 	let zzz = db.prepare('INSERT INTO channels (discordchid, limitedto) VALUES (?, ?)');
		var info = zzz.run(channelid, limitedto);
		return info.changes === 0 ? -1 : info.lastInsertRowid;
	} catch(e) { return -1; }
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
};

/**
 * removes requirement using its id
 * @return {bool} for if row is deleted
 */
dbfuncs.deleteRequirement = function(reqid) {
	let query = db.prepare('DELETE FROM requirements WHERE reqID=?');
	let res = query.run(reqid);
	return res.changes > 0;
};

/**
 * Gets the requirement row object based on reqID
 * @return {object} or undefined
 */
dbfuncs.getRequirement = function(reqid) {
	let query = db.prepare(`SELECT * FROM requirements R 
							INNER JOIN channels C ON R.channelID=C.chID
							INNER JOIN discokids U ON R.discordkidID=U.dkidID
							WHERE R.reqID=?`);
	let res = query.get(reqid);
	return res;
};

/**
 * @param userid - discordid of the user
 * @return array of requirement objects of given type
 */
dbfuncs.listUserRequirements = function(userid, guildid, channelid) {
	var query = db.prepare(`SELECT * FROM requirements R
							INNER JOIN discokids U ON R.discordkidID=U.dkidID
							INNER JOIN channels C ON R.channelID=C.chID
							WHERE U.discordid=? AND
								  U.guildid=? AND
								  C.discordchid=?`);
	var res = query.all(userid, guildid, channelid);
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
			  (R.slotted IS NULL OR R.slotted=@slotted) AND
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

init();

module.exports = dbfuncs;