const { e } = require('../../../JSON/emojis.json')

module.exports = {
    name: 'transactions',
    aliases: ['transações', 'extrato', 'transação', 'ts'],
    category: 'economy',
    ClientPermissions: ['ADD_REACTIONS'],
    emoji: `${e.MoneyWings}`,
    usage: '/transactions',
    description: 'Veja o extrato bancário.',

    execute: async (client, message, args, prefix, MessageEmbed, Database) => {
        return message.reply(`${e.Info} | Este comando foi movido para Slash Command e será excluído em breve. Use \`/transactions\``)
      }
}