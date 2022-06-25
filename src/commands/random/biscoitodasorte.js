const { e } = require('../../../JSON/emojis.json')

module.exports = {
    name: 'biscoitodasorte',
    aliases: ['biscoito'],
    category: 'random',
    emoji: '🥠',
    usage: '/biscoitodasorte',
    description: 'Quer tentar a sorte hoje?',

    execute: async (client, message, args, prefix, MessageEmbed, Database) => {
        return message.reply(`${e.Info} | Este comando foi movido para Slash Command e será excluído em breve. Use \`/biscoitodasorte\``)
    }
}