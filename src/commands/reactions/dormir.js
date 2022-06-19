const { e } = require('../../../JSON/emojis.json')

module.exports = {
  name: 'dormir',
  aliases: ['sleep', 'sono'],
  category: 'reactions',
  ClientPermissions: ['EMBED_LINKS'],
  emoji: '💤',
  usage: '/reaction',
  description: 'Dormir é tão booom',

  execute: async (client, message, args, prefix, MessageEmbed, Database) => {
    return message.reply(`${e.Info} | Este comando foi movido para Slash Command e será excluído em breve. Use \`/reaction\``)
  }
}