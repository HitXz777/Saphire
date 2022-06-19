const { e } = require('../../../JSON/emojis.json')

module.exports = {
  name: 'atirar',
  aliases: ['shoot', 'tiro'],
  category: 'interactions',
  ClientPermissions: ['EMBED_LINKS', 'ADD_REACTIONS'],
  emoji: '🔫',
  usage: '/interaction',
  description: 'Atire em alguém',

  execute: async (client, message, args, prefix, MessageEmbed, Database) => {
    return message.reply(`${e.Info} | Este comando foi movido para Slash Command e será excluído em breve. Use \`/interaction\``)
  }
}