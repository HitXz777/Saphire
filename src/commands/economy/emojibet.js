const { e } = require('../../../JSON/emojis.json')

module.exports = {
    name: 'emojibet',
    aliases: ['betemoji', 'emojisbet', 'betemojis'],
    category: 'economy',
    ClientPermissions: ['ADD_REACTIONS'],
    emoji: '💸',
    usage: '/emojibet',
    description: 'Aposte com emojis',

    execute: async (client, message, args, prefix, MessageEmbed, Database) => {
        return message.reply(`${e.Info} | Este comando foi movido para Slash Command e será excluído em breve. Use \`/emojibet\``)
    }
}