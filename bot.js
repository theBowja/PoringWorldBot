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

  new CronJob('0 0,10,20,30,40,50 * * * *', function() {
    updateSnaps();
  }, null, true);
});

bot.on('message', message => {
  let userID = message.author.id;
  let channelID = message.channel.id;
  let content = message.content.trim().split(/\s+/);

  // checking if bot should read this message or not
  if(content[0] !== `<@!${bot.user.id}>`) return; // if not mention bot, ignore
  if(userID === bot.user.id) return; // if from self, ignore
  if(message.author.bot === true) return; // if from bot, ignore
  if(content.length === 1) return; // if nothing else, ignore

  // retrieve user info if he exists in database
  let userObj = dbfuncs.getDiscokid(userID);
  if(userObj === undefined) userObj = { permission: 0 };

  logger.info(`user ${userID} to channel ${channelID}: ${content.slice(1).join(' ')}`);
  content[1] = content[1].toLowerCase();

  // COMMANDS THAT DONT REQUIRE CHANNEL WATCH
  if(content[1] === 'watch' ||  // allow commands to be read on this channel
     content[1] === 'listenhereyoulittleshi') {
    if(userObj.permission === 0) return message.react('❎'); // no peasants allowed
    let limitedto = parseInt(content[2]);
    if(isNaN(limitedto)) limitedto = 0;
    if(userObj.permission < limitedto) return message.react('❎'); // user asks for too much
    let res = dbfuncs.addChannel(channelID, limitedto);
    return message.react(res !== -1 ? '✅' : '❎');
  }

  // retrieve channel info if exists in database
  let channelObj = dbfuncs.getChannel(channelID);
  if(channelObj === undefined) return; // channel isn't on watch
  // COMMANDS THAT REQUIRE CHANNEL WATCH

  // COMMANDS WITH NO PERMISSION LEVEL REQUIRED
  if(content[1] === 'help') {
    message.channel.send('https://github.com/theBowja/PoringWorldBot/blob/master/WIKI');

  } else if(content[1] === 'pingmewhen' ||
            content[1] === 'tagmewhen' ||
            content[1] === 'tellmewhen') {
    // restricts user if they have higher or equal permission level to channel permission requirements
    if(userObj.permission < channelObj.limitedto) return message.react('🔒');
    if(content.length <= 2) return message.react('❎'); // no reqs found

    let pars = parsefuncs.parseReqs(content.slice(2).join(' '));
    if(pars.message === '') return message.react('❎'); // no coherent parameters given by user

    // if user doesn't exist in database, then add him
    if(userObj.dkidID === undefined)
      userObj.dkidID = dbfuncs.addDiscokid(userID);
    else if(userObj.permission === 0 && dbfuncs.listUserRequirements(userID) >= config.limitreqs)
      return message.react('❎'); // user has reached the limit for reqs to make

    pars.discordkidID = userObj.dkidID;
    pars.channelID = channelObj.chID;

    let res = dbfuncs.addRequirement(pars);
    return message.react(res ? '✅' : '❎');

  } else if(content[1] === 'show' ||
            content[1] === 'showme') {
    let targetID = userID;
    if(content[2] !== undefined) {
      targetID = parsefuncs.parseDiscordID(content[2]);
      if(targetID === -1) return message.react('❎'); // not valid id provided
      if(userObj.permission === 0)
        return message.react('🔒'); // no peasants allowed past here
      let targetObj = dbfuncs.getDiscokid(targetID);
      if(targetObj !== undefined && userObj.permission < targetObj.permission)
        return message.react('🔒'); // user's permission level isn't high enough
    }
    let res = dbfuncs.listUserRequirements(targetID);
    let msg = res.map((r) => { return `id: ${r.reqID} | ${r.message}`; }).join('\n');
    return message.channel.send(msg === '' ? '0 reqs' : '```'+msg+'```');

  } else if(content[1] === 'delete' ||
            content[1] === 'remove') {
    let reqID = parseInt(content[2]);
    if(isNaN(reqID)) { // if no reqID provided, then show 
      let res = dbfuncs.listUserRequirements(userID);
      let msg = res.map((r) => { return `id: ${r.reqID} | ${r.message}`; }).join('\n');
      return message.channel.send(msg === '' ? '0 reqs' : '```'+msg+'```');
    } else {
      let reqObj = dbfuncs.getRequirement(reqID);
      if(reqObj === undefined) return message.react('❎'); // not valid reqID
      if(userObj.permission === 0 && userObj.discordid !== reqObj.discordid)
        return message.react('🔒'); // peasants not allowed to delete someone else's
      if(userObj.permission < reqObj.permission)
        return message.react('🔒'); // permission level is lower than target's permission level
      let res = dbfuncs.deleteRequirement(reqID);
      return message.react(res ? '✅' : '❎');
    }

  } else if(content[1] === 'thanks' ||
            content[1] === 'thank' && content[2] === 'you') {
    return message.channel.send('no problem');
  }    // quick price check for clean/unmodified equip
    else if (content[1] === 'pc' || content[1] === 'pricecheck') {
      let message
      let jsonMessage = pcPoringWorld(content[2])
      message += 'Item name : ' jsonMessage[0].name + '\n';
      message += 'Price : ' jsonMessage[0].price + '\n';
      message += 'Stock : 'jsonMessage[0].stock;
      return message.channel.send('```' + msg + '```');
          }

  // no peasants allowed past here
  if(userObj.permission === 0) return;

  // COMMANDS THAT REQUIRES HIGHER PERMISSION LEVEL
  if(content[1] === 'showhere') {
    // TODO: showhere for channel. only admins can run this
    // NOT IMPLEMENTED

  } else if(content[1] === 'unwatch') { // remove this channel from channels table
    let res = dbfuncs.deleteChannel(channelID);
    return message.react(res ? '✅' : '❎');

  } else if(content[1] === 'showall') {
    // TODO: limit this to owner
    let res = dbfuncs.listAllRequirements();
    console.log(res);
    return;

  } else if(content[1] === 'clearsnaps') {
    return dbfuncs.deleteAllSnaps();

  } else if(content[1] === 'ping') {
    return updateSnaps();

  } else if(content[1] === 'debug') {
    return dbfuncs.listDiscokids(); // this is a debug function zzz
  
  } else if(content[1] === 'permit' ||
            content[1] === 'nwordpass') {
    if(content.length < 4) return message.react('❎'); // not enough parameters provided
    let targetID = parsefuncs.parseDiscordID(content[2]);
    if(targetID === -1) return message.react('❎'); // no valid discord id provided
    // TODO check if this targetID exists in server
    let perm = parseInt(content[3]);
    if(isNaN(perm)) return message.react('❎'); // no number provided
    if(userObj.permission < perm) return message.react('❎'); // cannot assign higher than your own
    let targetObj = dbfuncs.getDiscokid(targetID);
    let res;
    if(targetObj === undefined)
      res = dbfuncs.addDiscokid(targetID, perm) !== -1;
    else if(targetObj.permission <= userObj.permission)
      res = dbfuncs.updateDiscokid(targetID, perm);
    else
      return message.react('🔒'); // the target's permission level is higher than yours
    return message.react(res ? '✅' : '❎');
  }

});

