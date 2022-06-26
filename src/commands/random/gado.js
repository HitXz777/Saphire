const { e } = require('../../../JSON/emojis.json')

module.exports = {
    name: 'gado',
    aliases: ['boi'],
    category: 'random',
    emoji: '🐂',
    usage: '/medidor',
    description: 'Quanto % @user é gado(a)?',

    execute: async (client, message, args, prefix, MessageEmbed, Database) => {
        return message.reply(`${e.Info} | Este comando foi movido para Slash Command e será excluído em breve. Use \`/medidor\``)
    }
}