const { e } = require('../../../JSON/emojis.json')

module.exports = {
        name: 'beauty',
        aliases: ['beaut'],
        category: 'images',
        ClientPermissions: ['EMBED_LINKS', 'ATTACH_FILES'],
        emoji: '📷',
        usage: '/image',
        description: 'Simplesmente bonito/a',

        execute: async (client, message, args, prefix, MessageEmbed, Database) => {
                return message.reply(`${e.Info} | Este comando foi movido para Slash Command e será excluído em breve. Use \`/image\``)
        }
}