const { e } = require('../../../JSON/emojis.json')

module.exports = {
    name: 'burn',
    aliases: ['fire'],
    category: 'images',
    ClientPermissions: ['ATTACH_FILES'],
    emoji: '🔥',
    usage: '/editimage',
    description: 'Efeito de queimação',

    execute: async (client, message, args, prefix, MessageEmbed, Database) => {
        return message.reply(`${e.Info} | Este comando foi movido para Slash Command e será excluído em breve. Use \`/editimage\``)
    }
}