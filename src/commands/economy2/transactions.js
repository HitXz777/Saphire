const Transactions = require('./classes/transactions'),
    { e } = require('../../../JSON/emojis.json')

module.exports = {
    name: 'transactions',
    aliases: ['transações', 'extrato', 'transação', 'ts'],
    category: 'economy',
    ClientPermissions: ['ADD_REACTIONS'],
    emoji: `${e.MoneyWings}`,
    usage: '<transactions> [@user]',
    description: 'Veja o extrato bancário.',

    execute: async (client, message, args, prefix, MessageEmbed, Database) => {

        return new Transactions().execute(client, message, args, prefix, MessageEmbed, Database)

    }
}