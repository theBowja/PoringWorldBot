const db = require('better-sqlite3')('ohsnap.db');
var schema = require('./schemas.js');
var parsefuncs = require('./parse.js');
var config = require('./config.js');

// delete tables. tables is an array of strings. will be deleted in order
function deleteTables(tables) {
    console.log('Dropping database tables');
    for(let t of tables)
        db.exec('DROP TABLE IF EXISTS ' + t);
}

if(config.dropdbonstart)
    deleteTables(['requirements', 'channels', 'discokids', 'currentsnap']);

// create all tables that don't exist
for (var key in schema.defs) {
    if (!schema.defs.hasOwnProperty(key)) continue;
    var sqlxd = 'CREATE TABLE IF NOT EXISTS ' + schema.defs[key];
    db.exec(sqlxd);
}

var dbfuncs = {};

// make backup depending on day of week
dbfuncs.backup = function(name) {
    if(name === undefined || name === '') return false;
    db.backup(`backupdbs/${name}.sqlite3`)
    .then(() => {
        console.log(`BACKUP complete: ${name}.sqlite3`);
    })
    .catch((err) => {
        console.log('BACKUP failed:', err);
    });
};

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
        icon: snap.cardPicture || snap.icon,
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
    return query.all();
};

/**
 * Parameters: dkidID and chID are primary ids for the discordkid and channels table
 * Returns true if there was a change.
 */
dbfuncs.setBudget = function(dkidID, chID, budget) {
    if(budget < 0) budget = null;
    let mreqID = dbfuncs.getOrCreateMetareqID(dkidID, chID);
    let query = db.prepare(`UPDATE metareqs SET budget=? WHERE mreqID=?`)
    return query.run(budget, mreqID).changes !== 0
};

/**
 * Gets the budget value from the metareqs table
 * Parameters: dkidID and chID are primary ids for the discordkid and channels table
 * Returns the budget value, or -1 if no budget found
 */
dbfuncs.getBudget = function(dkidID, chID) {
    var query = db.prepare(`SELECT budget FROM metareqs
                            WHERE discordkidID=? AND
                                  channelID=?`);
    return query.get(dkidID, chID) || -1;
}

/**
 * Creates a new row into metareqs table
 * Parameters: dkidID and chID are primary ids for the discordkid and channels table
 * Returns the primary ID for the newly created row, undefined if failed (maybe because not unique?)
 */
dbfuncs.addMetareq = function(dkidID, chID) {
    try {
        let query = db.prepare(`INSERT INTO metareqs (discordkidID, channelID) VALUES (?, ?)`);
        return query.run(dkidID, chID).lastInsertRowid;
    } catch(e) {
        return undefined;
    }
}

// parameters are the table primary IDs
dbfuncs.getMetareq = function(dkidID, chID) {
    var query = db.prepare(`SELECT * FROM metareqs
                            WHERE discordkidID=? AND
                                  channelID=?`);
    return query.get(dkidID, chID);
};

/**
 * returns the metareq primary id. if it doesn't exist, then create one and return that id
 */
dbfuncs.getOrCreateMetareqID = function(dkidID, chID) {
    let mreq = dbfuncs.getMetareq(dkidID, chID);
    return mreq === undefined ? dbfuncs.addMetareq(dkidID, chID) : mreq.mreqID;
}

dbfuncs.getAllMetareqs = function() {
    var query = db.prepare('SELECT * FROM metareqs');
    return query.all();
};

/**
 * Delete everything inside the table currentsnap
 * @returns the number of rows deleted
 */
