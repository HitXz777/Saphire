const { e } = require('../../../JSON/emojis.json')

module.exports = {
  name: 'birra',
  aliases: ['aff', 'bico', 'drama'],
  category: 'reactions',
  ClientPermissions: ['EMBED_LINKS'],
  emoji: '😑',
  usage: '/reaction',
  description: 'Draminha padrão de cada dia',

  execute: async (client, message, args, prefix, MessageEmbed, Database) => {
    return message.reply(`${e.Info} | Este comando foi movido para Slash Command e será excluído em breve. Use \`/reaction\``)
  }
}