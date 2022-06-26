const { e } = require('../../../JSON/emojis.json')

module.exports = {
    name: 'phub',
    aliases: ['pornhub', 'porn-hub'],
    category: 'images',
    ClientPermissions: ['ATTACH_FILES', 'MANAGE_MESSAGES'],
    emoji: '🔞',
    usage: '/phub',
    description: 'Recomendo não usar',

    execute: async (client, message, args, prefix, MessageEmbed, Database) => {
        return message.reply(`${e.Info} | Este comando foi movido para Slash Command e será excluído em breve. Use \`/phub\``)
    }
}