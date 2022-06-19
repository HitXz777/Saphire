const { e } = require('../../../JSON/emojis.json')

module.exports = {
    name: 'delete',
    aliases: ['del', 'remove', 'remover'],
    usage: '/admin',
    emoji: `${e.OwnerCrow}`,
    admin: true,
    category: 'owner',
    description: 'Permite meu criador deletar qualquer coisa de qualquer lugar dentro do meu sistema',

    execute: async (client, message, args, prefix, MessageEmbed, Database) => {
        return message.reply(`${e.Info} | Este comando foi movido para Slash Command e será excluído em breve. Use \`/admin\``)
    }
}