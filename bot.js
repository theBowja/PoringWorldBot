//var Discord = require('discord.io');
const Discord = require('discord.js');
const bot = new Discord.Client();
var logger = require('winston');
var auth = require('./auth.json');
var parsefuncs = require('./parse.js');
var config = require('./config.js');
var commands = require('./commands.js');
var https = require('https');
var CronJob = require('cron').CronJob;

var dbfuncs = require("./dbfuncs.js");

// Configure logger settings
logger.remove(logger.transports.Console);
logger.add(new logger.transports.Console, {
    colorize: true
});
logger.level = 'debug';

bot.on('ready', () => {
  console.log(`Logged in with id ${bot.user.id} as ${bot.user.tag}!`);
  config.summonstrings.push(`<@${bot.user.id}> `);
  config.summonstrings.push(`<@!${bot.user.id}> `);

  new CronJob('0 0,10,20,30,40,50 * * * *', function() {
    updateSnaps();
  }, null, true);
});

bot.on('message', message => {
  message.content = message.content.toLowerCase().replace(/\s+/g, ' ');

  if(message.author.id === bot.user.id) return; // if from self, ignore
  if(message.author.bot) return; // if from bot, ignore

  // attach contentObj to message
  message.contentObj = parsefuncs.parseContent(message.content);
  if(message.contentObj.summon === undefined) return; // not summoned with summonstring
  if(message.contentObj.command === '') return; // no command provided

  const cmd = message.contentObj.command; // type less words

  // retrieve user info if he exists in database
  // attach userObj to message
  message.userObj = dbfuncs.getDiscokid(message.author.id);
  if(message.userObj === undefined)
    message.userObj = { permission: 0, discordid: message.author.id };

  logger.info(`user ${message.author.id} to channel ${message.channel.id}: ${message.contentObj.command} => ${message.contentObj.body}`);

  // COMMANDS THAT DONT REQUIRE CHANNEL WATCH
  if(cmd === 'watch' ||  // allow commands to be read on this channel
     cmd === 'listenhereyoulittleshi') {
    return commands.handleWatch(message);
  }

  // retrieve channel info if exists in database
  // attach channelObj to message
  message.channelObj = dbfuncs.getChannel(message.channel.id);
  if(message.channelObj === undefined) return; // channel isn't on watch
  // COMMANDS THAT REQUIRE CHANNEL WATCH

  // COMMANDS WITH NO PERMISSION LEVEL REQUIRED
  if(cmd === 'help') {
    return commands.handleHelp(message);

  } else if(cmd === 'pingmewhen' ||
            cmd === 'tagmewhen' ||
            cmd === 'tellmewhen') {
    return commands.handleTagMe(message);

  } else if(cmd === 'show' ||
            cmd === 'showme') {
    return commands.handleShowUser(message);

  } else if(cmd === 'delete' ||
            cmd === 'remove') {
    return commands.handleDelete(message);

  } else if(cmd === 'thanks' ||
            cmd === 'thank') {
    return commands.handleThanks(message);

  }    // quick price check for clean/unmodified equip
    else if (cmd === 'pc' || cmd === 'pricecheck') {
      handlepricecheck(message, message.content.body);
  }

  // no peasants allowed past here
  if(message.userObj.permission === 0) return message.react('🔒');

  // COMMANDS THAT REQUIRES HIGHER PERMISSION LEVEL
  if(cmd === 'showhere') {
    // TODO: showhere for channel. only admins can run this
    // NOT IMPLEMENTED

  } else if(cmd === 'unwatch') { // remove this channel from channels table
    return commands.handleUnwatch(message);

  } else if(cmd === 'showall') {
    // TODO: limit this to owner
    let res = dbfuncs.listAllRequirements();
    console.log(res);
    return;

  } else if(cmd === 'clearsnaps') {
    return dbfuncs.deleteAllSnaps();

  } else if(cmd === 'ping') {
    return updateSnaps();

  } else if(cmd === 'debug') {
    return dbfuncs.listDiscokids(); // this is a debug function zzz
  
  } else if(cmd === 'permit' ||
            cmd === 'nwordpass') {
    return commands.handlePermit(message);
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
      let itemmsg = `\`\`\`${parsefuncs.buildItemFullName(sr)}\nprice: ${sr.price.toLocaleString()}\nstock: ${sr.stock}\nsnapend: ${Math.floor((new Date(sr.snapend*1000) - new Date())/60000)} minutes\`\`\``;
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

async function handlepricecheck(message, itemName) {
  try {
    console.log("handlepricecheck");
    let words = '';
    let jsonMessage = await pcPoringWorld(itemName);

    words += 'Item name : ' + jsonMessage[0].name + '\n';
    words += 'Price : ' + jsonMessage[0].lastRecord.price + '\n';
    words += 'Stock : ' + jsonMessage[0].lastRecord.stock;
    return message.channel.send('```' + words + '```');

  } catch(e) {
    logger.error('pricecheck failed: ' + e);
    console.error("ERROR: " + e);
  }
}

// quick price check for clean/unmodified equip
function pcPoringWorld(itemName) {
    return new Promise(function (resolve, reject) {
        https.get('https://poring.world/api/search?order=price&rarity=&inStock=&modified=0&category=&endCategory=&q=' + itemName, (resp) => {
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
