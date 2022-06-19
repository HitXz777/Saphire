const { e } = require('../../../JSON/emojis.json')

module.exports = {
  name: 'raiva',
  aliases: ['puto', 'nervoso', 'nervosa'],
  category: 'reactions',
  ClientPermissions: ['EMBED_LINKS'],
  emoji: `${e.SaphireRaivaFogo}`,
  usage: '/reaction',
  description: 'To com raiva...',

  execute: async (client, message, args, prefix, MessageEmbed, Database) => {
    return message.reply(`${e.Info} | Este comando foi movido para Slash Command e será excluído em breve. Use \`/reaction\``)
  }
}