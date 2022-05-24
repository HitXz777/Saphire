let flagGame = require('./classes/flagGame')

module.exports = {
    name: 'bandeiras',
    aliases: ['flag', 'flags', 'bandeira', 'band', 'bands'],
    category: 'games',
    emoji: '🎌',
    usage: '<bandeiras> <info>',
    description: 'Adivinhe o país das bandeiras',

    execute: async (client, message, args, prefix, MessageEmbed, Database) => {

        return new flagGame().init(client, message, args, prefix, MessageEmbed, Database)

    }
}