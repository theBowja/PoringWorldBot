//var Discord = require('discord.io');
const Discord = require('discord.js');
const bot = new Discord.client();
var logger = require('winston');
var auth = require('./auth.json');
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
// Initialize Discord Bot
// var bot = new Discord.Client({
//   token: auth.token,
//   autorun: true
// });

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

// bot.on('ready', function (evt) {
//   logger.info('Connected');
//   logger.info('Logged in as: ');
//   logger.info(bot.username + ' - (' + bot.id + ')');
//   new CronJob('* 0,20,40 * * * *', function() {    })
//   // new CronJob('* * * * *', function() {
//   //     console.log(new Date());
//   // }, null, true)
//   // TODO: load list of watching channels into a global variable or cache
// });
bot.on('message', function (user, userID, channelID, message, evt) {
  console.log("channel: " + channelID);
  console.log("userid: " + userID);
  console.log(evt);

  // TOOD: check if right channel here using cache
  if(userID === "597932863597576204") return; // if self, return
  logger.info("bot id: " + bot.id);
  if (!message.startsWith("<@597932863597576204> ")) return;
  message = message.substring(message.indexOf(' ')+1).trim();
  if(message === '') return; // TODO 

  logger.info(message);

  if(message === 'test') {
    var snap = {
      snapid: 111,
      name: "tights",
      slots: 1,
      refine: 1,
      broken: 1,
      price: 53333,
      buyers: 3,
      enchant: "Morale",
      enchantlevel: 1,
      category: "Armor",
      snapend: 1341341341,
      stock: 3
    };
    try{
      dbfuncs.findRequirements(snap).then(function(freqs) {
        bot.sendMessage({
          to: channelID,
          message: "test returned"
        });
      });
    } catch (e) {
      logger.error(e);
    }
  } else if(message === 'debug') {
    dbfuncs.listListeners();
  }
  else if(message === 'watch') {
    var requirement = {
      discordid: userID,
      channelid: channelID
    };
    dbfuncs.addRequirement(requirement);
  }
  else if(message === 'ping') {
    updateSnaps();
  }
});

async function updateSnaps() {
  try {
    var snapsCurrent = await pingPoringWorld();
    await dbfuncs.clearExpiredSnaps();
    var snapsNew = await dbfuncs.addSnaps(snapsCurrent);

    var promises = snapsNew.map(function(snap) {
      return dbfuncs.findRequirements(snap).then(function(foundreqs) {
        snap.reqs = foundreqs;
        return snap;
      });
    });
    var snapreqs = await Promise.allSettled(promises);

    for(let sr of snapreqs) {
      // TODO check if promise status fulfilled.
      sr = sr.value;
      var itemmsg = "```";
      itemmsg += getItemFullName(sr) + '\n';
      itemmsg += "price: " + sr.price.toLocaleString() + '\n';
      itemmsg += "stock: " + sr.stock + '\n';
      itemmsg += "buyers: " + sr.buyers + '\n';
      itemmsg += "snapend: " + sr.snapend;
      itemmsg += "```";

      // sort all messages types by channel
      var channels = [];
      // channels is an array of objects that contains
      //   channelid (string), discordids (string), messages (\n delimited string)
      for(let req of sr.reqs) {
        var chobj = channels.find(x => x.channelid === req.channelid);
        if(chobj === undefined) {
          chobj = {
            channelid: req.channelid,
            discordids: "",
            messages: ""
          };
          channels.push(chobj);
        }
        // console.log(req.message);
        // console.log(typeof req.message);
        if(req.message === null || req.message === "")
          chobj.discordids += " <@" + req.discordid + ">";
        else {
          console.log("MESSAGES SHOULD NOT BE HAPPENING")
          chobj.messages += '\n' + req.message;
        }
      }

      // send bot message to each channel
      for(let chan of channels) {
        bot.sendMessage({
          to: chan.channelid,
          message: itemmsg + chan.discordids + chan.messages
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
 * @returns the array of unexpired snaps
 */
var pingPoringWorld = function() {
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
};

/**
 * builds the full name of an item with refine level, item name, slots, enchant, broken
 * example: "+13 Sniping Suit [1] <Arch 1> (broken)"
 */
var getItemFullName = function(item) {
  var fullname = "";
  if(item.refine!==0) fullname += ("+"+item.refine+" ");
  fullname += item.name;
  if(item.slots!==0) fullname += (" ["+item.slots+"]");
  if(item.enchant!=="none") fullname += (" <"+item.enchant+" "+item.enchantlevel+">");
  if(item.broken!==0) fullname += " (broken)";
  return fullname;
};

// TODO: allow user to change message
