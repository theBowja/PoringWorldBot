// Explain file here

const alias = (list = []) => list.reduce((group, alias, index, aliases) => ({
   ...group,
   [alias.toLowerCase().replace(/[^a-z0-9★]/g, '')]: aliases,
}), {});

const dictionary = (...lists) => lists.reduce((dictionary, list) => ({
   ...dictionary,
   ...alias(list),
}), {});

// blah blah blah 

module.exports = dictionary(
  ["Piercing Staff", "Wizardry Staff", "Wizard's Power"],
  ["Bill Guisarme", "Punishing Guillotine"],
  ["Magic Bible Vol1", "Sacrifice Book"],
  ["★★"]

);
