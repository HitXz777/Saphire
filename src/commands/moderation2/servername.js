const { e } = require('../../../JSON/emojis.json')

module.exports = {
    name: 'servername',
    aliases: ['setservername'],
    category: 'moderation',
    emoji: `${e.ModShield}`,
    usage: '/servername',
    description: 'Mude o nome do servidor',

    execute: async (client, message, args, prefix, MessageEmbed, Database) => {
        return message.reply(`${e.Info} | Este comando foi movido para Slash Command e será excluído em breve. Use \`/say\``)
    }
}