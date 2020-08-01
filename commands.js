var parsefuncs = require('./parse.js');
const embeds = require('./embeds.js');
const config = require('./config.js'); // consistency right?
var dbfuncs = require("./dbfuncs.js");
var aliases = require("./aliases.js");
var https = require('https');

const commands = {};

// i suppose i should say something here
// lol

commands.handleHelp = function(message, { pwbContent, pwbUser }) {
    switch(pwbContent.body) {
        case 'misc':
            return message.channel.send(embeds.helpMiscCommands);
        case 'request':
            return message.channel.send(embeds.helpRequestParameters);
        case 'example':
        case 'examples':
            return message.channel.send(embeds.helpRequestExamples);
        default:
            if(pwbUser.permission > 0)
                return message.channel.send(embeds.helpCommandsAdmin);
            else if(pwbUser.permission === 0) 
                return message.channel.send(embeds.helpCommandsBasic);
    }
};

commands.handleTagMe = function(message, { pwbContent, pwbUser, pwbChannel }) {
    // restricts user if they have higher or equal permission level to channel permission requirements
    if(pwbUser.permission < pwbChannel.limitedto)
        return message.react('🔒'); 
    if(pwbContent.body === '')
        return message.react('❎'); // no reqs found

    let pars = parsefuncs.parseReqs(pwbContent.body);
    if(pars.message === '')
        return message.react('❎'); // no coherent parameters given by user

    let targetObj = pwbUser;
    if(pars.assign !== undefined) { // handle if -assign
        if(!existsInGuild(message.guild, pars.assign) && !parsefuncs.isSpecialMention(pars.assign))
            return message.react('❎'); // cannot be assigned because doesn't exist in guild
        targetObj = dbfuncs.getDiscokid(pars.assign, message.guild.id); // get permission level of -assign target
        if(targetObj === undefined)
            targetObj = { permission: 0, discordid: pars.assign };
        delete pars.assign; // just in case dbfuncs.addRequirement() messes up
        if(pwbUser.permission <= targetObj.permission)
            return message.react('🔒'); // user isn't good enough to assign on the other person
    }

    // if user doesn't exist in database, then add him
    if(targetObj.dkidID === undefined)
        targetObj.dkidID = dbfuncs.addDiscokid(targetObj.discordid, message.guild.id);
    else {
        let count = dbfuncs.listUserRequirements(targetObj.discordid, message.guild.id, message.channel.id).length;
        let mylimit = targetObj.permission === 0 ? config.peasantlimit : config.limitreqs; // peasant limit vs mod limit
        if(count >= mylimit) {
            message.react('❎'); // target has reached the limit for reqs to make
            return message.reply(`you have reached your limit of ${mylimit} reqs`);
        }
    }

    let info = dbfuncs.addRequirement(targetObj.dkidID, pwbChannel.chID, pars);
    if(info.changes === 1) {
        //message.react('✅');
        message.channel.send('```id: '+info.lastInsertRowid+' | '+pars.message+'```');
    } else {
        message.react('❎');
    }
};

// pwbChannel should be undefined if this isn't under watch yet
commands.handleWatch = function(message, { pwbContent, pwbUser }) {
    if(pwbUser.permission === 0) // no peasants allowed
        return; // message.react('🔒');

    let limitedto = parseInt(pwbContent.body); // parse body for extra parameter
    if(isNaN(limitedto)) limitedto = 0;

    if(pwbUser.permission < limitedto) // user doesn't have enough permission
        return message.react('🔒');
    let res = dbfuncs.addChannel(message.channel.id, message.guild.id, limitedto);

    if(res !== -1) return message.channel.send('The bot is now watching this channel for snap requests');
    else return message.channel.send('Error: this channel is probably already under watch');
};

commands.handleUnwatch = function(message) {
    let res = dbfuncs.deleteChannel(message.channel.id);
    if(res) return message.channel.send('Removed this channel from bot watch and deleted all snap requests in it');
    else return message.channel.send('Error: database error');
};

