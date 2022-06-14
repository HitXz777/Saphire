const { e } = require('../../../JSON/emojis.json')

module.exports = {
    name: 'giveaway',
    aliases: ['sorteio', 'gw'],
    category: 'moderation',
    emoji: `${e.Tada}`,
    usage: '/giveaway',
    description: 'Fazer sorteios é divertido, né?',

    execute: async (client, message, args, prefix, MessageEmbed, Database) => {
        return message.reply(`${e.Info} | Este comando foi movido para Slash Command. Use \`/giveaway\``)
    }
}