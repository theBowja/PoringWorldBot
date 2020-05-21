var schema = {};

schema.defs = {};

schema.defs.channels = `
channels (
	chID INTEGER PRIMARY KEY AUTOINCREMENT,
	discordchid TEXT UNIQUE NOT NULL,
	limitedto INTEGER NOT NULL DEFAULT 0
)`;

// a kid in different guilds may have different permission levels
schema.defs.discokids = `
discokids (
	dkidID INTEGER PRIMARY KEY AUTOINCREMENT,
	permission INTEGER NOT NULL DEFAULT 0,
	discordid TEXT NOT NULL,
	guildid TEXT NOT NULL,
	UNIQUE(discordid, guildid)
)`;

// store as lowercase
// discordkidID and channelID are schema internal ID, not discord IDs
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

	FOREIGN KEY (discordkidID) REFERENCES discokids(dkidID) ON DELETE CASCADE,
	FOREIGN KEY (channelID) REFERENCES channels(chID) ON DELETE CASCADE
)`;

// icon is for image purposes
// make sure everything lowercase
schema.defs.currentsnap = `
currentsnap (
	currID INTEGER PRIMARY KEY AUTOINCREMENT,

	snapid INTEGER UNIQUE NOT NULL,
	icon TEXT,

	name TEXT NOT NULL,
	slots TEXT NOT NULL,
	refine TEXT NOT NULL,
	broken INTEGER NOT NULL,
	price INTEGER NOT NULL,
	buyers INTEGER NOT NULL,
	enchant TEXT NOT NULL,
	enchantlevel TEXT NOT NULL,
	category TEXT NOT NULL,
	stock INTEGER NOT NULL,

	snapend INTEGER NOT NULL
)`;





module.exports = schema;