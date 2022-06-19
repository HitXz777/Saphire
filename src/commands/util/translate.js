const { e } = require('../../../JSON/emojis.json')

module.exports = {
    name: 'translate',
    aliases: ['t', 'tradutor'],
    category: 'util',
    ClientPermissions: ['EMBED_LINKS'],
    emoji: `${e.Translate}`,
    usage: '/translate>',
    description: 'Traduza palavras e textos de qualquer língua',

    execute: async (client, message, args, prefix, MessageEmbed, Database) => {
        return message.reply(`${e.Info} | Este comando foi movido para Slash Command e será excluído em breve. Use \`/translate\``)
    }
}