const { DatabaseObj: { e } } = require('../../../Routes/functions/database'),
    Moeda = require('../../../Routes/functions/moeda'),
    Vip = require('../../../Routes/functions/vip'),
    parsems = require('parse-ms'),
    Error = require('../../../Routes/functions/errors'),
    { PushTransaction } = require('../../../Routes/functions/transctionspush'),
    Data = require('../../../Routes/functions/data')

module.exports = {
    name: 'resgatar',
    aliases: ['resgate'],
    category: 'economy',
    emoji: `${e.MoneyWings}`,
    usage: '<resgatar>',
    description: 'Resgate seu dinheiro em cache',

    run: async (client, message, args, prefix, db, MessageEmbed, request, sdb) => {

        if (args[0]) return GiftCode()

        let cache = sdb.get(`Users.${message.author.id}.Cache.Resgate`) || 0
        if (cache <= 0) return message.reply(`${e.PandaProfit} | Você não possui dinheiro no cache.`)

        sdb.add(`Users.${message.author.id}.Balance`, cache)
        PushTransaction(
            message.author.id,
            `${e.BagMoney} Resgatou ${cache} Moedas`
        )

        sdb.delete(`Users.${message.author.id}.Cache.Resgate`)
        return message.channel.send(`${e.PandaProfit} | ${message.author} resgatou ${cache.toFixed(0)} ${Moeda(message)}`)

        function GiftCode() {

            let Code = args[0],
                TimeRemaing = sdb.get(`Users.${message.author.id}.Timeouts.Vip.TimeRemaing`) || 0,
                DateNow = sdb.get(`Users.${message.author.id}.Timeouts.Vip.DateNow`) || Date.now(),
                ClientCodeVip = sdb.get(`Client.VipCodes.${Code}`) || 0,
                Time = Data(ClientCodeVip += TimeRemaing),
                Permanent = sdb.get(`Users.${message.author.id}.Timeouts.Vip.Permanent`)

            if (Permanent)
                return message.reply(`${e.Info} | O seu vip é permanente.`)

            if (!ClientCodeVip)
                return message.reply(`${e.Deny} | Código inválido.`)

            sdb.set(`Users.${message.author.id}.Timeouts.Vip`, { DateNow: DateNow, TimeRemaing: TimeRemaing += sdb.get(`Client.VipCodes.${Code}`) })

            message.channel.send(`${e.Check} | ${message.author}, o código foi resgatado com sucesso! Seu vip acaba em \`${Time}\``)

            return sdb.delete(`Client.VipCodes.${Code}`)
        }

    }
}