const { e } = require('../../../JSON/emojis.json')

module.exports = {
    name: 'lembrar',
    aliases: ['lembrete', 'remind', 'reminder', 'lt', 'rm', 'remember'],
    category: 'util',
    ClientPermissions: ['MANAGE_CHANNELS', 'MANAGE_MESSAGES', 'ADD_REACTIONS'],
    emoji: e.ReminderBook,
    usage: '/lembrete',
    description: 'Defina lembrete que eu te aviso no tempo definido',

    execute: async (client, message, args, prefix, MessageEmbed, Database) => {
        return message.reply(`${e.Info} | Este comando foi movido para Slash Command e será excluído em breve. Use \`/lembrete\``)
    }
}