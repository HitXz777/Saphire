const { e } = require('../../../JSON/emojis.json')

module.exports = {
    name: 'lutar',
    aliases: ['fight', 'brigar', 'briga', 'luta'],
    category: 'interactions',
    ClientPermissions: ['EMBED_LINKS', 'ADD_REACTIONS'],
    emoji: 'vs',
    usage: '/interaction',
    description: 'Treta, treta',

    execute: async (client, message, args, prefix, MessageEmbed, Database) => {
        return message.reply(`${e.Info} | Este comando foi movido para Slash Command e será excluído em breve. Use \`/interaction\``)
    }
}