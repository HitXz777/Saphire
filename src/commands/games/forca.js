const Forca = require('./classes/forca')

module.exports = {
    name: 'forca',
    aliases: ['hangman'],
    category: 'games',
    ClientPermissions: ['MANAGE_MESSAGES'],
    emoji: '😵',
    usage: '<forca> <info>',
    description: 'Joguinho clássico da forca',

    execute: async (client, message, args, prefix, MessageEmbed, Database) => {

        return new Forca().game(client, message, args, prefix, MessageEmbed, Database, false, message.author, message.channel)

    }
}