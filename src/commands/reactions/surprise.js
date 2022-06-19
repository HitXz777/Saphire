const { e } = require('../../../JSON/emojis.json')

module.exports = {
  name: 'surprise',
  aliases: ['surprisa', 'supreso', 'wow', 'que', 'what', '?', 'comoassim', 'comassim'],
  category: 'reactions',
  ClientPermissions: ['EMBED_LINKS'],
  emoji: `${e.SaphireComoAssim}`,
  usage: '/reaction',
  description: 'Não acredito :o',

  execute: async (client, message, args, prefix, MessageEmbed, Database) => {
    return message.reply(`${e.Info} | Este comando foi movido para Slash Command e será excluído em breve. Use \`/reaction\``)
  }
}
