const { e } = require('../../../JSON/emojis.json')

module.exports = {
    name: 'carta',
    aliases: ['letter', 'cartas'],
    category: 'interactions',
    emoji: '📨',
    usage: '/carta',
    description: 'Envie cartas para as pessoas',

    execute: async (client, message, args, prefix, MessageEmbed, Database) => {
        return message.reply(`${e.Info} | Este comando foi movido para Slash Command e será excluído em breve. Use \`/carta\``)
    }
}