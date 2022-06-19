const { e } = require('../../../JSON/emojis.json')

module.exports = {
  name: 'shy',
  aliases: ['vergonha', 'timido', 'timida'],
  category: 'reactions',
  ClientPermissions: ['EMBED_LINKS'],
  emoji: `${e.SaphireTimida}`,
  usage: '/reaction',
  description: 'Sou tímido, sai',

  execute: async (client, message, args, prefix, MessageEmbed, Database) => {
    return message.reply(`${e.Info} | Este comando foi movido para Slash Command e será excluído em breve. Use \`/reaction\``)
  }
}
