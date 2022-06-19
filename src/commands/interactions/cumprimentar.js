const { e } = require('../../../JSON/emojis.json')

module.exports = {
  name: 'cumprimentar',
  aliases: ['bv', 'bemvindo', 'bemvinda', 'bem-vindo', 'bem-vinda', 'welcome', 'saudar', 'acenar', 'oi'],
  category: 'interactions',
  ClientPermissions: ['EMBED_LINKS', 'ADD_REACTIONS'],
  emoji: '👋',
  usage: '/interaction',
  description: 'Cumprimente alguém',

  execute: async (client, message, args, prefix, MessageEmbed, Database) => {
    return message.reply(`${e.Info} | Este comando foi movido para Slash Command e será excluído em breve. Use \`/interaction\``)
  }
}