const { e } = require('../../../JSON/emojis.json')

module.exports = {
    name: 'blur',
    aliases: ['borrar', 'desfocar'],
    category: 'images',
    ClientPermissions: ['ATTACH_FILES'],
    emoji: 'B',
    usage: '/image',
    description: 'Efeito desfocado',

    execute: async (client, message, args, prefix, MessageEmbed, Database) => {
        return message.reply(`${e.Info} | Este comando foi movido para Slash Command e será excluído em breve. Use \`/image\``)
    }
}