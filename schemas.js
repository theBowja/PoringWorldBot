var schema = {};

schema.defs = {};

schema.defs.listener = `
listener (
	lisID INTEGER PRIMARY KEY AUTOINCREMENT,
	permission INTEGER NOT NULL DEFAULT 0,
	channelid TEXT NOT NULL,
	discordid TEXT UNIQUE
)`;

schema.defs.requirements = `
requirements (
	reqID INTEGER PRIMARY KEY AUTOINCREMENT ,
	name TEXT,
	slots BLOB NOT NULL DEFAULT 7,
	refine BLOB NOT NULL DEFAULT 65535,
	broken BLOB NOT NULL DEFAULT 3,
	price INTEGER,
	buyers INTEGER,
	enchant TEXT NOT NULL DEFAULT 'none',
	enchantlevel BLOB NOT NULL DEFAULT 31,
	category TEXT,

	listenerID INTEGER NOT NULL,
	message TEXT,

	FOREIGN KEY (listenerID) REFERENCES listener(lisID)
)`;

schema.defs.currentsnap = `
currentsnap (
	currID INTEGER PRIMARY KEY AUTOINCREMENT,
	snapid INTEGER UNIQUE NOT NULL,

	name TEXT NOT NULL,
	slots TEXT NOT NULL,
	refine TEXT NOT NULL,
	broken TEXT NOT NULL,
	price INTEGER NOT NULL,
	buyers INTEGER NOT NULL,
	enchant TEXT NOT NULL,
	enchantlevel TEXT NOT NULL,
	category TEXT NOT NULL,

	snapend INTEGER NOT NULL,
	stock INTEGER NOT NULL
)`;





module.exports = schema;