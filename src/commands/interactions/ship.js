const { e } = require('../../../JSON/emojis.json')

module.exports = {
  name: 'ship',
  aliases: ['shippar', 'shipp'],
  category: 'interactions',
  ClientPermissions: ['EMBED_LINKS'],
  emoji: '💞',
  usage: '/ship',
  description: 'Veja o amor, sinta o amor',

  execute: async (client, message, args, prefix, MessageEmbed, Database) => {
    return message.reply(`${e.Info} | Este comando foi movido para Slash Command e será excluído em breve. Use \`/ship\``)
  }
}