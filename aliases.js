const prepName = require('./parse.js').prepName;

// Explain file here

const aliases = {};

const alias = (list = []) => list.reduce((group, alias, index, aliases) => ({
   ...group,
   [prepName(alias)]: aliases.filter(word => word !== alias),
}), {});

const dictionary = (...lists) => lists.reduce((dictionary, list) => ({
   ...dictionary,
   ...alias(list),
}), {});

// The key for each is the name with lowercase and all punctuation stripped.
// For example: aliases["avalanche"] is ["Buster", "Doom Axe"]
//              aliases["eldershammer"] is ["Acid Touch"]
aliases.equips = dictionary(
  // WEAPON
  ["Bass", "Lira"],
  ["Lute", "Southern Lute"],
  ["Giant Gloves", "Titan"],
  ["Scalpel", "Tooth Blade"],
  ["Holy Avenger", "Heavens"],
  ["Chemeti Whip", "Sinking"],
  ["Slash", "Heaven's Wrath"],
  ["Finger", "Griffin’s Claw"],
  ["Sword Mace", "Noble Cross"],
  ["Sura Rampage", "Sky Smash"],
  ["Waghnak", "Claw", "Tacaro"],
  ["Forest Staff", "Lost Staff"],
  ["Meteor Whip", "Wishing Star"],
  ["Flamberge", "Furious Soldier"],
  ["Elder's Hammer", "Acid Touch"],
  ["Luna Bow", "Moonlight Goddess"],
  ["Sage Diary", "Sage’s Handbook"],
  ["Wing Staff", "Release Of Wish"],
  ["Spearfish Pike", "Ocean Dread"],
  ["Spell Book Of Ice", "Frost Book"],
  ["Buster", "Doom Axe", "Avalanche"],
  ["Curse Gauntlets", "Hand of Chaos"],
  ["Pole Axe", "Halberd", "Soul Spear"],
  ["Lush Fox Grass", "Giant Fox Grass"],
  ["Red Wing Revolver", "Inferno Pistol"],
  ["Knuckle Dusters", "Studded Knuckles"],
  ["Gold Lux Pistol", "Gold Law Enforcer"],
  ["Staff Of Element Fusion", "Unlimited"],
  ["Wildfire Swords", "Black Flame Sword"],
  ["Lance Of Dragon Tamer", "Dragon Howl"],
  ["Wind Wheel Dart", "Wind Dart - Venus"],
  ["Roguemaster's Bow", "Robin Hood’s Bow"],
  ["Bill Guisarme", "Punishing Guillotine"],
  ["Blood Axe", "Bloody Axe", "Blood Hound"],
  ["Spiritual Rod", "Starforged Magic Wand"],
  ["Mace Of Judgment", "Hammer Of Judgement"],
  ["Holy Stick", "Nemesis", "O’Neill’s Staff"],
  ["Loki's Nail", "Death Slice", "Death Gash"],
  ["Cardo", "Green Steel Pike", "Saintly Glaive"],
  ["Desert Twilight", "Sandstorm", "Desert Storm"],
  ["Assault Terminator", "Terminator Sniper Rifle"],
  ["Wind Shuriken", "Wind Shuriken - Swift Shadow"],
  ["Double Bound", "Cursed Lyre", "Painful Torture"],
  ["Orcish Axe", "Vecer Axe", "Destroyer’s War Axe"],
  ["Healing Staff", "Croce Staff", "Staff of Vitality"],
  ["Piercing Staff", "Wizardry Staff", "Wizard's Power"],
  ["Fullblack Dagger", "Holy Dagger", "Stalker's Knife"],
  ["Cross Bow", "Mystery Bow", "Bow of the Wind Chaser"],
  ["Cutlus", "Nagan", "Blade of Rage", "Blade Of Frenzy"],
  ["Berdysz", "Battle Berdysz", "War Axe Of Destruction"],
  ["Gakkung Bow", "Malang Snow Crab", "Overlord Crab Bow"],
  ["Renowned Blade - Muramasa", "Monster Knife - Muramasa"],
  ["Wonderful Fox Grass", "Fine Fox Grass", "Fine Pink Fox Grass"],
  ["Survivor's Rod", "Advanced Survival Staff", "Stardust Dragon Staff"],
  ["Advanced Fox Grass", "Magical Fox Grass", "Magical Yellow Fox Grass"],

  // OFFHAND
  ["Exorcism Bible", "Divine Eye"],
  ["Arm Armor", "Improved Arm Armor"],
  ["Mirror Shield", "Nirvana Shield"],
  ["Orleans's Server", "Peak Platter"],
  ["Stone Buckler", "Meteorite Buckler"],
  ["Magic Bible Vol1", "Sacrifice Book"],
  ["Sacrifice Book", "Creeper Agreement"],
  ["Nile's Bracelet", "Heilion Bracelet"],
  ["Sacred Mission", "Giant Wing Shield"],
  ["Static Shield", "Giant Armor Shield"],
  ["Telekinetic Orb", "Contract Jewelery"],
  ["Round Buckleer", "Royal Silver Shield"],
  ["Shield of Naga", "Dragon Flame Shield"],
  ["Memory Book", "Life Magic Book", "Arcane Codex"],
  ["Skull Bracer", "Evil Bracer", "Skeleton Bracer"],
  ["Floral Bracelet", "Rosa Bracelet", "Rosa Chain"],
  ["Chemical Protection Gloves", "Venom Fang Gloves"],
  ["Fox Wrist Guard", "Noble Bracer", "Golden Wrist"],
  ["Statue Of Guardian Angel", "Statue Of Archangel"],
  ["Golden Ornament", "Vinkt's Bracelet", "Vinkt Magic Bracelet"],
  ["Statue Of Judgement", "Statue Of Mother Mary", "Holy Mother's Radiance"],


  // ARMOR
  ["Elegant Uniform", "Moon Gown"],
  ["Silk Robe", "Magic Light Cocoon"],
  ["Bohemian Coat", "Madman's Jacket"],
  ["Chain Mail", "Garman Plate Armor"],
  ["Robe Of Judgment", "Dawn Clothes"],
  ["Goibne's Armor", "Gods’ Blessings"],
  ["Surging Magic Robe", "Magic Abyss"],
  ["Staunch Armor", "The Chosen’s Armor"],
  ["Sniper Coat", "Jaeger Combat Uniform"],
  ["Staunch Clothes", "The Chosen’s Gown"],
  ["Meteorite Armor", "Comet Warfare Armor"],
  ["Alloy Mail", "Alloy Armor", "Bright Armor"],
  ["Scapulare", "Holy Robe", "Glorious Praise"],
  ["Dragon Vest", "Sniping Suit", "Tyre's Armor"],
  ["Mink Coat", "Beast Heart", "Tyrannical Armor"],
  ["Summoner Coat", "Stardust Robe", "Blanking Coat"],
  ["Wooden Mail", "Iron Armor", "Perseverance Armor"],
  ["Mage Coat", "Robe Of Cast", "Star Shatter’s Gown"],
  ["Saint's Robe", "Saint's Cape", "Shinewhole’s Robe"],
  ["Lord's Clothes", "Glittering Jacket", "Greed Shirt"],
  ["Tights", "Ranger Clothes", "Dark Star Stealth Clothes"],
  ["Rogue Clothes", "Thief Clothes", "Breath Holder’s Armor"],
  ["Mithril Metal Armor", "Legion Plate Armor", "Watcher's Armor"],
  ["Elegant Doram Manteau", "Elegant Doram Suit", "Lazy Meow Coat"],
  ["Elaborate Costume", "Elegant Dancing Dress","Floating Cloud Clothes"],
  ["Ninja Suit Sakura", "Ninja Suit Moonlight", "Ninja Clothes·Cold Night Song"],

  // GARMENT
  ["Manteau", "Pauldron"],
  ["Deathcat Cape", "Hood"],
  ["Blueeve Cape", "Golden Manteau"],
  ["Ancient Cape", "White Duke's Manteau"],
  ["Illusion Garments", "Earl's Illusion Garments"],
  ["Cotton Shirt", "Undershirt", "Cloud Undershirt"],
  ["Staunch Cape", "Magic Staunch Manteau", "Deerskin Manteau"],
  ["Goibne's Spaulders", "Duff's Cape", "Merlin's Time-Space Robe"],
  ["Natto Kig’s Manteau", "Natto Kig's Cloak", "Divine Feather Clothes"],
  ["Survivor's Manteau", "Advanced Survivor's Manteau", "Grey Elf’s Manteau"],

  // SHOE
  ["Shoes", "Bunny Slipper"],
  ["Safety Boots", "Greaves"],
  ["Tidal Shoes", "Mayfly Shoes"],
  ["Sniper Boots", "Ranger Boots"],
  ["Crystal Pumps", "White Gem Boots"],
  ["Deathcat Shoes", "Deathcat Boots"],
  ["Momo Shoes", "The Emperor's Boots"],
  ["Rescuer Shoes", "Soft Sole Hiking Boots"],
  ["Boots Of Judgment", "Light Of Truth Shoes"],
  ["Elegant Doram Shoes", "Kitten's Ankle Bell"],
  ["Dance Shoes", "Dancing Shoes", "Ballet Shoes"],
  ["Soldier Boots", "Through-War Shoes", "Steel Boots"],
  ["Rune Shoes", "Rune Boots", "Saint Mary's Cloth Shoes"],
  ["High Heels", "High Fashion Sandals", "Green Rattan Shoes"],
  ["Sack Teddy Shoes", "Advanced Sack Teddy Shoes", "Boar Bristle Shoes"],
  ["Wolf Grandmother’s Slippers", "Wolf Grandma’s Slippers", "Little Fairy’s Slippers"],


  // ACCESSORY
  ["Matyr's Leash", "Fox Teeth"],
  ["Luna Brooch", "Bright Moon"],
  ["Critical Ring", "Fissure Beam"],
  ["Fairy in Bottle", "Fading Tear"],
  ["Eye of Dullahan", "Kraken's Eye"],
  ["Staunch Ring", "Ring of Loyalty"],
  ["Pocket Watch", "Time Manipulator"],
  ["Black Cat Brooch", "Cat Paw Stamp"],
  ["Orleans's Gloves", "Tibbers' Hand"],
  ["Brooch", "AGI Pin", "Seventh Sense"],
  ["Sniper Medal", "Hunting Certificate"],
  ["Rosary", "LUK Necklace", "Lucky Star"],
  ["Glove", "Dogtooth Gloves", "Dog Servant"],
  ["Orleans Necklace", "Tibbers's Redemption"],
  ["INT Earring", "Flame Ring", "Flame Feather"],
  ["Fire Ninja Shinobi’s Belt", "Hermit's Bundle"],
  ["Strength Ring", "Powerful Ring", "Ring of Contract"],
  ["Talisman Grass Necklace", "Four-Leaf Clover Necklace"],
  ["Ninja's Introduction Manual", "Ninja's Advanced Guide"],
  ["Tuna Talisman", "Fresh Tuna Talisman", "Original Will Talisman"],
  ["VIT Necklace", "Endurance Necklace", "STR Necklace", "Ring Of Immortality"]
);

