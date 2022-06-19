const { e } = require('../../../JSON/emojis.json')

module.exports = {
    name: 'pay',
    aliases: ['pagar', 'transferir', 'pix'],
    category: 'economy',
    ClientPermissions: ['ADD_REACTIONS'],
    emoji: `${e.MoneyWings}`,
    usage: '/interaction',
    description: 'Faça um pagamento rápido!',

    execute: async (client, message, args, prefix, MessageEmbed, Database) => {
        return message.reply(`${e.Info} | Este comando foi movido para Slash Command e será excluído em breve. Use \`/pay\``)
      }
}