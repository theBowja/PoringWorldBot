const db = require('better-sqlite3')('ohsnap.db');



var zzz = db.prepare(`ALTER TABLE requirements
  					  ADD alias INTEGER;`);
console.log(zzz.run());

// //var zzz = db.prepare(`PRAGMA table_info(requirements);`);
// var zzz = db.prepare(`select * from requirements`);

// console.log(zzz.all());

