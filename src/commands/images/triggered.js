const { e } = require('../../../JSON/emojis.json')

module.exports = {
    name: 'triggered',
    aliases: ['trigger', 'trig'],
    category: 'images',
    ClientPermissions: ['ATTACH_FILES'],
    emoji: `${e.Trig}`,
    usage: '/image',
    description: 'Triggeeeeered!',

    execute: async (client, message, args, prefix, MessageEmbed, Database) => {
        return message.reply(`${e.Info} | Este comando foi movido para Slash Command e será excluído em breve. Use \`/image\``)
    }
}