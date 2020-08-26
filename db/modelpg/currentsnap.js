const db = require('better-sqlite3')('ohsnap.db');

let currentsnap = {};

currentsnap.schema = `
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

/**
 * Clears expired snaps from the database
 * @throws - maybe the query run will fail idk
 * @returns the number of rows deleted
 */
currentsnap.clearExpired = function() {
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
currentsnap.add = function(snap) {
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
currentsnap.addMultiple = function(snaps) {
    var snapReturn = [];
    for(let s of snaps) {
        let res = currentsnap.addSnap(s);
        if(res) snapReturn.push(res);
    }
    return snapReturn;
};

/**
 * probably not needed
 * @returns array of snap objects
 */
currentsnap.getAll = function() {
    var query = db.prepare('SELECT * FROM currentsnap');
    return query.all();
};

module.exports = currentsnap;