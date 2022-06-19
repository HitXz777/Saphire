const { g } = require('../../../modules/Images/gifs.json')
const { e } = require('../../../JSON/emojis.json')
const { f } = require('../../../JSON/frases.json')

module.exports = {
  name: 'tedio',
  aliases: ['chateado', 'tédio', 'entediado'],
  category: 'reactions',
  ClientPermissions: ['EMBED_LINKS'],
  emoji: '😮‍💨',
  usage: '/reaction',
  description: 'Chateadasso/a...',

  execute: async (client, message, args, prefix, MessageEmbed, Database) => {
    return message.reply(`${e.Info} | Este comando foi movido para Slash Command e será excluído em breve. Use \`/reaction\``)
  }
}