const { e } = require('../../../JSON/emojis.json')

module.exports = {
    name: 'invite',
    aliases: ['inv', 'convite', 'inininisadjidsna'],
    category: 'util',
    ClientPermissions: ['EMBED_LINKS'],
    emoji: '📨',
    usage: '/invite',
    description: 'Me convide para seu servidor',

    execute: async (client, message, args, prefix, MessageEmbed, Database) => {
        return message.reply(`${e.Info} | Este comando foi movido para Slash Command e será excluído em breve. Use \`/invite\``)
    }
}