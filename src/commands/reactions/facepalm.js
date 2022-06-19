const { e } = require('../../../JSON/emojis.json')

module.exports = {
  name: 'facepalm',
  aliases: ['puts'],
  category: 'reactions',
  ClientPermissions: ['EMBED_LINKS'],
  emoji: '🤦‍♂️',
  usage: '/reaction',
  description: 'Puts...',

  execute: async (client, message, args, prefix, MessageEmbed, Database) => {
    return message.reply(`${e.Info} | Este comando foi movido para Slash Command e será excluído em breve. Use \`/reaction\``)
  }
}