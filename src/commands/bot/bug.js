const { DatabaseObj: { config, e } } = require('../../../modules/functions/plugins/database'),
    Error = require('../../../modules/functions/config/errors')

module.exports = {
    name: 'bug',
    aliases: ['sendbug', 'reportbug'],
    category: 'bot',
    emoji: '📨',
    usage: '/bug',
    description: 'Report bugs/erros diretamente pro meu criador',

    execute: async (client, message, args, prefix, MessageEmbed, Database) => {
        return message.reply(`${e.Info} | Este comando foi movido para Slash Command e será excluído em breve. Use \`/bug\``)
    }
}