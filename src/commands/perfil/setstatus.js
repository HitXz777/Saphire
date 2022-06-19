const { e } = require('../../../JSON/emojis.json')

module.exports = {
    name: 'setstatus',
    aliases: ['status'],
    category: 'perfil',
    emoji: '✍️',
    usage: '/editprofile',
    description: 'Defina seu status no perfil',

    execute: async (client, message, args, prefix, MessageEmbed, Database) =>  {
        return message.reply(`${e.Info} | Este comando foi movido para Slash Command e será excluído em breve. Use \`/editprofile\``)
    }
}