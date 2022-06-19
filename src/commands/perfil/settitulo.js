const { e } = require('../../../JSON/emojis.json')

module.exports = {
    name: 'settitulo',
    aliases: ['titulo', 'settitle', 'title', 'título'],
    category: 'perfil',
    ClientPermissions: ['ADD_REACTIONS'],
    emoji: '🔰',
    usage: '/editprofile',
    description: 'Escolha um título grandioso',

    execute: async (client, message, args, prefix, MessageEmbed, Database) =>  {
        return message.reply(`${e.Info} | Este comando foi movido para Slash Command e será excluído em breve. Use \`/editprofile\``)
    }
}