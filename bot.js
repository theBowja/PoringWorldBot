//var Discord = require('discord.io');
const Discord = require('discord.js');
const bot = new Discord.Client();
var auth = require('./auth.json');
var parsefuncs = require('./parse.js');
var config = require('./config.js');
var commands = require('./commands.js');
var CronJob = require('cron').CronJob;
var dbfuncs = require("./dbfuncs.js");
var lists = require('./lists.js');

bot.on('ready', () => {
  console.log(`Logged in with id ${bot.user.id} as ${bot.user.tag}!`);
  config.summonstrings.push(`<@${bot.user.id}> `);
  config.summonstrings.push(`<@!${bot.user.id}> `);
  if(config.devonly) {
    config.summonstrings = ['!dev '];
    console.log("devonly: !dev  is the only command that can summon this bot instance");
  }

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

    // TODO: make sure each guild has an admin
  }

  // ping poring.world every 6 minutes
  new CronJob('0 0-59/6 * * * *', function() {
    commands.handleSearch(undefined, undefined, bot);
  }, null, true);

  // makes additional pings every odd minute
  new CronJob('0 1-59/2 * * * *', function() {
    let qs = lists.schedule[new Date().getMinutes()];
    if(config.schedulesearch && qs !== undefined){
      commands.handleSearch(undefined, undefined, bot, qs);
    }
  }, null, true);

  // makes backup at 06:06:06 AM
  new CronJob('6 6 6 * * *', function() {
    dbfuncs.backup(['sun','mon','tue','wed','thu','fri','sat'][new Date().getDay()]);
  }, null, true);
});

// on joining the guild, give basic permission to inviter. add owner in as well lol
bot.on('guildCreate', (guild) => {
  console.log('event guildCreate: '+guild.id);
  dbfuncs.addDiscokid(config.owner, guild.id, config.ownerperm);
  guild.fetchAuditLogs({ limit: 1, type: 28 }) // type 28 is "add bot"
    .then(audit => {
      let userID = audit.entries.first().executor.id;
      if(userID !== config.owner)
        dbfuncs.addDiscokid(userID, guild.id, config.startperm);
    })
    .catch(console.error);
});

// when kicked from guild or guild is deleted
bot.on('guildDelete', (guild) => {
  console.log('event guildDelete: '+guild.id);
  let changes = dbfuncs.deleteGuild(guild.id);
  console.log('removed '+changes.discokids+' discokids from database');
  console.log('removed '+changes.channels+' channels from database');
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
  if(dbfuncs.deleteMember('&'+role.id, role.guild.id))
    console.log('event roleDelete: '+role.id+' in '+role.guild.id);
});