dbfuncs.deleteAllCurrentSnaps = function() {
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

/**
 * @returns array with every discokid in the database
 */
dbfuncs.listDiscokids = function() {
    var zzz = db.prepare('SELECT *  FROM discokids');
    return zzz.all();
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
 * Removes users with matching discordid and guildid in database
 * @returns number of rows removed
 */
dbfuncs.deleteMember = function(discordid, guildid) {
    let query = db.prepare('DELETE FROM discokids WHERE discordid=? AND guildid=?');
    var info = query.run(discordid, guildid);
    return info.changes;
};

/**
 * Removes all users with matching guildid in database
 * @returns object with info for discokids and channels. check info.changes
 */
dbfuncs.deleteGuild = function(guildid) {
    let q1 = db.prepare('DELETE FROM discokids WHERE guildid=?');
    let q2 = db.prepare('DELETE FROM channels WHERE guildid=?');
    let res1 = q1.run(guildid).changes;
    let res2 = q2.run(guildid).changes;
    return { discokids: res1, channels: res2 };
};

/**
 * Gets the listener record using their discordid
 * @returns the object or undefined
 */
dbfuncs.getChannel = function(channelid) {
    let query = db.prepare('SELECT * FROM channels WHERE discordchid=?');
    return query.get(channelid);
};

// get all channel records
dbfuncs.getAllChannels = function() {
    let query = db.prepare('SELECT * FROM channels');
    return query.all();
};

/**
 * Adds channel to database
 * @returns the id of the inserted row. otherwise -1 for no row
 */
 dbfuncs.addChannel = function(channelid, guildid, limitedto) {
    try {
        let zzz = db.prepare('INSERT INTO channels (discordchid, guildid, limitedto) VALUES (?, ?, ?)');
        var info = zzz.run(channelid, guildid, limitedto);
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
 * Deletes all channels provided in array
 * @param chanids - an array of ids that isn't empy
 * @returns number of channels deleted
 */
dbfuncs.deleteMultipleChannels = function(chanids) {
    return chanids.reduce((acc, cid) => { return dbfuncs.deleteChannel(cid) + acc; });
};

/**
 * Adds requirement to database
 *   checks if channel or user already exists.
 * @param reqs {object} - all properties should match the schema. no extra properties. everything lowercase too lazy to do checking
 * @return the info object: { info.changes, info.lastInsertRowid }
 */
dbfuncs.addRequirement = function(dkidID, chID, reqs) {
    reqs.mreqID = dbfuncs.getOrCreateMetareqID(dkidID, chID);
    let query = db.prepare(`INSERT INTO requirements (${Object.keys(reqs).join(',')}) 
                            VALUES (${Object.keys(reqs).map(i => '@'+i).join(',')})`);
    return query.run(reqs);
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
                            INNER JOIN metareqs MR ON R.metareqID=MR.mreqID
                            INNER JOIN channels C ON MR.channelID=C.chID
                            INNER JOIN discokids U ON MR.discordkidID=U.dkidID  
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
                            INNER JOIN metareqs MR ON R.metareqID=MR.mreqID
                            INNER JOIN channels C ON MR.channelID=C.chID
                            INNER JOIN discokids U ON MR.discordkidID=U.dkidID      
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
    snap.namesearch = parsefuncs.prepName(snap.alias ? snap.aliasname : snap.name); // remove nonletters and nonnumbers from name
    // hardcode aliases
    if(snap.namesearch === "floralbracelet" && snap.alias === 1) snap.refine = snap.refine - 2;

    snap.enchantspec = snap.enchant.toLowerCase().replace(/[^a-z]/g, ''); // remove whitespace from enchant
    snap.slotted = snap.slots - (snap.category === 'Equipment - Weapon'); // calculated slotted bool
    snap.refinecode = Math.pow(2, snap.refine); // for bitwise anding
    snap.enchantlevelcode = Math.pow(2, snap.enchantlevel); // for bitwise anding

    var query = db.prepare(`
        SELECT R.reqID, C.discordchid, U.discordid
        FROM requirements R 
        INNER JOIN metareqs MR ON R.metareqID=MR.mreqID
        INNER JOIN channels C ON MR.channelID=C.chID
        INNER JOIN discokids U ON MR.discordkidID=U.dkidID        
        WHERE (R.name IS NULL OR R.name=@namesearch) AND
              (R.slotted IS NULL OR R.slotted=@slotted) AND
              ((R.refine & @refinecode) != 0) AND
              (R.broken IS NULL OR R.broken=@broken) AND
              (R.pricehigher IS NULL OR R.pricehigher<=@price) AND
              (R.pricelower IS NULL OR R.pricelower>=@price) AND
              (MR.budget IS NULL OR @price<=MR.budget) AND
              (R.buyers IS NULL OR R.buyers<=@buyers) AND
              (R.enchant IS NULL OR R.enchant=@enchantspec) AND
              ((R.enchantlevel & @enchantlevelcode) != 0) AND
              (R.category IS NULL OR R.category=@category) AND
              (R.stock IS NULL OR R.stock>=@stock) AND
              (R.alias=1 OR @alias=0)
    `);

    var result = query.all(snap);
    return result;
};

module.exports = dbfuncs;