const { e } = require('../../../JSON/emojis.json')

module.exports = {
    name: 'f',
    aliases: ['rip'],
    category: 'images',
    ClientPermissions: ['ATTACH_FILES'],
    emoji: 'F',
    usage: '/image',
    description: 'F no chat',

    execute: async (client, message, args, prefix, MessageEmbed, Database) => {
        return message.reply(`${e.Info} | Este comando foi movido para Slash Command e será excluído em breve. Use \`/image\``)
    }
}