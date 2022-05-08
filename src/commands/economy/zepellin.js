const { e } = require('../../../JSON/emojis.json'),
    Moeda = require('../../../modules/functions/public/moeda')

module.exports = {
    name: 'zepellin',
    aliases: ['zep'],
    category: 'economy',
    emoji: `${e.MoneyWings}`,
    usage: 'zepellin <info>',
    description: 'Um jogo de aposta na base da sorte.',

    run: async (client, message, args, prefix, MessageEmbed, Database) => {

        if (!args[0] || ['info', 'help', 'ajuda'].includes(args[0]?.toLowerCase())) return zepellinInfo()

        let requestValue = args[0],
            dataRequire = await Database.User.findOne({ id: message.author.id }, 'Balance')

        if (!dataRequire) return message.reply(`${e.Warn} | Houve um problema ao encontrar seus dados na minha database. Por favor, tente de novo.`)

        if (['all', 'tudo'].includes(args[0].toLowerCase())) requestValue = dataRequire?.Balance || 0

        let value = parseInt(requestValue)?.toFixed(0),
            moeda = await Moeda(message),
            money = dataRequire?.Balance || 0,
            ballon = '🎈',
            boom = '💥',
            dotSequence = '',
            valueMultiplication = 0.0,
            retired = false,
            button = [
                {
                    type: 1,
                    components: [
                        {
                            type: 2,
                            label: 'Retirar',
                            custom_id: 'retire',
                            style: 'DANGER',
                            disabled: true,
                        }
                    ],
                },
            ]

        if (!value || isNaN(value))
            return message.reply(`${e.Deny} | Diga um valor válido para apostar no zepellin. Lembrando que deve ser um número válido e que você possua na carteira. Você pode consultar quanto você tem utilizando \`${prefix}balance\`.`)

        if (!money || money <= 0)
            return message.reply(`${e.Deny} | Você não possui dinheiro algúm.`)

        if (value < 1)
            return message.reply(`${e.Deny} | O valor minímo de aposta é de 1 ${moeda}.`)

        if (value > money)
            return message.reply(`${e.Deny} | Você não possui todo esse dinheiro.`)

        return confirmBet()

        function zepellinInfo() {
            return message.reply({
                embeds: [
                    new MessageEmbed()
                        .setColor(client.blue)
                        .setTitle(`${e.MoneyWings} Jogue a aposte na base dos números`)
                        .setDescription(`Você aposta uma quantia de Safiras e cancela a aposta antes que o balão estoure.`)
                        .addFields(
                            {
                                name: `${e.QuestionMark} Como funciona?`,
                                value: 'O balão vai andando e andando e o número vai aumentando. Se ele estourar, você perde. Se você cancelar antes dele estourar, você ganha o valor da sua aposta vezes o número em que você cancelou.'
                            }
                        )
                        .setFooter({ text: `${client.user.username}'s Bet Games` })
                ]
            })
        }

        async function confirmBet() {

            let msg = await message.reply({ content: `${e.QuestionMark} | Você tem certeza que deseja apostar "${value} ${moeda}" no zepellin?` }),
                emojis = ['✅', '❌']

            for (const emoji of emojis) msg.react(emoji).catch(() => { })

            const collector = msg.createReactionCollector({
                filter: (reaction, user) => emojis.includes(reaction.emoji.name) && user.id === message.author.id,
                time: 30000,
                errors: ['time']
            })
                .on('collect', (reaction) => {

                    if (reaction.emoji.name === emojis[0]) {
                        msg.delete()

                        Database.subtract(message.author.id, value)
                        return startZepellin()
                    }

                    return collector.stop()
                })
                .on('end', () => msg.edit(`${e.Deny} | Comando cancelado.`).catch(() => { }))

        }

        async function startZepellin() {

            let resultToTimeout = [10000, 6000, 15000, 20000, 30000, 40000, 25000, 50000, 60000, 45000, 70000, 80000, 90000, 75000, 85000, 95000, 100000, 110000, 120000][Math.floor(Math.random() * 4)],
                timeResult = Math.floor(Math.random() * resultToTimeout) + 1700

            let msg = await message.reply({
                content: `${valueMultiplication} | ${dotSequence}${ballon}`,
                components: button
            })

            const collector = msg.createMessageComponentCollector({
                filter: (int) => int.user.id === message.author.id,
                time: 60000,
                max: 1,
                errors: ['time', 'max']
            })

            let interval = setInterval(() => {
                addDot(msg)
                msg.edit({ content: `${valueMultiplication?.toFixed(1)} | ${dotSequence}${ballon}` }).catch(() => { })
            }, 1700)

            collector.on('collect', interaction => {
                interaction.deferUpdate().catch(() => { })

                retired = true
                msg.edit({ components: [] }).catch(() => { })
                return win()
            })

            setTimeout(() => {
                collector.stop()
                clearInterval(interval)
                explode(msg)
            }, timeResult)
        }

        function explode(msg) {
            msg.edit({
                content: `${valueMultiplication?.toFixed(1)} | ${dotSequence}${boom}`,
                components: []
            }).catch(() => { })

            if (!retired) {
                Database.PushTransaction(
                    message.author.id,
                    `${e.loss} Perdeu ${value} Safiras jogando *Zepellin*`
                )
                return message.channel.send(`${e.Deny} | Não foi dessa vez ${message.author}. O balão explodiu e você perdeu o dinheiro apostado`)
            }

            return
        }

        function win() {

            let moneyResult = value * valueMultiplication?.toFixed(1)
            Database.add(message.author.id, moneyResult?.toFixed(0))
            Database.PushTransaction(
                message.author.id,
                `${e.gain} Ganhou ${moneyResult?.toFixed(0)} Safiras jogando *Zepellin*`
            )
            return message.channel.send(`${e.Check} | Parabéns ${message.author}! Você ganhou um montante de ${moneyResult?.toFixed(0)} ${moeda} retirando a aposta em ${valueMultiplication?.toFixed(1)}. Lembrando que o resultado é o valor da aposta vezes o número do zepellin.`)
        }

        function addDot(msg) {

            let getValueFromArray = Math.floor(Math.random() * 5)

            let addPointsToValue = [0.1, 0.4, 0.3, 0.2, 0.7, 0.1]
            valueMultiplication = valueMultiplication + addPointsToValue[getValueFromArray]

            let addValue = ['.', '..', '...', '....', '.....', '.'][getValueFromArray]
            dotSequence = `${dotSequence}${addValue}`

            if (valueMultiplication >= 2 && button[0].components[0].disabled) {
                button[0].components[0].disabled = false
                msg.edit({ components: button }).catch(() => { })
            }

            return
        }

    }
}