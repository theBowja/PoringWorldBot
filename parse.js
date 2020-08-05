const lists = require('./lists.js');
const config = require('./config.js');
const fuzzy = require('./fuzzy.js');

// This module contains most of the functions that handle data processing

var parsefuncs = {};

/**
 * example: "+3 Angry Snarl <Armor 2> (broken)" gets parsed into properties
 * @param itemstring {string} - the "full name" part of the snap taken from poring.world
 * @returns object with properties: name, refine, broken, enchant, enchantlevel, slots
 */
parsefuncs.parseItem = function(itemstring) {
    let props = {};
    let abomination = [];
    if(!itemstring.toLowerCase().includes('blueprint'))
        abomination = /^(\+(\d*)\s)?(((?!\s?(\(broken\)|\[\d]|<.*>)).)*)(\s?\[(\d)])?(\s<(.*)\s(\d)>)?(\s\(broken\))?/.exec(itemstring);
    props.name = abomination[3] || itemstring;
    props.refine = abomination[2] === undefined ? 0 : parseInt(abomination[2]);
    props.broken = abomination[11] === undefined ? false : true;
    props.enchant = abomination[9] === undefined ? 'none' : abomination[9];
    props.enchantlevel = abomination[10] === undefined ? 0 : parseInt(abomination[10]);
    props.slots = abomination[7] === undefined ? 0 : abomination[7];
    return props;
};

/**
 * Builds the full name of an item with refine level, item name, slots, enchant, broken
 * example: "+13 Sniping Suit [1] <Arch 1> (broken)"
 */
parsefuncs.buildItemFullName = function(item) {
    var fullname = "";
    if(item.refine!==0) fullname += ("+"+item.refine+" ");
    fullname += item.name;
    if(item.slots!==0) fullname += (" ["+item.slots+"]");
    if(item.enchant!=="none") fullname += (" <"+item.enchant+" "+item.enchantlevel+">");
    if(item.broken!==0) fullname += " (broken)";
    return fullname;
};

parsefuncs.isSpecialMention = function(discordtag) {
    if(discordtag === 'everyone' || discordtag === 'here') return true;
    return false;
    let prefix = discordtag.charAt(0);
    if(prefix !== '@' && prefix !== 'q' && prefix !== '')
    if(discordtag === '@everyone' || discordtag === '@here') return true;
    return false;
};

// @returns string discord id or integer -1 if not valid
parsefuncs.parseDiscordID = function(discordtag) {
    let id = /<[@q?]!?(&?\d+)>/.exec(discordtag);
    if(id === null) return -1;
    if(id[1] === undefined) return -1;
    return id[1];
};

// @returns boolean true if discordtag/role exists in guild
parsefuncs.validateDiscordID = function(discordtag, guildid) {
  // TODO
};

parsefuncs.parseValidateDiscordID = function(discordtag) {
    return parsefuncs.parseDiscordID(discordtag);
};

/**
 * Parses content into an object with three properties: summon, command, body
 * if content doesn't start with any of summonstring, then all three properties are undefined
 * "!help" is split into "!|help|"; "!pingmewhen -na monocle" is split into "!|pingmewhen|-na monocle" 
 * see test.js file for more examples
 * @return an object with three properties: summon, command, body
 */
parsefuncs.parseContent = function(content) {
    let contentObj = {};
    
    // get the summonstring if there is one
    for(let sum of config.summonstrings) {
        if(content.startsWith(sum)) {
            contentObj.summon = sum;
            break;
        }
    }
    if(contentObj.summon === undefined)
        return contentObj;

    let spaceIndex = content.indexOf(' ', contentObj.summon.length);
    if(spaceIndex === -1) {
        contentObj.command = content.substring(contentObj.summon.length);
        contentObj.body = '';
    } else {
        contentObj.command = content.substring(contentObj.summon.length, spaceIndex);
        contentObj.body = content.substring(spaceIndex+1);
    }
    if(contentObj.command.startsWith('-')) {
        contentObj.body = contentObj.command + ' ' + contentObj.body;
        contentObj.command = "request";
    }
    return contentObj;
};

/**
 * Parses the target discord id from the body. First checks if a tag is at beginning of string,
 *   otherwise check the end of the string.
 *
 * @returns object { body, targetID } where body has the tag stripped from it
 * @examples check test.js lmao
 */
