const { e } = require('../../../JSON/emojis.json')

module.exports = {
    name: 'setcolor',
    aliases: ['hex', 'sethex', 'setcor'],
    category: 'perfil',
    emoji: '🎨',
    usage: '/editprofile',
    description: 'Defina a cor das suas embeds',

    execute: async (client, message, args, prefix, MessageEmbed, Database) =>  {
        return message.reply(`${e.Info} | Este comando foi movido para Slash Command e será excluído em breve. Use \`/editprofile\``)
    }
}