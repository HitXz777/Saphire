const { e } = require('../../../JSON/emojis.json')

module.exports = {
    name: 'gay',
    aliases: ['gai', 'guey', 'guei', 'yag'],
    category: 'random',
    emoji: '🏳️‍🌈',
    usage: '/medidor',
    description: 'Quanto % @user é gay?',

    execute: async (client, message, args, prefix, MessageEmbed, Database) => {
        return message.reply(`${e.Info} | Este comando foi movido para Slash Command e será excluído em breve. Use \`/medidor\``)
    }
}