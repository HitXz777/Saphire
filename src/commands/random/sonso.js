const { e } = require('../../../JSON/emojis.json')

module.exports = {
    name: 'sonso',
    aliases: ['sonsa'],
    category: 'random',
    emoji: '😏',
    usage: '/medidor',
    description: 'Quantos % @user é sonso(a)?',

    execute: async (client, message, args, prefix, MessageEmbed, Database) => {
        return message.reply(`${e.Info} | Este comando foi movido para Slash Command e será excluído em breve. Use \`/medidor\``)
    }
}