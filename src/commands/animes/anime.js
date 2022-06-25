const { e } = require('../../../JSON/emojis.json')

module.exports = {
    name: 'anime',
    aliases: ['searchanime', 'animes'],
    category: 'animes',
    ClientPermissions: ['EMBED_LINKS'],
    emoji: '🔍',
    usage: '/anime',
    description: 'Pesquisa de Animes',

    execute: async (client, message, args, prefix, MessageEmbed, Database) => {
        return message.reply(`${e.Info} | Este comando foi movido para Slash Command e será excluído em breve. Use \`/anime\``)
    }
}