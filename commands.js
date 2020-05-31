var parsefuncs = require('./parse.js');
const config = require('./config.js'); // consistency right?
var dbfuncs = require("./dbfuncs.js");
var aliases = require("./aliases.js");
var https = require('https');

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
    if(message.contentObj.body === '')
        return message.react('❎'); // no reqs found

    let pars = parsefuncs.parseReqs(message.contentObj.body);
    if(pars.message === '')
        return message.react('❎'); // no coherent parameters given by user

    let targetObj = message.userObj;
    if(pars.assign !== undefined) { // handle if -assign
        if(!existsInGuild(message.guild, pars.assign))
            return message.react('❎'); // cannot be assigned because doesn't exist in guild
        targetObj = dbfuncs.getDiscokid(pars.assign, message.guild.id); // get permission level of -assign target
        if(targetObj === undefined)
            targetObj = { permission: 0, discordid: pars.assign };
        delete pars.assign; // just in case dbfuncs.addRequirement() messes up
        if(message.userObj.permission <= targetObj.permission)
            return message.react('🔒'); // user isn't good enough to assign on the other person
    }

    // if user doesn't exist in database, then add him
    if(targetObj.dkidID === undefined)
        targetObj.dkidID = dbfuncs.addDiscokid(targetObj.discordid, message.guild.id);
    else {
        let count = dbfuncs.listUserRequirements(targetObj.discordid, message.guild.id, message.channel.id).length;
        if(targetObj.permission === 0 && count >= config.peasantlimit || // peasants can only have config.peasantlimit amount of reqs in a channel
           count >= config.limitreqs) // nonpeasants can only have config.limitreqs amount of reqs in a channel
            return message.react('❎'); // target has reached the limit for reqs to make
    }

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
    let res = dbfuncs.addChannel(message.channel.id, message.guild.id, limitedto);
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
        let targetObj = dbfuncs.getDiscokid(targetID, message.guild.id);
        if(targetObj !== undefined && message.userObj.permission < targetObj.permission)
            return message.react('🔒'); // user's permission level isn't high enough
    }

    let res = dbfuncs.listUserRequirements(targetID, message.guild.id, message.channel.id);
    let msg = res.map((r) => { return `id: ${r.reqID} | ${r.message}`; }).join('\n');
    return message.channel.send(msg === '' ? '0 reqs' : 'use "delete [id]" (without square brackets) to delete\n```'+msg+'```');
};

commands.handleShowChannel = function(message) {

};

commands.handleForce = function(message) {

};

// for deleteing reqs
commands.handleDelete = function(message) {
    let reqID = parseInt(message.contentObj.body);
    if(isNaN(reqID)) { // if no reqID provided, then show self
        message.contentObj.body = '';
        return commands.handleShowUser(message);
    } else { // process delete
        let reqObj = dbfuncs.getRequirement(reqID);
        if(reqObj === undefined)
            return message.react('❎'); // not valid reqID
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
    let body = message.contentObj.body.split(' ');

    if(body.length < 2)
        return message.react('❎'); // not enough parameters provided
    let targetID = parsefuncs.parseDiscordID(body[0]);
    if(targetID === -1 || !existsInGuild(message.guild, targetID))
        return message.react('❎'); // no valid discord id provided

    let perm = parseInt(body[1]);
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

/**
 * @param bot - must be provided
 * @param message - optional. used only for responding to "force"/"search"/"query"
 *                  message.contentObj.body must contain the querystring
 */
commands.handleSearch = async function(bot, message) {
    try {
        let gon = dbfuncs.clearExpiredSnaps();
        console.log(`${new Date().toLocaleString()} cleared ${gon} expired snaps from database`);
        let querystring = (message !== undefined) ? message.contentObj.body : '';
        let snapsCurrent = await pingPoringWorld(querystring);
        console.log(`${new Date().toLocaleString()} got response from poring.world`);
        if(message !== undefined) message.react('✅');
        let snapsNew = dbfuncs.addSnaps(snapsCurrent);
        console.log(`${new Date().toLocaleString()} added ${snapsNew.length} new snaps to database`);

        // add all aliases for this to snapsNew so we can search against requirements
        let snapsAliases = [];
        for(let sr of snapsNew) {
            sr.alias = 0;
            if(!sr.name.startsWith('Equipment')) continue;
            let res = aliases[sr.name.toLowerCase().replace(/[^a-z0-9★]/g, '')];
            if(res === undefined) continue;
            snapsAliases = snapsAliases.concat(res.map(aliasname => ({
                ...sr,
                aliasname: aliasname,
                alias: 1
            })));
        }
        snapsNew = snapsNew.concat(snapsAliases);

        for(let sr of snapsNew) {
            let fullname = parsefuncs.buildItemFullName(sr);
            let foundreqs = dbfuncs.findRequirements(sr);
            if(foundreqs.length === 0) // if nobody cares about this, go next
                continue;

            let itemembed = parsefuncs.buildSnappingInfoEmbed(sr);
            let channels = {}; // map with key: channelid and value: discordid pings
            for(let req of foundreqs) {
                if(channels[req.discordchid] === undefined)
                    channels[req.discordchid] = `<@${req.discordid}>`;
                else
                    channels[req.discordchid] +=`<@${req.discordid}>`;
            }

            console.log(channels);

            // send bot message to each channel
            for(let [chid, pings] of Object.entries(channels)) {
                bot.channels.fetch(chid).then((chan) => {
                    chan.send(fullname+' '+pings, itemembed);
                });
            }
            console.log("done notifying users of pings");
        }

    } catch(e) {
        if(message !== undefined) message.react('❎');
        console.error("ERROR pingPoringWorld: " + e);
    }
};

commands.handlePriceCheck = async function(message) {
    try {
        console.log("handlepricecheck");
        let words = '';
        let jsonMessage = await pcPoringWorld(message.contentObj.body);

        words += 'Item name : ' + jsonMessage[0].name + '\n';
        words += 'Price : ' + jsonMessage[0].lastRecord.price + '\n';
        words += 'Stock : ' + jsonMessage[0].lastRecord.stock;
        return message.channel.send('```' + words + '```');

    } catch(e) {
        console.error("ERROR pricecheck failed: " + e);
    }
};

module.exports = commands;

/**
 * Takes an idstring (might have & in front for role)
 *   and checks if there is a user or role in the guild
 * @returns true/false. false if it's a bot
 */
function existsInGuild(guild, idstring) {
    if(idstring.charAt(0) === '&') { // idstring is a role
        let tmp = guild.roles.cache.get(idstring.substring(1));
        if(tmp === undefined || tmp.deleted) return;
    } else { // idstring is a member
        let tmp = guild.members.cache.get(idstring);
        if(tmp === undefined || tmp.deleted || tmp.user.bot) return;
    }
    return true;
}

/**
 * pings poring.world for all snapping information
 * irrelevant snaps are discarded
 * @returns the array of currently active snaps
 */
function pingPoringWorld(querystring) {
    if(querystring === undefined) querystring = '';
    querystring.replace('+', '%2B');
    return new Promise(function(resolve, reject) {
        https.get(`https://poring.world/api/search?order=popularity&inStock=1&q=${querystring}`, (resp) => {
            let data = '';

            // A chunk of data has been recieved.
            resp.on('data', (chunk) => {
                data += chunk;
            });
            resp.on('end', () => {
                try {
                    data = JSON.parse(data);
                    // remove expired snaps
                    data = data.filter(snap => snap.lastRecord.snapEnd > new Date()/1000);

                    resolve(data);
                } catch (err) {
                    reject(err.message);
                }
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
