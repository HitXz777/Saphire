const { e } = require('../../../JSON/emojis.json')

module.exports = {
  name: 'chorar',
  aliases: ['cry', 'choro', 'chorando', 'cryando', 'cry'],
  category: 'reactions',
  ClientPermissions: ['EMBED_LINKS'],
  emoji: `${e.SaphireCry}`,
  usage: '/reaction',
  description: 'Chorar as vezes faz bem',

  execute: async (client, message, args, prefix, MessageEmbed, Database) => {
    return message.reply(`${e.Info} | Este comando foi movido para Slash Command e será excluído em breve. Use \`/reaction\``)
  }
}