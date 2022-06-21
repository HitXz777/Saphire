const { e } = require('../../../JSON/emojis.json')

module.exports = {
    name: 'serverlist',
    aliases: ['listserver'],
    category: 'admin',
    ClientPermissions: ['ADD_REACTIONS'],
    admin: true,
    emoji: `${e.OwnerCrow}`,
    usage: '/admin',
    description: 'Lista de todos os servidores',

    execute: async (client, message, args, prefix, MessageEmbed, Database) => {
        return message.reply(`${e.Info} | Este comando foi movido para Slash Command e será excluído em breve. Use \`/admin\``)
      }
}