const { e } = require('../../../JSON/emojis.json')

module.exports = {
    name: '8ball',
    aliases: ['pergunta', 'pgt'],
    category: 'random',
    emoji: '🎱',
    usage: '/8ball',
    description: 'Pergunta que eu respondo',

    execute: async (client, message, args, prefix, MessageEmbed, Database) => {
        return message.reply(`${e.Info} | Este comando foi movido para Slash Command e será excluído em breve. Use \`/8ball\``)
    }
}