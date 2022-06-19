const { e } = require('../../../JSON/emojis.json')

module.exports = {
    name: 'morder',
    aliases: ['bite', 'mordida'],
    category: 'interactions',
    ClientPermissions: ['EMBED_LINKS', 'ADD_REACTIONS'],
    emoji: '😁',
    usage: '/interaction',
    description: 'Morder de jeitinho é bom',

    execute: async (client, message, args, prefix, MessageEmbed, Database) => {
        return message.reply(`${e.Info} | Este comando foi movido para Slash Command e será excluído em breve. Use \`/interaction\``)
    }
}