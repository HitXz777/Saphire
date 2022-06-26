const { e } = require('../../../JSON/emojis.json')

module.exports = {
    name: 'changemymind',
    aliases: ['cmm'],
    category: 'images',
    ClientPermissions: ['ATTACH_FILES'],
    emoji: `${e.Drinking}`,
    usage: '/changemymind',
    description: 'Change my mind meme',

    execute: async (client, message, args, prefix, MessageEmbed, Database) => {
        return message.reply(`${e.Info} | Este comando foi movido para Slash Command e será excluído em breve. Use \`/changemymind\``)
    }
}