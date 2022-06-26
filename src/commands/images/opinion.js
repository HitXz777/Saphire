const { e } = require('../../../JSON/emojis.json')

module.exports = {
    name: 'opinion',
    aliases: ['opinião'],
    category: 'images',
    ClientPermissions: ['ATTACH_FILES'],
    emoji: '🗣️',
    usage: '/opinion',
    description: 'Opinion meme',

    execute: async (client, message, args, prefix, MessageEmbed, Database) => {
        return message.reply(`${e.Info} | Este comando foi movido para Slash Command e será excluído em breve. Use \`/opinion\``)
    }
}