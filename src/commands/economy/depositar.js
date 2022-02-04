const { e } = require('../../../database/emojis.json')
const Moeda = require('../../../Routes/functions/moeda')

module.exports = {
    name: 'depositar',
    aliases: ['dep', 'with', 'withdraw'],
    category: 'economy',
    emoji: `${e.Coin}`,
    usage: '<dep> [quantia] | <dep> [all]',
    description: 'Deposite dinheiro no banco',

    run: async (client, message, args, prefix, db, MessageEmbed, request, sdb) => {

        let reg = /^\d+$/,
            money = sdb.get(`Users.${message.author.id}.Balance`) || 0,
            Amount

        if (!args[0]) return message.reply(`${e.Deny} | Tenta assim...\n\`${prefix}dep [quantia]/[all]\``)
        if (args[1]) return message.reply(`${e.Deny} | Apenas a quantia que você deseja depositar, tudo bem?`)
        if (['all', 'tudo'].includes(args[0]?.toLowerCase())) return Dep(sdb.get(`Users.${message.author.id}.Balance`) || 0)
        Amount = args[0]?.replace(/k/g, '000')
        if (!reg.test(Amount)) return message.reply(`${e.Deny} | Nada de tentar quebrar o sistema com pontos e virgulas, tudo bem?`)
        return Dep(Amount)

        function Dep(Amount) {
            
            if (!Amount || Amount <= 0) return message.reply(`${e.Deny} | Você não tem nada para depositar.`)
            if (isNaN(Amount)) return message.reply(`${e.Deny} | **${Amount}** | O valor que você digitou não é um número ou é menor que 1.`)
            if (money <= 0 || money < Amount) return message.reply(`${e.Deny} | Você não tem **${Amount} ${Moeda(message)}** para depositar.`)

            sdb.add(`Users.${message.author.id}.Bank`, parseInt(Amount))
            sdb.subtract(`Users.${message.author.id}.Balance`, parseInt(Amount))
            return message.reply(`${e.Check} | ${message.author} depositou ${parseInt(Amount)} ${Moeda(message)}`)
        }
    }
}
