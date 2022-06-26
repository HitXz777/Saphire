const { e } = require('../../../JSON/emojis.json')

module.exports = {
    name: 'hitler',
    category: 'images',
    ClientPermissions: ['ATTACH_FILES'],
    emoji: `${e.Deny}`,
    usage: '/image',
    description: 'Pior que o Hitler',

    execute: async (client, message, args, prefix, MessageEmbed, Database) =>  {
        return message.reply(`${e.Info} | Este comando foi movido para Slash Command e será excluído em breve. Use \`/image\``)
    }
}