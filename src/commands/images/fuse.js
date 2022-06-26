const { e } = require('../../../JSON/emojis.json')

module.exports = {
    name: 'fuse',
    aliases: ['fundir'],
    category: 'images',
    ClientPermissions: ['ATTACH_FILES'],
    emoji: 'F',
    usage: '/image',
    description: 'Fusão entre duas imagens',

    execute: async (client, message, args, prefix, MessageEmbed, Database) => {
        return message.reply(`${e.Info} | Este comando foi movido para Slash Command e será excluído em breve. Use \`/image\``)
    }
}