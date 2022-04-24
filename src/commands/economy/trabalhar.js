const { e } = require('../../../JSON/emojis.json'),
    Moeda = require('../../../modules/functions/public/moeda'),
    Vip = require('../../../modules/functions/public/vip')

module.exports = {
    name: 'trabalhar',
    aliases: ['work'],
    category: 'economy',
    emoji: `${e.Coin}`,
    usage: '<trabalhar>',
    description: 'Trabalhe e ganhe uma quantia em dinheiro',

    run: async (client, message, args, prefix, MessageEmbed, Database) => {

        let vip = await Vip(`${message.author.id}`),
            moeda = await Moeda(message),
            data = await Database.User.findOne({ id: message.author.id }, 'Timeouts.Work Perfil.Trabalho'),
            job = data?.Perfil?.Trabalho

        if (client.Timeout(66400000, data.Timeouts?.Work))
            return message.reply(`${e.Deny} | Você já trabalhou hoje, descance um pouco! Volte em \`${client.GetTimeout(66400000, data.Timeouts?.Work)}\``)

        let result = Math.floor(Math.random() * 10) === 1,
            gorjeta = parseInt([Math.floor(Math.random() * 50)]),
            work = parseInt([Math.floor(Math.random() * 100)]),
            xp = parseInt([Math.floor(Math.random() * 200) + 1]),
            gorjetaAdded = '',
            total = 0,
            hasVip = vip ? `Bônus ${e.VipStar} | ` : `${e.Check} | `

        if (work <= 10) work = 40

        Database.SetTimeout(message.author.id, 'Timeouts.Work')

        if (vip) {
            gorjeta += parseInt(gorjeta * 0.50)
            total += gorjeta
            work += parseInt(work * 0.40)
            xp += parseInt(work * 0.60)
        }

        total += work

        if (result) {
            Database.add(message.author.id, gorjeta)
            gorjetaAdded = ` + uma gorjeta de ${gorjeta} ${moeda}`
        }

        Database.add(message.author.id, work)
        Database.addItem(message.author.id, 'Xp', xp)

        if (total > 0) {

            Database.PushTransaction(
                message.author.id,
                `${e.gain} Recebeu ${total} Safiras trabalhando`
            )
        }

        return message.reply(`${hasVip}Você trabalhou ${job ? `como **${job}**` : ''} e ganhou ${work} ${moeda} e ${xp} ${e.RedStar}XP${gorjetaAdded}\n${vip ? '' : `${e.SaphireObs} | Sabia que Vips ganham bônus? \`${prefix}vip\``}`)

    }
}