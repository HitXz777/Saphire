const { e } = require('../../../JSON/emojis.json')

module.exports = {
    name: 'rainbow',
    aliases: ['arco-iris'],
    category: 'images',
    ClientPermissions: ['ATTACH_FILES'],
    emoji: '🌈',
    usage: '/image',
    description: 'Rainbow meme',

    execute: async (client, message, args, prefix, MessageEmbed, Database) => {
        return message.reply(`${e.Info} | Este comando foi movido para Slash Command e será excluído em breve. Use \`/image\``)
    }
}