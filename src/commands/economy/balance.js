const { e } = require('../../../JSON/emojis.json')

module.exports = {
    name: 'balance',
    aliases: ['b', 'bal', 'money', 'banco', 'dinheiro', 'conta', 'saldo', 'coins', 'coin', 'atm', 'carteira', 'bank'],
    category: 'economy',
    emoji: `${e.Coin}`,
    ClientPermissions: ['ADD_REACTIONS'],
    usage: '/balance',
    description: 'Confira as finanças',

    execute: async (client, message, args, prefix, MessageEmbed, Database) => {
        return message.reply(`${e.Info} | Este comando foi movido para Slash Command e será excluído em breve. Use \`/balance\``)
    }
}