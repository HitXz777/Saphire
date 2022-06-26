const { e } = require('../../../JSON/emojis.json')

module.exports = {
    name: 'setnickname',
    aliases: ['nickname', 'setnick', 'nick', 'nome'],
    category: 'moderation',
    UserPermissions: ['CHANGE_NICKNAME'],
    ClientPermissions: ['MANAGE_NICKNAMES'],
    emoji: `${e.ModShield}`,
    usage: '/setnickname',
    description: 'Mude o seu nome ou os dos usuários se tiver cargo',

    execute: async (client, message, args, prefix, MessageEmbed, Database) => {
        return message.reply(`${e.Info} | Este comando foi movido para Slash Command e será excluído em breve. Use \`/setnickname\``)
    }
}