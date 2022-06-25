const { e } = require('../../../JSON/emojis.json')

module.exports = {
    name: 'lockcommands',
    aliases: ['nocommands', 'blockcommands', 'bloquearcomandos', 'blockbots'],
    category: 'moderation',
    UserPermissions: ['MANAGE_CHANNELS'],
    ClientPermissions: ['MANAGE_MESSAGES', 'ADD_REACTIONS'],
    emoji: '🔒',
    usage: '/lockcommands',
    description: 'Tranque meus comandos em canais específicos para que não seja usados. (ADM\'s são imunes)',

    execute: async (client, message, args, prefix, MessageEmbed, Database) => {
        return message.reply(`${e.Info} | Este comando foi movido para Slash Command e será excluído em breve. Use \`/lockcommands\``)
    }
}