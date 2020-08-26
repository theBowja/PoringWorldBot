const { Pool } = require('pg');
const pool = new Pool();




let mydb = {};



// redo this programmatically probably
mydb.channels = require('./modelpg/channels.js');
mydb.currentsnap = require('./modelpg/currentsnap.js');
mydb.discokids = require('./modelpg/discokids.js');
mydb.metareqs = require('./modelpg/metareqs.js');
mydb.requirements = require('./modelpg/requirements.js');
mydb.version = require('./modelpg/version.js');












module.exports = mydb;