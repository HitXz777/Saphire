const { e } = require('../../../JSON/emojis.json')

module.exports = {
    name: 'mod',
    aliases: ['moderador', 'moderadores'],
    category: 'admin',
    admin: true,
    emoji: e.Admin,
    usage: '/admin',
    description: 'Adiciona ou remove moderadores da Saphire\'s Team',

    execute: async (client, message, args, prefix, MessageEmbed, Database) => {
        return message.reply(`${e.Info} | Este comando foi movido para Slash Command e será excluído em breve. Use \`/admin\``)
    }
}