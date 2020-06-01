const db = require('better-sqlite3')('ohsnap.db');

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

