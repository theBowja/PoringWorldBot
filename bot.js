//var Discord = require('discord.io');
const Discord = require('discord.js');
const bot = new Discord.Client();
var logger = require('winston');
var auth = require('./auth.json');
var parsefuncs = require('./parse.js');
var config = require('./config.js');
var https = require('https');
var CronJob = require('cron').CronJob;
var fs = require("fs");


var dbfuncs = require("./dbfuncs.js");

// Configure logger settings
logger.remove(logger.transports.Console);
logger.add(new logger.transports.Console, {
    colorize: true
});
logger.level = 'debug';

bot.on('ready', () => {
  console.log(`Logged in with id ${bot.user.id} as ${bot.user.tag}!`);

//   new CronJob('* 0,20,40 * * * *', function() {    })
//   // new CronJob('* * * * *', function() {
//   //     console.log(new Date());
//   // }, null, true)
//   // TODO: load list of watching channels into a global variable or cache
});

bot.on('message', message => {
  let userID = message.author.id;
  let channelID = message.channel.id;
  // message.channel.type = 'text' or 'dm'
  let content = message.content.trim().split(/\s+/);

  if(content[0] !== `<@!${bot.user.id}>`) return; // if not mention bot, ignore
  if(userID === bot.user.id) return; // if from self, ignore
  if(message.author.bot === true) return; // if from bot, ignore
  if(content.length === 1) return; // if nothing else, ignore

  // retrieve user info if he exists in database
  let userObj = dbfuncs.getDiscokid(userID);
  if(userObj === undefined) userObj = { permission: 0 };

  logger.info(`user ${userID} to channel ${channelID}: ${content.slice(1).join(' ')}`);

  // COMMANDS WITH NO PERMISSION LEVEL REQUIRED
  if(content[1] === 'help') {
    // TODO: dm them the ENTIRE GUIDE based on their access level
    message.author.send('urbad');

  } else if(content[1] === 'pingmewhen') {
    // check if channel is on watch
    let channelobj = dbfuncs.getChannel(channelID);
    if(channelobj === undefined) return; // straight up ignore
    // restricts user if they have higher or equal permission level to channel permission requirements
    if(userObj.permission < channelobj.limitedto) return message.react('🔒');

    if(content.length <= 2) return message.react('❎'); // no reqs found

    let pars = parsefuncs.parseReqs(content.slice(2).join(' '));
    if(pars.message === '') return message.react('❎'); // no coherent parameters given by user

    // if user doesn't exist in database, then add him
    if(userObj.dkidID === undefined)
      userObj.dkidID = dbfuncs.addDiscokid(userID);
    else if(userObj.permission === 0 && dbfuncs.listUserRequirements(userID) >= config.limitreqs)
      return message.react('❎'); // user has reached the limit for reqs to make

    pars.discordkidID = userObj.dkidID;
    pars.channelID = channelobj.chID;

    let res = dbfuncs.addRequirement(pars);
    message.react(res ? '✅' : '❎');

  } else if(content[1] === 'showme') {
    let res = dbfuncs.listUserRequirements(userID);
    let msg = '';
    for(let r of res)
      msg += r.reqID+': '+r.message+'\n';
    message.channel.send(msg === '' ? 'u have nothing' : '```'+msg+'```');

  } 

  // no peasants allowed past this
  if(userObj.permission === 0) return;

  // COMMANDS THAT REQUIRES HIGHER PERMISSION LEVEL
  if(content[1] === 'showhere') {
    // TODO: showhere for channel. only admins can run this
    // NOT IMPLEMENTED

  } else if(content[1] === 'watch' ||  // add this channel to channels table
            content[1] === 'listenhereyoulittleshi') {
    let limitedto = parseInt(content[2]);
    if(isNaN(limitedto)) limitedto = 0;
    if(userObj.permission < limitedto) return message.react('❎');
    let res = dbfuncs.addChannel(channelID, limitedto);
    message.react(res !== -1 ? '✅' : '❎');

  } else if(content[1] === 'unwatch') { // remove this channel from channels table
    let res = dbfuncs.deleteChannel(channelID);
    message.react(res ? '✅' : '❎');

  } else if(content[1] === 'showall') {
    // TODO: limit this to owner
    let res = dbfuncs.listAllRequirements();
    console.log(res);

  } else if(content[1] === 'clearsnaps') {
    dbfuncs.deleteAllSnaps();

  } else if(content[1] === 'ping') {
    updateSnaps();

  } else if(content[1] === 'debug') {
    dbfuncs.listDiscokids();
  }

});

bot.login(auth.token);

async function updateSnaps() {
  try {
    let snapsCurrent = await pingPoringWorld();
    let gon = dbfuncs.clearExpiredSnaps();
    logger.info(`cleared ${gon} expired snaps from database`);
    let snapsNew = dbfuncs.addSnaps(snapsCurrent);

    // find all matching requirements in database
    // for(let s of snapsNew) {
      // s.name = s.name.replace(/\s+/g, ''); // remove whitespace from name
      // s.enchant = s.enchant.replace(/[\s-]+/g, ''); // remove whitespace from enchant
      // s.reqs = dbfuncs.findRequirements(s);
    // }

    // construct message and send
    for(let sr of snapsNew) {
      let itemmsg = `\`\`\`${parsefuncs.buildItemFullName(sr)}\nprice: ${sr.price.toLocaleString()}\nstock: ${sr.stock}\nbuyers: ${sr.buyers}\nsnapend: ${Math.floor((new Date(sr.snapend*1000) - new Date())/60000)} minutes\`\`\``;
      sr.name = sr.name.replace(/\s+/g, ''); // remove whitespace from name
      sr.enchant = sr.enchant.replace(/[\s-]+/g, ''); // remove whitespace from enchant
      //sr.reqs = dbfuncs.findRequirements(sr);

      let channels = {}; // map with key: channelid and value: discordid pings
      //for(let req of sr.reqs) {
      for(let req of dbfuncs.findRequirements(sr)) {
        if(channels[req.discordchid] === undefined)
          channels[req.discordchid] = `<@${req.discordid}>`;
        else
          channels[req.discordchid] +=`<@${req.discordid}>`;
      }

      // send bot message to each channel
      for(let [chid, pings] of Object.entries(channels)) {
        bot.channels.fetch(chid).then((chan) => {
          chan.send(itemmsg+pings);
        });
      }
    }

  } catch(e) {
    logger.error('update failed: ' + e);
    console.error("ERROR: " + e);
  }
}

/**
 * pings poring.world for all snapping information
 * irrelevant snaps are discarded
 * @returns the array of currently active snaps
 */
function pingPoringWorld() {
  return new Promise(function(resolve, reject) {
    https.get('https://poring.world/api/search?order=popularity&inStock=1', (resp) => {
      let data = '';

      // A chunk of data has been recieved.
      resp.on('data', (chunk) => {
        data += chunk;
      });
      resp.on('end', () => {
        data = JSON.parse(data);
        // remove expired snaps
        data = data.filter(snap => snap.lastRecord.snapEnd > new Date()/1000);

        resolve(data);
      });

    }).on("error", (err) => {
      console.log("Error: " + err.message);
      reject(err.message);
    });
  });
}
