const { e } = require('../../../JSON/emojis.json')

module.exports = {
    name: 'wanted',
    aliases: ['procurado'],
    category: 'images',
    ClientPermissions: ['ATTACH_FILES'],
    emoji: `${e.PepePreso}`,
    usage: '/image',
    description: 'Wanted meme',

    execute: async (client, message, args, prefix, MessageEmbed, Database) => {
        return message.reply(`${e.Info} | Este comando foi movido para Slash Command e será excluído em breve. Use \`/image\``)
    }
}