aliases.potioneffect = dictionary(
  // POTION - EFFECT
  ["Military Exploit", "Military Exploit Chest", "Military Exploit Chest - Off-hand", "Military Exploit Chest - Armor"]
);

// Gears that can be exchanged for Ancient Gear Refine Vouchers
const ancientTier1 = ["Cotton Shirt", "Undershirt", "Cloud Undershirt", "Ancient Cape", "White Duke's Manteau", "Blueeve Cape", "Golden Manteau",
                      "Survivor's Manteau", "Advanced Survivor's Manteau", "Grey Elf’s Manteau","Staunch Cape", "Magic Staunch Manteau", "Deerskin Manteau",
                      "Natto Kig’s Manteau", "Natto Kig's Cloak", "Divine Feather Clothes", "Elegant Doram Shoes", "Kitten's Ankle Bell", "Dance Shoes", 
                      "Dancing Shoes", "Ballet Shoes", "Rescuer Shoes", "Soft Sole Hiking Boots", "Boots Of Judgment", "Light Of Truth Shoes",
                      "Wolf Grandmother’s Slippers", "Wolf Grandma’s Slippers", "Little Fairy’s Slippers", "Rune Shoes", "Rune Boots", "Saint Mary's Cloth Shoes",
                      "Staunch Ring", "Ring of Loyalty", "Orleans Necklace", "Tibbers's Redemption", "Orleans's Gloves", "Tibbers' Hand", "Luna Brooch", "Bright Moon",
                      "Eye of Dullahan", "Kraken's Eye", "Glove", "Dogtooth Gloves", "Dog Servant"]
