const { e } = require('../../../JSON/emojis.json')

module.exports = {
    name: 'search',
    aliases: ['pesquisa', 'pesquisar'],
    category: 'bot',
    emoji: '🔍',
    usage: '/search',
    description: 'Pesquise por comandos',

    execute: async (client, message, args, prefix, MessageEmbed, Database) => {
        return message.reply(`${e.Info} | Este comando foi movido para Slash Command e será excluído em breve. Use \`/search\``)
    }
}