var parsefuncs = require('./parse.js');
const config = require('./config.js'); // consistency right?
var dbfuncs = require("./dbfuncs.js");


const commands = {};

// i suppose i should say something here
// lol

commands.handleHelp = function(message) {
    message.channel.send('https://github.com/theBowja/PoringWorldBot/wiki/Parameters-for-adding-a-request');
};

commands.handleTagMe = function(message) {
    // restricts user if they have higher or equal permission level to channel permission requirements
    if(message.userObj.permission < message.channelObj.limitedto)
        return message.react('🔒'); 
    if(message.contentObj.body.length === 0)
        return message.react('❎'); // no reqs found

    let pars = parsefuncs.parseReqs(message.contentObj.body);
    if(pars.message === '')
        return message.react('❎'); // no coherent parameters given by user

    let targetObj = message.userObj;
    if(pars.assign !== undefined) {
        targetObj = dbfuncs.getDiscokid(pars.assign, message.guild.id);
        if(targetObj === undefined)
            targetObj = { permission: 0, discordid: pars.assign, guildid: message.guild.id };
        delete pars.assign;
        if(userObj.permission <= targetObj.permission)
            return message.react('🔒'); // user isn't good enough to assign on the other person
    }

    // if user doesn't exist in database, then add him
    if(targetObj.dkidID === undefined)
        targetObj.dkidID = dbfuncs.addDiscokid(targetObj.discordid, targetObj.guildid);
    else if(targetObj.permission === 0 &&
            dbfuncs.listUserRequirements(targetObj.discordid, targetObj.guildid, message.channel.id).length >= config.limitreqs)
        return message.react('❎'); // user has reached the limit for reqs to make

    pars.discordkidID = targetObj.dkidID;
    pars.channelID = message.channelObj.chID;

    let res = dbfuncs.addRequirement(pars);
    return message.react(res ? '✅' : '❎');
};

commands.handleWatch = function(message) {
    if(message.userObj.permission === 0) // no peasants allowed
        return message.react('🔒');

    let limitedto = parseInt(message.contentObj.body); // parse body for extra parameter
    if(isNaN(limitedto)) limitedto = 0;

    if(message.userObj.permission < limitedto) // user doesn't have enough permission
        return message.react('🔒');
    let res = dbfuncs.addChannel(message.channel.id, limitedto);
    return message.react(res !== -1 ? '✅' : '❎');
};

commands.handleUnwatch = function(message) {
    let res = dbfuncs.deleteChannel(message.channel.id);
    return message.react(res ? '✅' : '❎');
};

commands.handleShowUser = function(message) {
    let targetID = message.author.id;
    if(message.contentObj.body !== '') { // if there is a person targeted
        targetID = parsefuncs.parseDiscordID(message.contentObj.body);
        if(targetID === -1) return message.react('❎'); // not valid id provided
        if(message.userObj.permission === 0)
            return message.react('🔒'); // no peasants allowed past here
        let targetObj = dbfuncs.getDiscokid(targetID);
        if(targetObj !== undefined && message.userObj.permission < targetObj.permission)
            return message.react('🔒'); // user's permission level isn't high enough
    }

    let res = dbfuncs.listUserRequirements(targetID, message.guild.id, message.channel.id);
    let msg = res.map((r) => { return `id: ${r.reqID} | ${r.message}`; }).join('\n');
    return message.channel.send(msg === '' ? '0 reqs' : 'use "delete [id]" to delete\n```'+msg+'```');
};

commands.handleShowChannel = function(message) {

};

commands.handleForce = function(message) {

};

commands.handleDelete = function(message) {
    let reqID = parseInt(message.contentObj.body);
    if(isNaN(reqID)) { // if no reqID provided, then show 
        let res = dbfuncs.listUserRequirements(message.author.id);
        let msg = res.map((r) => { return `id: ${r.reqID} | ${r.message}`; }).join('\n');
        return message.channel.send(msg === '' ? '0 reqs' : 'use "delete [id]" to delete\n```'+msg+'```');
    } else {
        let reqObj = dbfuncs.getRequirement(reqID);
        if(reqObj === undefined) return message.react('❎'); // not valid reqID
        if(message.userObj.permission === 0 && message.userObj.discordid !== reqObj.discordid)
            return message.react('🔒'); // peasants not allowed to delete someone else's
        if(message.userObj.permission < reqObj.permission)
            return message.react('🔒'); // permission level is lower than target's permission level
        let res = dbfuncs.deleteRequirement(reqID);
        return message.react(res ? '✅' : '❎');
    }
};

commands.handleThanks = function(message) {
    if(message.contentObj.command === 'thank' &&
       message.contentObj.body !== 'you')
        return;
    return message.channel.send('no problem');
};

commands.handleClearCurrentSnaps = function(message) {

};

commands.handlePing = function(message) {

};

commands.handlePermit = function(message) {
    let content = message.contentObj.body.split(' ');

    if(content.length < 2)
        return message.react('❎'); // not enough parameters provided
    let targetID = parsefuncs.parseDiscordID(content[0]);
    if(targetID === -1)
        return message.react('❎'); // no valid discord id provided
    // TODO: check if this targetID exists in server

    let perm = parseInt(content[1]);
    if(isNaN(perm))
        return message.react('❎'); // no number provided
    if(message.userObj.permission < perm)
        return message.react('❎'); // cannot assign higher than your own
    let targetObj = dbfuncs.getDiscokid(targetID, message.guild.id);
    let res;
    if(targetObj === undefined)
      res = dbfuncs.addDiscokid(targetID, message.guild.id, perm) !== -1;
    else if(targetObj.permission <= message.userObj.permission)
      res = dbfuncs.updateDiscokid(targetObj.dkidID, perm);
    else
      return message.react('🔒'); // the target's permission level is higher than yours
    return message.react(res ? '✅' : '❎');
};

commands.handlePriceCheck = function(message) {

};



module.exports = commands;