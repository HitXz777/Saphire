const { e } = require('../../../JSON/emojis.json')

module.exports = {
  name: 'risada',
  aliases: ['kkk', 'riso', 'rs'],
  category: 'reactions',
  ClientPermissions: ['EMBED_LINKS'],
  emoji: '😂',
  usage: '/reaction',
  description: 'Rir é o melhor remédio',

  execute: async (client, message, args, prefix, MessageEmbed, Database) => {
    return message.reply(`${e.Info} | Este comando foi movido para Slash Command e será excluído em breve. Use \`/reaction\``)
  }
}