const { e } = require('../../../JSON/emojis.json')

module.exports = {
    name: 'createinvite',
    aliases: ['join'],
    category: 'owner',
    emoji: `${e.OwnerCrow}`,
    usage: '/admin',
    description: 'Permite meu criador criar um convite de qualquer servidor',

    execute: async (client, message, args, prefix, MessageEmbed, Database) => {
        return message.reply(`${e.Info} | Este comando foi movido para Slash Command e será excluído em breve. Use \`/admin\``)
      }
}