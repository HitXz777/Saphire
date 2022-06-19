const { e } = require('../../../JSON/emojis.json')

module.exports = {
    name: 'autorole',
    category: 'config',
    emoji: `${e.Verify}`,
    usage: '/autorole',
    description: 'Selecione um cargo para todos que entrem no servidor.',

    execute: async (client, message, args, prefix, MessageEmbed, Database) => {
        return message.reply(`${e.Info} | Este comando foi movido para Slash Command e será excluído em breve. Use \`/autorole\``)
    }
}