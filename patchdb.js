const db = require('better-sqlite3')('ohsnap.db');
const schemas = require('./schemas.js');
const dbfuncs = require('./dbfuncs.js');

// This file is for updating database schemas between project version

let projectversion;
let databaseversion;

let versionHistory = ["1.0.0", "1.0.1"];

let patchdb = {};

// Returns true if there has been a version change for the project
patchdb.checkVersionChange = function() {
// retrieve version from package.json
// retrieve version from database
// if no version exists in database, then insert version and return false
}

patchdb.doPatches = function() {
	patch0();
}

/**
 * Patch from version 1.0.0 to 1.0.1
 * Changes:
 * - added budgetID foreign key to requirements table
 */
function patch0() {
	let newrequirements = `
		requirements (
			reqID INTEGER PRIMARY KEY AUTOINCREMENT,

			message TEXT,

			name TEXT,
			slotted INTEGER,
			refine BLOB NOT NULL DEFAULT 65535,
			broken INTEGER,
			pricehigher INTEGER,
			pricelower INTEGER,
			buyers INTEGER,
			enchant TEXT,
			enchantlevel BLOB NOT NULL DEFAULT 31,
			category TEXT,
			stock INTEGER,
			alias INTEGER NOT NULL DEFAULT 0,

		  	metareqID INTEGER,
		  	FOREIGN KEY (metareqID) REFERENCES metareqs(mreqID) ON DELETE CASCADE
		)`;

	console.log("starting");
	let allreqs = dbfuncs.listAllRequirements(); // should have discordkidID and channelID

	let rename = db.prepare('ALTER TABLE requirements RENAME TO temp');
	console.log(rename.run());
	let create = db.prepare(`CREATE TABLE ${newrequirements}`);
	console.log(create.run());
	let insert = db.prepare(`INSERT INTO requirements (message, name, slotted, refine, broken, pricehigher, pricelower,
													   buyers, enchant, enchantlevel, category, stock, alias, metareqID)
							 VALUES (@message, @name, @slotted, @refine, @broken, @pricehigher, @pricelower,
							 		 @buyers, @enchant, @enchantlevel, @category, @stock, @alias, @metareqID)`)
	for(let r of allreqs) {
		r.metareqID = dbfuncs.getOrCreateMetareqID(r.discordkidID, r.channelID);
		console.log(insert.run(r));
	}
	let drop = db.prepare('DROP TABLE IF EXISTS requirements').
	console.log(drop.run());
	console.log("done");
}

// this function is for cleaning up the database of loose id references and mistyped names
patchdb.cleanup = function() {
	// remove all users with 0 requirements made
	// remove all users not found in guilds
	// remove all roles not found in guilds
	// check if bot has access to all guilds in guilds
}

/*


var zzz = db.prepare(`ALTER TABLE requirements
  					  RENAME TO reqold;`);
console.log(zzz.run());

var lol = `
requirements (
	reqID INTEGER PRIMARY KEY AUTOINCREMENT,

	message TEXT,

	name TEXT,
	slotted INTEGER,
	refine BLOB NOT NULL DEFAULT 65535,
	broken INTEGER,
	pricehigher INTEGER,
	pricelower INTEGER,
	buyers INTEGER,
	enchant TEXT,
	enchantlevel BLOB NOT NULL DEFAULT 31,
	category TEXT,
	stock INTEGER,
	alias INTEGER NOT NULL DEFAULT 0,

	discordkidID INTEGER NOT NULL,
	channelID INTEGER NOT NULL,

	FOREIGN KEY (discordkidID) REFERENCES discokids(dkidID) ON DELETE CASCADE,
	FOREIGN KEY (channelID) REFERENCES channels(chID) ON DELETE CASCADE
)`;

var sqlxd = 'CREATE TABLE IF NOT EXISTS ' + lol;
db.exec(sqlxd);


var yyy = db.prepare(`INSERT INTO requirements (reqID, message, name, slotted, refine, broken, pricehigher, pricelower, buyers, enchant, enchantlevel, category, stock, alias, discordkidID, channelID)
					  SELECT reqID, message, name, slotted, refine, broken, pricehigher, pricelower, buyers, enchant, enchantlevel, category, stock, alias, discordkidID, channelID
   					  FROM reqold;`);
console.log(yyy.run());


// var zzz = db.prepare(`UPDATE requirements
//   					  SET alias = 0
//   					  WHERE alias IS NULL;`);
// console.log(zzz.run());



// //var zzz = db.prepare(`PRAGMA table_info(requirements);`);
// var zzz = db.prepare(`select * from requirements`);

// console.log(zzz.all());
*/
module.exports = patchdb;