commands.handleShowUser = function(message, { pwbContent, pwbUser, pwbChannel }) {
    let targetID = message.author.id;
    if(pwbContent.body !== '' && pwbContent.body !== 'me') { // if there is a person targeted
        if(parsefuncs.isSpecialMention(pwbContent.body))
            targetID = pwbContent.body;
        else
            targetID = parsefuncs.parseDiscordID(pwbContent.body);

        if(targetID === -1)
            return message.react('❎'); // not valid id provided
        if(message.author.id === targetID)
            return message.channel.send(`don't tag yourself`); // don't tag yourself
        if(pwbUser.permission === 0)
            return message.react('🔒'); // no peasants allowed past here
        let targetObj = dbfuncs.getDiscokid(targetID, message.guild.id);
        if(targetObj !== undefined && pwbUser.permission < targetObj.permission)
            return message.react('🔒'); // user's permission level isn't high enough
    }

    let res = dbfuncs.listUserRequirements(targetID, message.guild.id, message.channel.id);
    let msg = res.map((r) => { return `id: ${r.reqID} | ${r.message}`; }).join('\n');
    return message.channel.send(msg === '' ? '0 reqs' : 'use "!pwb delete [id]" (without square brackets) to delete\n```'+msg+'```');
};

commands.handleShowChannel = function(message) {

};

commands.handleForce = function(message) {

};

// for deleteing reqs
commands.handleDelete = function(message, { pwbContent, pwbUser, pwbChannel }) {
    let reqID = parseInt(pwbContent.body);
    if(isNaN(reqID)) { // if no reqID provided, then show self
        pwbContent.body = '';
        return commands.handleShowUser(message, { pwbContent, pwbUser, pwbChannel });
    } else { // process delete
        let reqObj = dbfuncs.getRequirement(reqID);
        if(reqObj === undefined)
            return message.react('❎'); // not valid reqID
        if(reqObj.discordchid !== message.channel.id)
            return message.react('❎'); // can only delete from same channel
        if(pwbUser.permission === 0 && pwbUser.discordid !== reqObj.discordid)
            return message.react('🔒'); // peasants not allowed to delete someone else's
        if(pwbUser.permission < reqObj.permission)
            return message.react('🔒'); // permission level is lower than target's permission level
        let res = dbfuncs.deleteRequirement(reqID);
        return message.react(res ? '✅' : '❎');
    }
};

// !pwb budget - deletes the budget for the current user
// !pwb budget [number] - sets the budget for the current user
// !pwb budget [tag] - deletes the budget for targeted user
// !pwb budget [number] [tag] - sets the budget for targeted user
// !pwb budget [tag] [number] - sets the budget for targeted user
commands.handleBudget = function(message, { pwbContent, pwbUser, pwbChannel }) {
    let pwbTarget = pwbUser; // default targets the user
    let { body, targetID } = parsefuncs.parseTargetID(pwbContent.body);
    if(targetID !== undefined) { // target acquired
        pwbTarget = dbfuncs.getDiscokid(message.author.id, message.guild.id);
        pwbContent.body = body;
    }
    if(pwbTarget === undefined) // if target doesn't exist in our database, set defaults
        pwbTarget = { permission: 0, discordid: targetID };
    if(pwbTarget.dkidID === undefined) // if target doesn't exist in our database, create it
        pwbTarget.dkidID = dbfuncs.addDiscokid(pwbTarget.discordid, message.guild.id);

    if(pwbUser.permission < pwbTarget.permission)
        return message.react('🔒'); // user's permission level is lower than target's permission level

    if(pwbContent.body === '' || pwbContent.body === 'delete' || pwbContent.body === 'del') { // delete the budget for the target
        let result = dbfuncs.setBudget(pwbTarget.dkidID, pwbChannel.chID);
        return message.channel.send(result ? "successfully deleted budget" : "failed to delete budget");
    }

    let budget = parsefuncs.parseVerboseNumber(pwbContent.body);
    if(isNaN(budget))
        return message.channel.send("not a valid number");

    let result = dbfuncs.setBudget(pwbTarget.dkidID, pwbChannel.chID, budget);
    if(result) return message.channel.send("successfully set budget to " + budget);
    else return message.channel.send("There was an error in the database");
};

// !pwb thanks
// !pwb thank you
// !pwb thank
// !pwb ty
commands.handleThanks = function(message, { pwbContent, pwbUser, pwbChannel }) {
    if(pwbContent.command === 'thanks' && pwbContent.body === '' || 
       pwbContent.command === 'thank' && pwbContent.body === 'you') {
        return message.channel.send('no problem');
    } else if(pwbContent.command === 'thank' && pwbContent.body === '') {
        return message.channel.send('you');
    } else if(pwbContent.command === 'ty' && pwbContent.body === '')
        return message.channel.send('np');
};

