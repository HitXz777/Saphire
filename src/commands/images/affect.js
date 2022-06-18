const { e } = require('../../../JSON/emojis.json')

module.exports = {
  name: 'affect',
  aliases: ['afeta'],
  category: 'images',
  ClientPermissions: ['ATTACH_FILES'],
  emoji: '🤰',
  usage: '/image',
  description: 'Isso não afeta o bebê',

  execute: async (client, message, args, prefix, MessageEmbed, Database) => {
    return message.reply(`${e.Info} | Este comando foi movido para Slash Command. Use \`/image\``)
  }
}