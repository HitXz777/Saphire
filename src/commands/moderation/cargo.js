const { e } = require('../../../JSON/emojis.json')

module.exports = {
    name: 'cargo',
    aliases: ['cargos', 'role', 'roles'],
    category: 'moderation',
    emoji: `${e.ModShield}`,
    usage: '/cargo',
    description: 'Gerencie os cargos do servidor',

    execute: async (client, message, args, prefix, MessageEmbed, Database) => {
        return message.reply(`${e.Info} | Este comando foi movido para Slash Command. Use \`/cargo\``)
    }
}