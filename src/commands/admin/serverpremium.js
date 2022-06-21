const { e } = require('../../../JSON/emojis.json')

module.exports = {
    name: 'serverpremium',
    aliases: ['addpremium', 'spremium', 'premiumserver'],
    category: 'admin',
    admin: true,
    emoji: e.Admin,
    usage: '/admin',
    description: 'Comando de ativação de servidores premium',

    execute: async (client, message, args, prefix, MessageEmbed, Database) => {
        return message.reply(`${e.Info} | Este comando foi movido para Slash Command e será excluído em breve. Use \`/admin\``)
    }
}