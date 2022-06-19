const { e } = require('../../../JSON/emojis.json')

module.exports = {
    name: 'carinho',
    aliases: ['pat'],
    category: 'interactions',
    ClientPermissions: ['EMBED_LINKS', 'ADD_REACTIONS'],
    emoji: e.PatNezuko,
    usage: '/interaction',
    description: 'Huuuum',

    execute: async (client, message, args, prefix, MessageEmbed, Database) => {
        return message.reply(`${e.Info} | Este comando foi movido para Slash Command e será excluído em breve. Use \`/interaction\``)
    }
}