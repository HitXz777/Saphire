const { e } = require('../../../JSON/emojis.json')

module.exports = {
    name: 'forca',
    aliases: ['hangman'],
    category: 'games',
    ClientPermissions: ['MANAGE_MESSAGES'],
    emoji: '😵',
    usage: '/forca',
    description: 'Movido para Slash Command',

    execute: async (client, message, args, prefix, MessageEmbed, Database) => {
        return message.reply(`${e.Info} | Este comando foi movido para Slash Command e será excluído em breve. Use \`/forca\``)
    }
}