const { e } = require('../../../JSON/emojis.json')

module.exports = {
    name: 'pig',
    aliases: ['porco'],
    category: 'economy',
    ClientPermissions: ['ADD_REACTIONS'],
    emoji: `${e.Pig}`,
    usage: '/pig',
    description: 'Tente obter toda a grana do porquinho',

    execute: async (client, message, args, prefix, MessageEmbed, Database) => {
        return message.reply(`${e.Info} | Este comando foi movido para Slash Command e será excluído em breve. Use \`/pig\``)
      }
}