commands.handleClearCurrentSnaps = function(message) {

};

commands.handlePing = function(message) {

};

// !pwb permit [integer] [tag] - sets the permission level for target
// !pwb permit [tag] [integer] - sets the permission level for target
commands.handlePermit = function(message, { pwbContent, pwbUser, pwbChannel }) {
    if(pwbContent.body.split(' ').length !== 2) // check if correct number of parameters
        return message.channel.send('Format: !pwb permit [tag] [integer]');

    let { body, targetID } = parsefuncs.parseTargetID(pwbContent.body);
    if(pwbUser.discordid === targetID)
        return message.channel.send('Failed: cannot target yourself'); // cannot target self
    pwbContent.body = body;
    if(targetID === undefined || !existsInGuild(message.guild, targetID))
        return message.channel.send('Failed: invalid tag'); // no valid discord id provided

    let perm = pwbContent.body; // permission level to set target to
    if(isNaN(perm))
        return message.channel.send('Failed: invalid integer'); // no number provided
    if(perm > pwbUser.permission)
        return message.channel.send('Failed: provided integer was higher than ' + pwbUser.permission); // cannot set higher than your own level


    let pwbTarget = dbfuncs.getDiscokid(targetID, message.guild.id);
    if(pwbTarget === undefined) { // if target doesn't exist in our database, create it
        let result = dbfuncs.addDiscokid(targetID, message.guild.id, perm);
        if(result !== -1) return message.channel.send('Success: set permission level to ' + perm);
        else return message.channel.send('Failed: internal server error 1');

    } else if(pwbTarget.permission <= pwbUser.permission) {
        let result = dbfuncs.updateDiscokid(pwbTarget.dkidID, perm);
        if(result !== -1) return message.channel.send('Success: set permission level to ' + perm);
        else return message.channel.send('Failed: internal server error 2');
    } else {
      return message.channel.send('Failed: target has a higher permission level than your own'); // the target's permission level is higher than yours
    }
};

/**
 * @param message - if you pass in this parameter, then { pwbContent } is mandatory.
                    if message is undefined, then the param bot is mandatory. 
 * @param { pwbContent } - pass in undefined if you didn't pass in param message
 * @param bot - mandatory if param message is undefined
 * @param querystring - optional. overridden by pwbContent.body if param message exists
 */
commands.handleSearch = async function(message, { pwbContent }={}, bot=message.client, querystring='') {
    try {
        if(message !== undefined)
            querystring = pwbContent.body;
        let snapsCurrent = await pingPoringWorld(querystring);
        console.log(`${new Date().toLocaleString()} got response from poring.world q='${querystring}'`);
        if(message !== undefined) message.react('✅');

        let gon = dbfuncs.clearExpiredSnaps();
        let snapsNew = dbfuncs.addSnaps(snapsCurrent);
        console.log(`${new Date().toLocaleString()}   added ${snapsNew.length} new snaps to db; cleared ${gon} expired snaps to db`);

        for(let sr of snapsNew) {
            sr.alias = 0;
            let fullname = parsefuncs.buildItemFullName(sr);
            let foundreqs = dbfuncs.findRequirements(sr);
            let res; // add all aliases for this to snapsNew so we can search against requirements
            if(sr.category.startsWith('Equipment')) // all equipment aliases
                res = aliases.equips[parsefuncs.prepName(sr.name)];
            else if(sr.category.startsWith('Card')) // all aliases for mvp cards
                res = aliases.bosscards[parsefuncs.prepName(sr.name)];

            if(res !== undefined) {
                foundreqs = res.reduce((acc, curr) => [
                    ...acc,
                    ...dbfuncs.findRequirements({ ...sr, aliasname: curr, alias: 1 })
                ], foundreqs);
            }

            if(foundreqs.length === 0) // if nobody cares about this, go next
                continue;

            let itemembed = embeds.buildSnappingInfo(sr);
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
        }
        console.log(`${new Date().toLocaleString()}   done notifying users of pings`);

    } catch(e) {
        if(message !== undefined) message.react('❎');
        console.error("ERROR pingPoringWorld: " + e);
    }
};

commands.handlePriceCheck = async function(message, { pwbContent, pwbUser, pwbChannel }) {
    try {
        console.log("handlepricecheck");
        let words = '';
        let jsonMessage = await pcPoringWorld(pwbContent.body);

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
