// Explain file here

const alias = (list = []) => list.reduce((group, alias, index, aliases) => ({
   ...group,
   [alias.toLowerCase().replace(/[^a-z0-9★]/g, '')]: aliases.filter(word => word !== alias),
}), {});

const dictionary = (...lists) => lists.reduce((dictionary, list) => ({
   ...dictionary,
   ...alias(list),
}), {});

// The key for each is the name with lowercase and all punctuation stripped.
// For example: aliases["avalanche"] is ["Buster", "Doom Axe"]
//              aliases["eldershammer"] is ["Acid Touch"]

module.exports = dictionary(
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
  ["Meteor Whip", "Wishing Star"],
  ["Flamberge", "Furious Soldier"],
  ["Elder's Hammer", "Acid Touch"],
  ["Luna Bow", "Moonlight Goddess"],
  ["Sage Diary", "Sage’s Handbook"],
  ["Wing Staff", "Release Of Wish"],
  ["Spell Book Of Ice", "Frost Book"],
  ["Buster", "Doom Axe", "Avalanche"],
  ["Pole Axe", "Halberd", "Soul Spear"],
  ["Lush Fox Grass", "Giant Fox Grass"],
  ["Cutlus", "Nagan", "Blade Of Frenzy"],
  ["Knuckle Dusters", "Studded Knuckles"],
  ["Staff Of Element Fusion", "Unlimited"],
  ["Lance Of Dragon Tamer", "Dragon Howl"],
  ["Roguemaster's Bow", "Robin Hood’s Bow"],
  ["Bill Guisarme", "Punishing Guillotine"],
  ["Spiritual Rod", "Starforged Magic Wand"],
  ["Mace Of Judgment", "Hammer Of Judgement"],
  ["Holy Stick", "Nemesis", "O’Neill’s Staff"],
  ["Loki's Nail", "Death Slice", "Death Gash"],
  ["Cardo", "Green Steel Pike", "Saintly Glaive"],
  ["Desert Twilight", "Sandstorm", "Desert Storm"],
  ["Double Bound", "Cursed Lyre", "Painful Torture"],
  ["Orcish Axe", "Vecer Axe", "Destroyer’s War Axe"],
  ["Healing Staff", "Croce Staff", "Staff of Vitality"],
  ["Piercing Staff", "Wizardry Staff", "Wizard's Power"],
  ["Fullblack Dagger", "Holy Dagger", "Stalker's Knife"],
  ["Cross Bow", "Mystery Bow", "Bow of the Wind Chaser"],
  ["Berdysz", "Battle Berdysz", "War Axe Of Destruction"],
  ["Gakkung Bow", "Malang Snow Crab", "Overlord Crab Bow"],
  ["Wonderful Fox Grass", "Fine Fox Grass", "Fine Pink Fox Grass"],
  ["Survivor's Rod", "Advanced Survival Staff", "Stardust Dragon Staff"],

  // OFFHAND
  ["Telekinetic Orb"],
  ["Nile's Bracelet"],
  ["Chemical Protection Gloves"],
  ["Skull Bracer", "Evil Bracer"],
  ["Fox Wrist Guard", "Noble Bracer"],
  ["Floral Bracelet", "Rosa Bracelet"],
  ["Magic Bible Vol1", "Sacrifice Book"],
  ["Statue Of Judgement", "Statue Of Mother Mary"],
  ["Statue Of Guardian Angel", "Statue Of Archangel"],

  // ARMOR
  ["Elegant Uniform", "Moon Gown"],
  ["Bohemian Coat", "Madman's Jacket"],
  ["Chain Mail", "Garman Plate Armor"],
  ["Goibne's Armor", "Gods’ Blessings"],
  ["Robe Of Judgment", "Dawn Clothes"],
  ["Surging Magic Robe", "Magic Abyss"],
  ["Staunch Armor", "The Chosen’s Armor"],
  ["Staunch Clothes", "The Chosen’s Gown"],
  ["Meteorite Armor", "Comet Warfare Armor"],
  ["Alloy Mail", "Alloy Armor", "Bright Armor"],
  ["Scapulare", "Holy Robe", "Glorious Praise"],
  ["Dragon Vest", "Sniping Suit", "Tyre's Armor"],
  ["Elaborate Costume", "Floating Cloud Clothes"],
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
  ["Advanced Fox Grass", "Magical Fox Grass", "Magical Yellow Fox Grass"],
  ["Ninja Suit Sakura", "Ninja Suit Moonlight", "Ninja Clothes·Cold Night Song"],

  // GARMENT
  ["Cotton Shirt", "Undershirt"],
  ["Staunch Cape", "Magic Staunch Manteau"],
  ["Survivor's Manteau", "Advanced Survivor's Manteau"],

  // SHOE
  ["Crystal Pumps"],
  ["Shoes", "Bunny Slipper"],
  ["Safety Boots", "Greaves"],
  ["Rune Shoes", "Rune Boots"],
  ["High Heels", "High Fashion Sandals"],
  ["Sack Teddy Shoes", "Advanced Sack Teddy Shoes"],

  // ACCESSORY
  ["Matyr's Leash", "Fox Teeth"],
  ["Luna Brooch", "Bright Moon"],
  ["Critical Ring", "Fissure Beam"],
  ["Fairy in Bottle", "Fading Tear"],
  ["Eye of Dullahan", "Kraken's Eye"],
  ["Staunch Ring", "Ring of Loyalty"],
  ["Pocket Watch", "Time Manipulator"],
  ["Orleans's Gloves", "Tibbers' Hand"],
  ["Brooch", "AGI Pin", "Seventh Sense"],
  ["Rosary", "LUK Necklace", "Lucky Star"],
  ["Glove", "Dogtooth Gloves", "Dog Servant"],
  ["Orleans Necklace", "Tibbers's Redemption"],
  ["INT Earring", "Flame Ring", "Flame Feather"],
  ["Fire Ninja Shinobi’s Belt", "Hermit's Bundle"],
  ["Strength Ring", "Powerful Ring", "Ring of Contract"],
  ["Talisman Grass Necklace", "Four-Leaf Clover Necklace"],
  ["Tuna Talisman", "Fresh Tuna Talisman", "Original Will Talisman"],
  ["VIT Necklace", "Endurance Necklace", "STR Necklace", "Ring Of Immortality"]
);
