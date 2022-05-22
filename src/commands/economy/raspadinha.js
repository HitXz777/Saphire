const { e } = require('../../../JSON/emojis.json'),
    Raspadinha = require('./classes/raspadinha')

module.exports = {
    name: 'raspadinha',
    aliases: ['rasp', 'rp', 'raspa', 'raspadinhas'],
    category: 'economy',
    emoji: `${e.raspadinha}`,
    usage: '<raspadinha>',
    description: 'Jogue na raspadinha e tente a sorte grande!',

    execute: async (client, message, args, prefix, MessageEmbed, Database) => {
        
        return new Raspadinha().start(client, message, args, prefix, MessageEmbed, Database)
    }
}