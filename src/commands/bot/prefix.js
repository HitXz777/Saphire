const { e } = require('../../../JSON/emojis.json')

module.exports = {
    name: 'prefix',
    aliases: ['setprefix'],
    category: 'bot',
    UserPermissions: ['ADMINISTRATOR'],
    ClientPermissions: ['ADD_REACTIONS'],
    emoji: `${e.ModShield}`,
    usage: '/prefix',
    description: 'Altere o prefixo ou reset para o padrão.',

    execute: async (client, message, args, prefix, MessageEmbed, Database) => {
        return message.reply(`${e.Info} | Este comando foi movido para Slash Command e será excluído em breve. Use \`/prefix\``)
    }
}