bot.on('message', message => {
  let pwbContent, pwbUser, pwbChannel = {}; // https://github.com/theBowja/PoringWorldBot/wiki/Developer-documentation
  function callCommandHandler(handler) { // so i don't have to type out the parameters every time
    return handler(message, { pwbContent: pwbContent, pwbUser: pwbUser, pwbChannel: pwbChannel });
  };

  if(message.channel.type !== 'text') return; // if not from text channel, ignore
  if(message.author.id === bot.user.id) return; // if from self, ignore
  if(message.author.bot) return; // if from bot, ignore
  if(config.blacklistedguild.includes(message.guild.id)) return; // if from blacklisted guild
  if(config.blacklisteduser.includes(message.author.id)) return; // if from blacklisted user

  // attach contentObj to message
  // contentObj is just message.content parsed into three properties: summon, command, body
  pwbContent = parsefuncs.parseContent(message.content.toLowerCase().replace(/\s+/g, ' '));
  if(pwbContent.summon === undefined) return; // not summoned with summonstring
  if(pwbContent.command === '') return; // no command provided

  // retrieve user info of this guild if he exists in database
  // attach userObj to message
  // userObj 
  pwbUser = dbfuncs.getDiscokid(message.author.id, message.guild.id);
  if(pwbUser === undefined)
    pwbUser = { permission: 0, discordid: message.author.id };
  if(pwbUser.permission < 0) return; // this member is banned from using this bot in this guild

  console.log(`From ${message.author.tag} ${message.author.id} to #${message.channel.name} ${message.channel.id} in ${message.guild.name} ${message.guild.id}`);
  console.log(`  ${pwbContent.command} :: ${pwbContent.body}`);

  // COMMANDS THAT DONT REQUIRE CHANNEL WATCH
  switch(pwbContent.command) {
    case 'help':
      return callCommandHandler(commands.handleHelp);

    case 'watch': // allow commands to be read on this channel
    case 'listen':
      return callCommandHandler(commands.handleWatch);

    case 'alive':
    case 'awake':
    case 'up':
      return message.react('🙂');
  }

  // retrieve channel info if exists in database
  // attach channelObj to message
  pwbChannel = dbfuncs.getChannel(message.channel.id);
  if(pwbChannel === undefined) return; // channel isn't on watch
  // COMMANDS THAT REQUIRE CHANNEL WATCH

  // COMMANDS WITH NO PERMISSION LEVEL REQUIRED
  switch(pwbContent.command) {
    case 'invite':
    case 'invitelink':
      return message.channel.send('```https://discordapp.com/oauth2/authorize?client_id='+bot.user.id+'&scope=bot&permissions=150720```');

    case 'request':
    case 'req':
    case 'subscribe':
    case 'pingwhen':
    case 'pingmewhen':
    case 'pingme':
    case 'tagwhen':
    case 'tagmewhen':
    case 'tagme':
      return callCommandHandler(commands.handleTagMe);

    case 'show':
    case 'list':
    case 'showme':
      return callCommandHandler(commands.handleShowUser);

    case 'delete':
    case 'del':
    case 'remove':
      return callCommandHandler(commands.handleDelete);

    case 'budget':
      return callCommandHandler(commands.handleBudget);

    case 'thanks':
    case 'thank':
    case 'ty':
      return callCommandHandler(commands.handleThanks);

    case 'pc': // quick price check for clean/unmodified equip
    case 'pricecheck':
      return callCommandHandler(commands.handlePriceCheck); 
  } 

  // no peasants allowed past here
  if(pwbUser.permission === 0) return message.react('🔒');
  // COMMANDS THAT REQUIRES HIGHER PERMISSION LEVEL

  switch(pwbContent.command) {
    case 'showhere':
      // TODO: showhere for channel
      // NOT IMPLEMENTED due to worries over message being too long and spammy
      return;

    case 'unwatch':
      return callCommandHandler(commands.handleUnwatch); // remove this channel from channels table

    case 'force':
    case 'search':
    case 'query':
      return callCommandHandler(commands.handleSearch);

    case 'permit':
    case 'admin':
      return callCommandHandler(commands.handlePermit);
  }

  if(message.author.id !== config.owner) return;// message.react('🔒');
  // FOLLOWING COMMANDS ARE RESTRICTED TO OWNER OVERLORD

  switch(pwbContent.command) {
    case 'clearsnaps':
      let num = dbfuncs.deleteAllCurrentSnaps();
      console.log(num + ' snap records deleted');
      return message.channel.send(num + ' snap records deleted');

    case 'debug':
      return console.log(dbfuncs.listDiscokids()); // this is a debug function zzz

    case 'logallchannels':
      return console.log(dbfuncs.getAllChannels());

    case 'showall':
      return console.log(dbfuncs.listAllRequirements());

    case 'showcurrent':
      return console.log(dbfuncs.getSnaps());
    
    case 'listguildsjoined':
      let tmp = bot.guilds.cache.map(g => g.id+': '+g.name).join('\n');
      return message.channel.send('```'+tmp+'```', { split: true });

    case 'announce':
      let chans = dbfuncs.getAllChannels();
      for(let ch of chans) {
          bot.channels.fetch(ch.discordchid).then((chan) => {
              chan.send(pwbContent.body);
          });
      }
      return message.react('✅');

    case 'patch':
      //let patchdb = require('./patchdb.js');
      //return patchdb.doPatches();
      return;

    case 'backup':
      if(pwbContent.body === '') return message.react('❎');
      return dbfuncs.backup(pwbContent.body);
  }
});

// not sure if this is an actual event but whatever
bot.on("disconnect", function(event){
    console.log(`${new Date().toLocaleString()}: The WebSocket has closed and will no longer attempt to reconnect`);
});

bot.login(auth.token);
