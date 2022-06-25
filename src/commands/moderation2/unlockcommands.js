const { e } = require('../../../JSON/emojis.json')

module.exports = {
    name: 'unlockcommands',
    aliases: ['unblockcommands'],
    category: 'moderation',
    UserPermissions: ['MANAGE_CHANNELS'],
    ClientPermissions: ['ADD_REACTIONS'],
    emoji: '🔓',
    usage: '/unlockcommands',
    description: 'Destranque meus comandos em canais que foram bloqueados.',

    execute: async (client, message, args, prefix, MessageEmbed, Database) => {
        return message.reply(`${e.Info} | Este comando foi movido para Slash Command e será excluído em breve. Use \`/unlockcommands\``)
    }
}