const
    { e } = require('../../../JSON/emojis.json')

module.exports = {
    name: 'afk',
    aliases: ['off', 'offline'],
    category: 'afksystem',
    ClientPermissions: ['ADD_REACTIONS'],
    emoji: `${e.Afk}`,
    usage: '/afk',
    description: 'Com este comando, eu aviso pra todos que chamarem você que você está offline',

    execute: async (client, message, args, prefix, MessageEmbed, Database) => {
        return message.reply(`${e.Info} | Este comando foi movido para Slash Command e será excluído em breve. Use \`/afk\``)
    }
}