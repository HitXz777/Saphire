const { e } = require('../../../JSON/emojis.json')

module.exports = {
  name: 'onegai',
  aliases: ['pf', 'porfavor', 'pls', 'implorar'],
  category: 'reactions',
  ClientPermissions: ['EMBED_LINKS'],
  emoji: '👐',
  usage: '/reaction - /interaction',
  description: 'Implorar é prova de humildade',

  execute: async (client, message, args, prefix, MessageEmbed, Database) => {
    return message.reply(`${e.Info} | Este comando foi movido para Slash Command e será excluído em breve. Use \`/reaction - /interaction\``)
  }
}