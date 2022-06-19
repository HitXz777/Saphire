const { e } = require('../../../JSON/emojis.json')

module.exports = {
    name: 'nota',
    category: 'interactions',
    emoji: '🤔',
    usage: '/nota',
    description: 'Quer tal uma avaliação rápida?',

    execute: async (client, message, args, prefix, MessageEmbed, Database) =>  {
        return message.reply(`${e.Info} | Este comando foi movido para Slash Command e será excluído em breve. Use \`/nota\``)
    }
}