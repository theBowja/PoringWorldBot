var schema = {};

schema.defs = {};

schema.defs.channels = `
channels (
	chID INTEGER PRIMARY KEY AUTOINCREMENT,
	discordchid TEXT UNIQUE NOT NULL,
	limitedto INTEGER NOT NULL DEFAULT 0
)`;

schema.defs.discokids = `
discokids (
	dkidID INTEGER PRIMARY KEY AUTOINCREMENT,
	permission INTEGER NOT NULL DEFAULT 0,
	discordid TEXT UNIQUE NOT NULL
)`;

// store as lowercase
// discordkidID and channelID are internal ID, not discord IDs
schema.defs.requirements = `
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

	discordkidID INTEGER NOT NULL,
	channelID INTEGER NOT NULL,

	FOREIGN KEY (discordkidID) REFERENCES discokids(dkidID),
	FOREIGN KEY (channelID) REFERENCES channels(chID)
)`;

// make sure everything lowercase
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
	stock INTEGER NOT NULL,

	snapend INTEGER NOT NULL
)`;





module.exports = schema;