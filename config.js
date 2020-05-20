
const config = {};

// whether or not to drop database when app starts up
config.dropdbonstart = true;

/**
 * Strings that will summon the bot so it'll listen to your commands
 * default is pinging the bot @PoringWorldBot (added in bot.js in on-ready function)
 * for example in "@PoringWorldBot help", "@PoringWorldBot " is the default summon string
 * you could put "!" in the array below so that "!help" would be accepted too
 * (be mindful that all long sequences of whitespace will have been replaced by a single space " ")
 * first string that matches will be used 
 */ 
config.summonstrings = [];

// the limited amount of reqs that a peasant can make
config.limitreqs = 6;

// discord id of the owner
// make sure to change this to your discord id if you wanna do anything with the bot
config.owner = "161248916384251904";
// base permission level that owner gets
config.ownerperm = 6969;

module.exports = config;