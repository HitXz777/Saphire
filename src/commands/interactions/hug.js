const { e } = require('../../../JSON/emojis.json')

module.exports = {
  name: 'hug',
  aliases: ['abraçar', 'abraço'],
  category: 'interactions',
  ClientPermissions: ['EMBED_LINKS', 'ADD_REACTIONS'],
  emoji: '🫂',
  usage: '/interaction',
  description: 'Abraçar é tããão bom',

  execute: async (client, message, args, prefix, MessageEmbed, Database) => {
    return message.reply(`${e.Info} | Este comando foi movido para Slash Command e será excluído em breve. Use \`/interaction\``)
  }
}