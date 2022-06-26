const { e } = require('../../../JSON/emojis.json')

module.exports = {
    name: 'say',
    aliases: ['dizer', 'falar', 'enviar'],
    category: 'moderation',
    emoji: '🗣️',
    usage: '/say',
    description: 'Diga algo no chat atráves de mim',

    execute: async (client, message, args, prefix, MessageEmbed, Database) => {
        return message.reply(`${e.Info} | Este comando foi movido para Slash Command e será excluído em breve. Use \`/say\``)
    }
}