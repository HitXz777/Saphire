const { e } = require('../../../JSON/emojis.json')

module.exports = {
    name: 'terminal',
    aliases: ['log'],
    category: 'owner',
    emoji: `${e.OwnerCrow}`,
    usage: '/admin',
    description: 'Permite meu criador olhar meu terminal',

    execute: async (client, message, args, prefix, MessageEmbed, Database) =>  {
        return message.reply(`${e.Info} | Este comando foi movido para Slash Command e será excluído em breve. Use \`/admin\``)
    }
}