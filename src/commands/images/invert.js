const { e } = require('../../../JSON/emojis.json')

module.exports = {
    name: 'invert',
    aliases: ['inverte'],
    category: 'images',
    ClientPermissions: ['ATTACH_FILES'],
    emoji: '🔃',
    usage: '/image',
    description: 'Inverta as cores da foto',

    execute: async (client, message, args, prefix, MessageEmbed, Database) => {
        return message.reply(`${e.Info} | Este comando foi movido para Slash Command e será excluído em breve. Use \`/image\``)
    }
}