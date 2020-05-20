var lists = require('./lists.js');
var config = require('./config.js');

var parsefuncs = {};

/**
 * @param itemstring {string} - the "name" part of the snap taken from poringworld
 * @returns object with properties: name, refine, broken, enchant, enchantlevel, slots
 */
parsefuncs.parseItem = function(itemstring) {
    var props = {};
    var abomination = /^(\+(\d*)\s)?(((?!\s(\(broken\)|\[\d]|<.*>)).)*)(\s\[(\d)])?(\s<(.*)\s(\d)>)?(\s\(broken\))?/.exec(itemstring);
    props.name = abomination[3];
    props.refine = abomination[2] === undefined ? 0 : abomination[2];
    props.broken = abomination[11] === undefined ? false : true;
    props.enchant = abomination[9] === undefined ? 'none' : abomination[9];
    props.enchantlevel = abomination[10] === undefined ? 0 : abomination[10];
    props.slots = abomination[7] === undefined ? 0 : abomination[7];
    return props;
};

/**
 * builds the full name of an item with refine level, item name, slots, enchant, broken
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

// @returns string discord id or integer -1 if not valid
parsefuncs.parseDiscordID = function(discordtag) {
    let id = /<@!?(&?\d+)>/.exec(discordtag);
    if(id === null) return -1;
    if(id[1] === undefined) return -1;
    return id[1];
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
    return contentObj;
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
        let constraint = req.substring(0, req.indexOf(' '));
        let value = req.substring(req.indexOf(' ')+1).toLowerCase(); // lowercase
        if(constraint === '' || value === '') continue;

        let ref = 0; // temporary variable
        let cat = ''; // temporary variable
        switch(constraint) {
            case "name":
            case "na":
                value = value.replace(/\s+/g, ''); // remove whitespace
                myreqs.name = value;
                myreqs.message += `-${constraint} ${value} `;
                break;

            case "slotted":
            case "sl":
                ref = lists.bool.indexOf(value); // affirmative?
                if(ref === -1) break;
                myreqs.slotted = (ref+1)%2;
                myreqs.message += `-${constraint} ${value} `;
                break;

            case "refine":
            case "re":
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
                value = value.replace(/[\s,]+/g, ''); // remove all spaces or commas
                value = parseInt(value, 10);
                if(value > 0) {
                    myreqs.buyers = value;
                    myreqs.message += `-${constraint} ${value} `;
                }
                break;

            case "pricehigher":
            case "ph":
                value = value.replace(/[\s,]+/g, ''); // remove all spaces or commas
                value = parseInt(value, 10);
                if(value > 0) {
                    if(myreqs.pricelower !== undefined && value > myreqs.pricelower) break;
                    myreqs.pricehigher = value;
                    myreqs.message += `-${constraint} ${value} `;
                }
                break;

            case "pricelower":
            case "pl":
                value = value.replace(/[\s,]+/g, ''); // remove all spaces or commas
                value = parseInt(value, 10);
                if(value > 0) {
                    if(myreqs.pricehigher !== undefined && value < myreqs.pricehigher) break;
                    myreqs.pricelower = value;
                    myreqs.message += `-${constraint} ${value} `;
                }
                break;

            case "enchant":
            case "en":
                value = value.replace(/[\s-]+/g, '');
                if(lists.enchant.includes(value)) {
                    myreqs.enchant = value;
                    myreqs.message += `-${constraint} ${value} `;                   
                }

                break;

            case "enchantlevel":
            case "el":
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
                value = value.replace(/\s+/g, ''); // remove all whitespace
                cat = lists.category[value];
                if(cat !== undefined) {
                    myreqs.category = cat;
                    myreqs.message += `-${constraint} ${value} `;
                }
                break;

            case "broken":
            case "br":
                ref = lists.bool.indexOf(value); // affirmative?
                if(ref === -1) break;
                myreqs.broken = (ref+1)%2;
                myreqs.message += `-${constraint} ${value} `;

                break;

            case "assign":
            case "as":
            case "for":
                value = parsefuncs.parseDiscordID(value);
                if(value !== -1)
                    myreqs.assign = value;
                break;
        }

    }
    myreqs.message = myreqs.message.trim();
    return myreqs;
};

module.exports = parsefuncs;