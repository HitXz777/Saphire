const { DatabaseObj: { e } } = require('../../../modules/functions/plugins/database'),
    Data = require('../../../modules/functions/plugins/data')

module.exports = {
    name: 'resgatar',
    aliases: ['resgate'],
    category: 'economy',
    emoji: `${e.MoneyWings}`,
    usage: '<resgatar>',
    description: 'Resgate seu dinheiro em cache',

    execute: async (client, message, args, prefix, MessageEmbed, Database) => {

        let data = await Database.Client.findOne({ id: client.user.id }, 'VipCodes'),
            codes = data?.VipCodes

        if (!codes || codes.length === 0) return message.reply(`${e.Deny} | Não há nenhum código vip em aberto no momento.`)

        let userData = await Database.User.findOne({ id: message.author.id }, 'Vip'),
            vipData = userData?.Vip,
            TimeRemaing = vipData?.TimeRemaing || 0,
            DateNow = vipData?.DateNow || Date.now(),
            Permanent = vipData?.Permanent,
            Code = args[0]

        if (Permanent)
            return message.reply(`${e.Info} | Você não pode resgatar códigos vip pois o seu é permanente.`)

        let codeData = codes.find(dt => dt.code === Code)

        if (!Code || !codeData)
            return message.reply(`${e.Deny} | Código vip inexistente.`)

        if (codeData.time === 1) {

            await Database.User.updateOne(
                { id: message.author.id },
                { 'Vip.Permanent': true }
            )

            removeVipCode(Code)

            return message.reply(`${e.Check} | Você resgatou um código vip permanente!`)
        }

        let Time = Data(TimeRemaing += codeData.time)

        await Database.User.updateOne(
            { id: message.author.id },
            {
                Vip: {
                    DateNow: DateNow,
                    TimeRemaing: TimeRemaing += codeData.time
                }
            },
            { upsert: true }
        )

        removeVipCode(Code)
        return message.channel.send(`${e.Check} | ${message.author}, o código foi resgatado com sucesso! Seu vip acaba em \`${Time}\`\n${e.Info} | Para ver o tempo restante, use o comando \`${prefix}cooldown (${prefix}cd)\``)

        async function removeVipCode(code) {

            await Database.Client.updateOne(
                { id: client.user.id },
                {
                    $pull: {
                        VipCodes: {
                            code: code
                        }
                    }
                }
            )
            return
        }

    }
}