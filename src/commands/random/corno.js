const { e } = require('../../../JSON/emojis.json')

module.exports = {
    name: 'corno',
    category: 'random',
    emoji: '🦌',
    usage: '/medidor',
    description: 'Quanto % @user é corno(a)?',

    execute: async (client, message, args, prefix, MessageEmbed, Database) => {
        return message.reply(`${e.Info} | Este comando foi movido para Slash Command e será excluído em breve. Use \`/medidor\``)
    }
}