parsefuncs.parseTargetID = function(body) {
    if(body === '') return { body: body }; // readability bro

    let bodyarr = body.split(' ');
    let targetID;
    targetID = parsefuncs.parseDiscordID(bodyarr[0]) // check beginning
    if(targetID !== -1) return { body: bodyarr.slice(1).join(' '), targetID: targetID };

    targetID = parsefuncs.parseDiscordID(bodyarr[bodyarr.length-1]); // check end
    if(targetID !== -1) return { body: bodyarr.slice(0, -1).join(' '), targetID: targetID };

    return { body: body };
};

// strips all unnecessary characters from an item name
parsefuncs.prepName = function(name) {
    return name.toLowerCase().replace(/[^a-z0-9★]/g, '');
};

/**
 * @param reqsstr {string} - straight from inside 
 *   example: "-na eye of dullahan -re 12"
 * @returns object with all the properties :3
 */
parsefuncs.parseReqs = function(reqsstr) {
    reqsstr = reqsstr.substr(1).split(' -');
    let myreqs = { message: '' };
    for(let req of reqsstr) {
        let spaceIndex = req.indexOf(' ');
        let constraint, value;
        if(spaceIndex === -1) {
            constraint = req;
            value = '';
        } else {
            constraint = req.substring(0, spaceIndex);
            value = req.substring(spaceIndex+1);
        }
        constraint = fuzzy.parameter(constraint);
        if(constraint === undefined) continue;

        let ref = 0; // temporary variable
        let cat = ''; // temporary variable
        switch(constraint) {
            case "name":
            case "na":
                if(value === '' || myreqs.name !== undefined) break;
                value = value.replace(/\*/g, '★'); // replace asterick with star
                value = value.replace(/[^a-z0-9★]/g, ''); // use only letters and numbers
                if(value === '') break;
                myreqs.name = value;
                myreqs.message += `-${constraint} ${value} `;
                break;

            case "slotted":
            case "sl":
                if(myreqs.slotted !== undefined) break;
                if(value === '') value = 'yes';
                ref = lists.bool.indexOf(value); // affirmative?
                if(ref === -1) break;
                myreqs.slotted = (ref+1)%2;
                myreqs.message += `-${constraint} ${value} `;
                break;

            case "unslotted":
            case "us":
                if(myreqs.slotted !== undefined) break;
                if(value === '') value = 'yes';
                ref = lists.bool.indexOf(value); // affirmative?
                if(ref === -1) break;
                myreqs.slotted = (ref)%2;
                myreqs.message += `-${constraint} ${value} `;
                break;

            case "refine":
            case "re":
                if(value === '' || myreqs.refine !== undefined) break;
                value = value.replace(/\s+/g, '').split(','); // remove whitespace; split by comma
                if(value.length === 0) break;
                ref = 0;
                cat = '';
                for(let i = 0; i <= 15; i++) {
                    if(value.includes(i.toString())) {
                        ref += Math.pow(2, i);
                        cat += (cat !== '' ? ',' : '')+i; // commas :/
                    }
                }
                if(req !== 0) { // don't add to reqs if no valid refine values provided
                    myreqs.refine = ref;
                    myreqs.message += `-${constraint} ${cat} `;
                }
                break;

            case "stock":
            case "st":
                if(value === '' || myreqs.stock !== undefined) break;
                value = value.replace(/[\s,]+/g, ''); // remove all spaces or commas
                value = parseInt(value, 10);
                if(value > 1) {
                    myreqs.stock = value;
                    myreqs.message += `-${constraint} ${value} `;
                }
                break;

            case "buyer":
            case "buyers":
            case "bu":
                if(value === '' || myreqs.buyers !== undefined) break;
                value = value.replace(/[\s,]+/g, ''); // remove all spaces or commas
                value = parseInt(value, 10);
                if(value > 0) {
                    myreqs.buyers = value;
                    myreqs.message += `-${constraint} ${value} `;
                }
                break;

            case "pricehigher":
            case "ph":
                if(value === '' || myreqs.pricehigher !== undefined) break;
                value = parsefuncs.parseVerboseNumber(value);
                if(value > 0) {
                    if(myreqs.pricelower !== undefined && value > myreqs.pricelower) break;
                    myreqs.pricehigher = value;
                    myreqs.message += `-${constraint} ${value} `;
                }
                break;

            case "pricelower":
            case "pl":
                if(value === '' || myreqs.pricelower !== undefined) break;
                value = parsefuncs.parseVerboseNumber(value);
                if(value > 0) {
                    if(myreqs.pricehigher !== undefined && value < myreqs.pricehigher) break;
                    myreqs.pricelower = value;
                    myreqs.message += `-${constraint} ${value} `;
                }
                break;

            case "enchant":
            case "en":
                if(value === '' || myreqs.enchant !== undefined) break;
                value = value.replace(/[^\sa-z]-+/g, ''); // keep only whitespace and letters
                value = fuzzy.enchant(value);
                if(value !== undefined) {
                    value = value.replace(/\s+/g, ''); // remove whitespace
                    myreqs.enchant = value;
                    myreqs.message += `-${constraint} ${value} `;                   
                }

                break;

            case "enchantlevel":
            case "el":
                if(value === '' || myreqs.enchantlevel !== undefined) break;
                value = value.replace(/\s+/g, '').split(','); // remove whitespace; split by comma
                if(value.length === 0) break;
                ref = 0;
                cat = '';
                for(let i = 0; i <= 4; i++) {
                    if(value.includes(i.toString())) {
                        ref += Math.pow(2, i);
                        cat += (cat !== '' ? ',' : '')+i; // commas :/
                    }
                }
                if(req !== 0) { // don't add to reqs if no valid refine values provided
                    myreqs.enchantlevel = ref;
                    myreqs.message += `-${constraint} ${cat} `;
                }
                break;

            case "category":
            case "ca":
                if(value === '' || myreqs.category !== undefined) break;
                value = value.replace(/\s+/g, ''); // remove all whitespace
                cat = lists.category[value];
                if(cat !== undefined) {
                    myreqs.category = cat;
                    myreqs.message += `-${constraint} ${value} `;
                }
                break;

            case "broken":
            case "br":
                if(myreqs.broken !== undefined) break;
                if(value === '') value = 'yes';
                ref = lists.bool.indexOf(value); // affirmative?
                if(ref === -1) break;
                myreqs.broken = (ref+1)%2;
                myreqs.message += `-${constraint} ${value} `;

                break;

            case "unbroken":
            case "ub":
                if(myreqs.broken !== undefined) break;
                if(value === '') value = 'yes';
                ref = lists.bool.indexOf(value); // affirmative?
                if(ref === -1) break;
                myreqs.broken = (ref)%2;
                myreqs.message += `-${constraint} ${value} `;

                break;

            case "assign":
            case "as":
            case "for":
                if(value === '' || myreqs.assign !== undefined) break;
                if(parsefuncs.isSpecialMention(value)) {
                    myreqs.assign = value;
                    break;
                }
                value = parsefuncs.parseDiscordID(value);
                if(value !== -1)
                    myreqs.assign = value;
                break;

            case "alias":
            case "al":
                if(myreqs.alias !== undefined) break;
                if(value === '') value = 'yes';
                myreqs.alias = 1;
                myreqs.message += `-${constraint} `;
                break;
        }

    }
    myreqs.message = myreqs.message.trim();
    return myreqs;
};

/**
 * Parses whole numbers with thousand, million, or billion
 *   maximum number returned is 10billion-1
 * @returns the floored number. else NaN if not valid
 */
parsefuncs.parseVerboseNumber = function(strnum) {
    let max = 19999999999; // maximum number allowed is 20 billion - 1
    strnum = strnum.toLowerCase().replace(/[^0-9a-z.]+/g, ''); // strip all except number and letters and decimal
    let temp = /^(\d*\.?\d+)\.?([a-z]*)/.exec(strnum);
    if(temp === null) return NaN;
    let [,num,multiplier] = temp
    num = parseFloat(num, 10);
    if(isNaN(num)) return NaN;
    switch(multiplier) {
        case "t":
        case "thousand":
        case "thousands":
            num = num * 1000;
            break;

        case "m":
        case "mil":
        case "million":
        case "millions":
            num = num * 1000000;
            break;

        case "b":
        case "bil":
        case "billion":
        case "billions":
            num = num * 1000000000;
            break;
    }
    if(num > max) num = max;
    return Math.floor(num);
};

module.exports = parsefuncs;