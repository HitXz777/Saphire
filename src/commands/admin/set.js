const { e } = require('../../../JSON/emojis.json')

module.exports = {
    name: 'set',
    aliases: ['setar'],
    category: 'admin',
    admin: true,
    emoji: e.Admin,
    usage: '/admin set',
    description: 'Permite meus administradores setar valores nos meus sistemas',

    execute: async (client, message, args, prefix, MessageEmbed, Database) => {
        return message.reply(`${e.Info} | Este comando foi movido para Slash Command e será excluído em breve. Use \`/admin set\``)
      }
}