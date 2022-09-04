const { PermissionsBitField } = require('discord.js');

const config = {};

// whether or not to drop database when app starts up
config.dropdbonstart = false;

// if this is true, then for every odd minute, the bot will go call
//   the relevant query string in lists.schedule
// otherwise do nothing
config.schedulesearch = true;

/**
 * Strings that will summon the bot so it'll listen to your commands
 * default is pinging the bot @PoringWorldBot (added in bot.js in on-ready function)
 * for example in "@PoringWorldBot help", "@PoringWorldBot " is the default summon string
 * you could put "!" in the array below so that "!help" would be accepted too
 * (be mindful that all long sequences of whitespace will have been replaced by a single space " ")
 * first string that matches will be used 
 */ 
config.summonstrings = ["!pwb "];

// the limited amount of reqs that a peasant can make
// config.peasantlimit = 12;
// the limited amount of reqs that nonpeasants can make
// this is because of the character limit for the "showme" command
// honestly if you have so much reqs, you should just set up another channel
config.limitreqs = 18;

// permissions required for using admin commands like: budgetfor, deleteallfor, snaprequestfor, unwatch, watch
config.advancedcmdperm = [PermissionsBitField.Administrator, PermissionsBitField.ManageChannels,
                         PermissionsBitField.ManageGuild, PermissionsBitField.ManageRoles,
                         PermissionsBitField.ManageMessages];

// discord id of the bot owner
// make sure to change this to your discord id if you're hosting this bot yourself
config.owner = "161248916384251904";
// base permission level that owner gets
config.ownerperm = 6969;
// base permission level that someone who added the bot will get
config.startperm = 9;

// blacklist :(
config.blacklistedguild = ["265757905435885568"];
config.blacklisteduser = ["264104948072054785"];

// the application id of the bot
config.clientId = "597932863597576204";
// the id of the guild for testing guild commands
config.guildId = "171259045557043202";

module.exports = config;