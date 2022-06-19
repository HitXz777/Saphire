const { e } = require('../../../JSON/emojis.json')

module.exports = {
  name: 'furia',
  aliases: ['raiva', 'ódio', 'rage'],
  category: 'reactions',
  ClientPermissions: ['EMBED_LINKS'],
  emoji: '😡',
  usage: '/reaction',
  description: 'Haaaaaaaaa',

  execute: async (client, message, args, prefix, MessageEmbed, Database) => {
    return message.reply(`${e.Info} | Este comando foi movido para Slash Command e será excluído em breve. Use \`/reaction\``)
  }
}