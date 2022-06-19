const { e } = require('../../../JSON/emojis.json')

module.exports = {
    name: 'shrug',
    aliases: ['fazeroq', 'ombros'],
    category: 'reactions',
    ClientPermissions: ['EMBED_LINKS'],
    emoji: '😮‍💨',
    usage: '/reaction',
    description: 'Fazer um biquinho fofo',

    execute: async (client, message, args, prefix, MessageEmbed, Database) => {
        return message.reply(`${e.Info} | Este comando foi movido para Slash Command e será excluído em breve. Use \`/reaction\``)
      }
}