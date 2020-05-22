//var Discord = require('discord.io');
const Discord = require('discord.js');
const bot = new Discord.Client();
var auth = require('./auth.json');
var parsefuncs = require('./parse.js');
var config = require('./config.js');
var commands = require('./commands.js');
var CronJob = require('cron').CronJob;
var dbfuncs = require("./dbfuncs.js");

bot.on('ready', () => {
  console.log(`Logged in with id ${bot.user.id} as ${bot.user.tag}!`);
  config.summonstrings.push(`<@${bot.user.id}> `);
  config.summonstrings.push(`<@!${bot.user.id}> `);

  // pretend owner has is in each guild
  for(let [guildid, guild] of bot.guilds.cache) {
    if(config.dropdbonstart) // if db was dropped, re-add owner to each guild this bot is in
      dbfuncs.addDiscokid(config.owner, guildid, config.ownerperm);
    else { // check if owner is properly lurking in the guild
      let res = dbfuncs.getDiscokid(config.owner, guildid);
      if(res === undefined) {
        if(dbfuncs.addDiscokid(config.owner, guildid, config.ownerperm) === -1)
          console.log("ERROR: FAILED TO ADD OWNER");
      } else if(res.permission !== config.ownerperm && !dbfuncs.updateDiscokid(config.owner, config.ownerperm)) {
        console.log("ERROR: FAILED TO UPDATE OWNER PERMS");
      }
    }
  }

  new CronJob('0 0,10,20,30,40,50 * * * *', function() {
    commands.handleSearch(bot);
  }, null, true);
});

// on joining the guild, give basic permission to inviter. add owner in as well lol
bot.on('guildCreate', (guild) => {
  console.log('event guildCreate: '+guild.id);
  dbfuncs.addDiscokid(config.owner, guild.id, config.ownerperm);
  message.guild.fetchAuditLogs({ limit:1, type:28 }) // type 28 is "add bot"
    .then(audit => {
      let userID = audit.entries.first().executor.id;
      if(userID !== config.owner)
        dbfuncs.addDiscokid(userID, guild.id, 1);
    })
    .catch(console.error);
});

// when kicked from guild or guild is deleted
bot.on('guildDelete', (guild) => {
  console.log('event guildDelete: '+guild.id);
  dbfuncs.deleteGuild(guild.id);
  dbfuncs.deleteMultipleChannels(message.guild.channels.cache.map(x => x.id));
});

// when channel is deleted
bot.on('channelDelete', (channel) => {
  if(dbfuncs.deleteChannel(channel.id))
    console.log('event channelDelete: '+channel.id);
});

// when member leaves, remove any requests he has in the channel in this guild
bot.on('guildMemberRemove', (member) => {
  if(dbfuncs.deleteMember(member.id, member.guild.id))
    console.log('event guildMemberRemove: '+member.id+' in '+member.guild.id);
});

// when role is deleted, remove any requests assigned to the role
bot.on('roleDelete', (role) => {
  if(dbfuncs.deleteMember(role.id, role.guild.id))
    console.log('event roleDelete: '+role.id+' in '+role.guild.id);
});

bot.on('message', message => {
  message.content = message.content.toLowerCase().replace(/\s+/g, ' ');

  if(message.channel.type !== 'text') return; // if not from text channel, ignore
  if(message.author.id === bot.user.id) return; // if from self, ignore
  if(message.author.bot) return; // if from bot, ignore

  // attach contentObj to message
  // contentObj is just message.content parsed into three properties: summon, command, body
  message.contentObj = parsefuncs.parseContent(message.content);
  if(message.contentObj.summon === undefined) return; // not summoned with summonstring
  if(message.contentObj.command === '') return; // no command provided

  const cmd = message.contentObj.command; // save letters xd

  // retrieve user info of this guild if he exists in database
  // attach userObj to message
  // userObj 
  message.userObj = dbfuncs.getDiscokid(message.author.id, message.guild.id);
  if(message.userObj === undefined)
    message.userObj = { permission: 0, discordid: message.author.id };

  console.log(`user ${message.author.id} to channel ${message.channel.id}: ${message.contentObj.command} => ${message.contentObj.body}`);

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

  } else if (cmd === 'pc' || // quick price check for clean/unmodified equip
             cmd === 'pricecheck') {
    return commands.handlePriceCheck(message);
  }

  // no peasants allowed past here
  if(message.userObj.permission === 0) return message.react('🔒');
  // COMMANDS THAT REQUIRES HIGHER PERMISSION LEVEL

  if(cmd === 'showhere') {
    // TODO: showhere for channel
    // NOT IMPLEMENTED

  } else if(cmd === 'unwatch') { // remove this channel from channels table
    return commands.handleUnwatch(message);

  } else if(cmd === 'force' ||
            cmd === 'search' ||
            cmd === 'query') {
    return commands.handleSearch(bot, message.contentObj.body);

  } else if(cmd === 'permit' ||
            cmd === 'nwordpass') {
    return commands.handlePermit(message);
  }

  if(message.author.id !== config.owner) return message.react('🔒');
  // FOLLOWING COMMANDS ARE RESTRICTED TO OWNER OVERLORD

  if(cmd === 'clearsnaps') {
    let num = dbfuncs.deleteAllCurrentSnaps();
    console.log(num + ' snap records deleted');
    return message.channel.send(num + ' snap records deleted');

  } else if(cmd === 'debug') {
    return console.log(dbfuncs.listDiscokids()); // this is a debug function zzz

  } else if(cmd === 'showall') {
    let res = dbfuncs.listAllRequirements();
    return console.log(res);
  }

});

bot.login(auth.token);