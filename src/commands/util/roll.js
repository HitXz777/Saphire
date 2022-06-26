const { e } = require('../../../JSON/emojis.json')

module.exports = {
    name: 'roll',
    aliases: ['dado', 'rolls'],
    category: 'util',
    emoji: '🎲',
    usage: '/dice',
    description: 'Role os dados e tente a sorte',

    execute: async (client, message, args, prefix, MessageEmbed, Database) => {
        return message.reply(`${e.Info} | Este comando foi movido para Slash Command e será excluído em breve. Use \`/dice\``)
    }
}