bot.login(auth.token);

async function updateSnaps() {
  try {
    let snapsCurrent = await pingPoringWorld();
    let gon = dbfuncs.clearExpiredSnaps();
    logger.info(`${new Date().toLocaleString()} cleared ${gon} expired snaps from database`);
    let snapsNew = dbfuncs.addSnaps(snapsCurrent);
    logger.info(`${new Date().toLocaleString()} added ${snapsNew.length} new snaps to database`);


    // construct message and send
    for(let sr of snapsNew) {
      let itemmsg = `\`\`\`${parsefuncs.buildItemFullName(sr)}\nprice: ${sr.price.toLocaleString()}\nstock: ${sr.stock}\nbuyers: ${sr.buyers}\nsnapend: ${Math.floor((new Date(sr.snapend*1000) - new Date())/60000)} minutes\`\`\``;
      sr.name = sr.name.replace(/\s+/g, ''); // remove whitespace from name
      sr.enchant = sr.enchant.replace(/[\s-]+/g, ''); // remove whitespace from enchant
      sr.slotted = sr.slots - (sr.category === 'Equipment - Weapon'); // calculated slotted bool

      let channels = {}; // map with key: channelid and value: discordid pings
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

// quick price check for clean/unmodified equip
function pcPoringWorld(itemName) {
    return new Promise(function (resolve, reject) {
        https.get('https://poring.world/api/search?order=popularity&rarity=&inStock=&modified=0&category=&endCategory=&q=' + itemName, (resp) => {
            let data = '';

            // A chunk of data has been recieved.
            resp.on('data', (chunk) => {
                data += chunk;
            });
            resp.on('end', () => {
                data = JSON.parse(data);

                resolve(data);
            });

        }).on("error", (err) => {
            console.log("Error: " + err.message);
            reject(err.message);
        });
    });
};