const ancientTier2 = ["Goibne's Spaulders", "Duff's Cape", "Merlin's Time-Space Robe","Illusion Garments", "Earl's Illusion Garments",
                      "Crystal Pumps", "White Gem Boots", "Sack Teddy Shoes", "Advanced Sack Teddy Shoes", "Boar Bristle Shoes",
                      "Soldier Boots", "Through-War Shoes", "Steel Boots", "Momo Shoes", "The Emperor's Boots",
                      "High Heels", "High Fashion Sandals", "Green Rattan Shoes", "Tidal Shoes", "Mayfly Shoes", "Matyr's Leash", "Fox Teeth",
                      "Brooch", "AGI Pin", "Seventh Sense", "INT Earring", "Flame Ring", "Flame Feather", "Strength Ring", "Powerful Ring", "Ring of Contract",
                      "VIT Necklace", "Endurance Necklace", "STR Necklace", "Ring Of Immortality", "Rosary", "LUK Necklace", "Lucky Star"]
const ancientTier3 = ["Sniper Boots", "Ranger Boots", "Fairy in Bottle", "Fading Tear", "Black Cat Brooch", "Cat Paw Stamp", "Pocket Watch", "Time Manipulator",
                      "Fire Ninja Shinobi’s Belt", "Hermit's Bundle", "Critical Ring", "Fissure Beam", "Talisman Grass Necklace", "Four-Leaf Clover Necklace"]
const ancientTier4 = ["Tuna Talisman", "Fresh Tuna Talisman", "Original Will Talisman", "Ninja's Introduction Manual", "Ninja's Advanced Guide", 
                      "Sniper Medal", "Hunting Certificate"]
