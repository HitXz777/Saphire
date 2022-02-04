const { e } = require('../../../database/emojis.json')
const Moeda = require('../../../Routes/functions/moeda')

module.exports = {
    name: 'sacar',
    aliases: ['sc', 'saque', 'saq', 'sac'],
    category: 'economy',
    emoji: `${e.Coin}`,
    usage: '<saq> [quantia] | <sac> [all]',
    description: 'Saque dinheiro no banco',

    run: async (client, message, args, prefix, db, MessageEmbed, request, sdb) => {

        let money = sdb.get(`Users.${message.author.id}.Bank`) || 0

        if (!args[0]) return message.reply(`${e.Deny} | Tenta assim...\n\`${prefix}sacar [quantia]/[all]\` ou \`${prefix}sacar 1k / 1kk (milhar, milhão)\``)
        if (args[1]) return message.reply(`${e.Deny} | Apenas a quantidade que você deseja sacar.`)

        let quantia = parseInt(args[0].replace(/k/g, '000'))
        if (['all', 'tudo'].includes(args[0]?.toLowerCase()) || quantia >= money) quantia = money
        if (money <= 0 || money < quantia) return message.reply(`${e.Deny} | Você não possui dinheiro para saque.`)
        if (quantia <= 0 || isNaN(quantia)) return message.reply(`${e.Deny} | O valor que você digitou não é um número ou é menor que 1.`)

        sdb.add(`Users.${message.author.id}.Balance`, quantia)
        sdb.subtract(`Users.${message.author.id}.Bank`, quantia)
        return message.reply(`${e.Check} | ${message.author} sacou ${quantia} ${Moeda(message)}`)
    }
}