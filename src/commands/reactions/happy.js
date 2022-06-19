const { e } = require('../../../JSON/emojis.json')

module.exports = {
  name: 'feliz',
  aliases: ['happy', 'contente', 'alegre'],
  category: 'reactions',
  ClientPermissions: ['EMBED_LINKS'],
  emoji: '😄',
  usage: '/reaction',
  description: 'Tem coisa melhor do que estar feliz?',

  execute: async (client, message, args, prefix, MessageEmbed, Database) => {
    return message.reply(`${e.Info} | Este comando foi movido para Slash Command e será excluído em breve. Use \`/reaction\``)
  }
}