const ancientTier5 = []

const appendtags = (equips, tags) => {
  equips.forEach(equip => aliases.equips[prepName(equip)].push(...tags));
}

appendtags(ancientTier1, ["Ancient Tier 1", "Ancient Voucher"]);
appendtags(ancientTier2, ["Ancient Tier 2", "Ancient Voucher"]);
appendtags(ancientTier3, ["Ancient Tier 3", "Ancient Voucher"]);
appendtags(ancientTier4, ["Ancient Tier 4", "Ancient Voucher"]);
appendtags(ancientTier5, ["Ancient Tier 5", "Ancient Voucher"]);

const mvp = ["Angeling", "Golden Thief Bug", "Miss Tahnee", "Deviling", "Drake",
  "Strouf", "Goblin Leader", "Mistress", "Maya", "Phreeoni", "Eddga",
  "Osiris", "Moonlight Flower", "Orc Hero", "Kobold Leader", "Doppelganger",
  "Atroce", "Orc Lord Helm", "Detarderous", "Owl Baron", "Bloody Knight",
  "Baphomet", "Dark Lord", "Dracula", "Randgris", "Chimera", "Time Holder",
  "Spashire", "Stormy Knight", "Garm", "Firelord Kaho", "Arc Angeling", "Grandma Wolf",
  "Lord Of Death", "Bloody Murderer", "Katerina", "Deeven", "Eremes",
  "Gloom Under Night", "Ktullanux", "Hill Wind", "Snake Demon Gorgons",
  "Wasteland Lord", "Poi Tata", "Audhumbla", "Seed of Yggdrasil", "Soul Player",
  "Dragon Bone", "Incantation Samurai", "Devil Squid", "Tao Gunka"];

const mini = ["Smokie", "Eclipse", "Mastering", "Vocal", "Basilisk", "Ghostring",
  "Toad", "Rotar Zairo", "Dragon Fly", "Vagabond Wolf", "Wood Goblin",
  "Gryphon", "Anubis", "Hyegun", "Orc Baby", "Jakk", "Mutant Dragon",
  "Rafflesia", "Owl Duke", "Alice", "Zherlthsh", "Mysteltainn", "Dark Illusion",
  "Clock", "Clock Tower Manager", "Chepet", "Fire Witch", "Flute Player",
  "Cenia", "Deje", "Loli Ruri", "Gazeti", "Galion", "Fallen Bishop",
  "Mao Guai Calvin", "Maple Fairy Yzma", "Whitebait Lake Lord", "Fire Bird Chiri",
  "Limunus", "Gem Spirit"];

const dead = ["Dead Deviling", "Dead Drake", "Dead Strouf", "Goblin Leader Revenant",
  "Mistress the Revenant", "Dead Maya", "Phreeoni the Revenant", "Dead Eddga", "Revenant Osiris",
  "Dead Moonlight Flower", "Dead Soul", "Dead Atroce", "Detarderous the Dead",
  "Dead Owl Baron", "Bloody Knight Undead", "Dead Time Holder", "Spashire the Dead", "Dead Chimera",
  "Firelord Kaho Dead", "Firelord Dead Kaho", "Dead Stormy Knight"];

const tt = ["Valkyrie Rathgricy", "Tesseract", "Mentalist", "Magic Swordsman Thanatos"];

const makecarddict = (cards, append, aliases) => cards.reduce((dict, curr) => ({
  ...dict,
  [prepName(curr+append)]: [...aliases],
}), {});


aliases.bosscards = {
  ...makecarddict(mvp, " Card", ["MVP Card", "MVP/Mini Card", "Boss Card"]),
  ...makecarddict(mvp, "★ Card", ["MVP★ Card", "MVP/Mini★ Card", "Boss Card"]),
  ...makecarddict(mini, " Card", ["Mini Card", "MVP/Mini Card", "Boss Card"]),
  ...makecarddict(mini, "★ Card", ["Mini★ Card", "MVP/Mini★ Card", "Boss Card"]),
  ...makecarddict(dead, " Card", ["Undead Card", "Dead Card", "Revenant Card", "Boss Card"]),
  ...makecarddict(tt, " Card", ["TT Card", "MVP Card", "MVP/Mini Card", "Boss Card"]),
};

for(let bossname of mvp) {
  aliases.bosscards[prepName(bossname + " Card")].push(bossname + "★ Card");
  aliases.bosscards[prepName(bossname + "★ Card")].push(bossname + " Card");
}

for(let bossname of mini) {
  aliases.bosscards[prepName(bossname + " Card")].push(bossname + "★ Card");
  aliases.bosscards[prepName(bossname + "★ Card")].push(bossname + " Card");
}

module.exports = aliases; // properties: equips, bosscards