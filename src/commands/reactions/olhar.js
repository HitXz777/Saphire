const { e } = require('../../../JSON/emojis.json')

module.exports = {
  name: 'olhar',
  aliases: ['olhando', 'todeolho', 'glare'],
  category: 'reactions',
  ClientPermissions: ['EMBED_LINKS'],
  emoji: '👀',
  usage: '/reaction',
  description: 'To de olho...',

  execute: async (client, message, args, prefix, MessageEmbed, Database) => {
    return message.reply(`${e.Info} | Este comando foi movido para Slash Command e será excluído em breve. Use \`/reaction\``)
  }
}