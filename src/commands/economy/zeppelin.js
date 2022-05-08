const { e } = require('../../../JSON/emojis.json'),
    Moeda = require('../../../modules/functions/public/moeda')

module.exports = {
    name: 'zeppelin',
    aliases: ['zep'],
    category: 'economy',
    emoji: `${e.MoneyWings}`,
    usage: 'zeppelin <info>',
    description: 'Um jogo de aposta na base da sorte.',

    run: async (client, message, args, prefix, MessageEmbed, Database) => {

        let zeppelin = await Database.Client.findOne({ id: client.user.id }, 'Zeppelin'),
            moeda = await Moeda(message)

        if (!args[0] || ['info', 'help', 'ajuda'].includes(args[0]?.toLowerCase())) return zeppelinInfo()

        if (zeppelin?.Zeppelin?.Channels?.includes(message.channel.id))
            return message.reply(`${e.Deny} | Já tem um balãozinho subindo neste canal.`)

        let requestValue = args[0].replace(/k/g, '000'),
            dataRequire = await Database.User.findOne({ id: message.author.id }, 'Balance')

        if (!dataRequire) return message.reply(`${e.Warn} | Houve um problema ao encontrar seus dados na minha database. Por favor, tente de novo.`)

        if (['all', 'tudo'].includes(args[0].toLowerCase())) requestValue = dataRequire?.Balance || 0

        let value = parseInt(requestValue)?.toFixed(0),
            money = dataRequire?.Balance || 0,
            ballon = '🎈',
            boom = '💥',
            dotSequence = '',
            valueMultiplication = 1.0,
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
            return message.reply(`${e.Deny} | Diga um valor válido para apostar no zeppelin. Lembrando que deve ser um número válido e que você possua na carteira. Você pode consultar quanto você tem utilizando \`${prefix}balance\`.`)

        if (!money || money <= 0)
            return message.reply(`${e.Deny} | Você não possui dinheiro algúm.`)

        if (value < 1)
            return message.reply(`${e.Deny} | O valor minímo de aposta é de 1 ${moeda}.`)

        if (value > money)
            return message.reply(`${e.Deny} | Você não possui todo esse dinheiro.`)

        return confirmBet()

        function zeppelinInfo() {
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
                            },
                            {
                                name: `${e.Stonks} 2.0`,
                                value: 'O número minímo para você retirar seu dinheiro é **2.0**, se o balão estourar antes disso, meus pesâmes. Você perdeu.'
                            },
                            {
                                name: '🔍 Dados Zepplin',
                                value: `Total de dinheiro ganho: ${zeppelin.Zeppelin.winTotalMoney || 0} ${moeda}\nTotal de dinheiro perdido: ${zeppelin.Zeppelin.loseTotalMoney || 0} ${moeda}`
                            }
                        )
                        .setFooter({ text: `${client.user.username}'s Bet Games` })
                ]
            })
        }

        async function confirmBet() {
            registerChannel()

            let msg = await message.reply({ content: `${e.QuestionMark} | Você tem certeza que deseja apostar "${value} ${moeda}" no zeppelin?` }),
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
                        return startZeppelin()
                    }

                    return collector.stop()
                })
                .on('end', () => {
                    removeChannelFromDatabase()
                    return msg.edit(`${e.Deny} | Comando cancelado.`).catch(() => { })
                })

        }

        async function startZeppelin() {
            registerChannel()
            let resultToTimeout = [5000, 5000, 5000, 5000, 5000, 10000, 6000, 15000, 20000, 30000, 40000, 25000, 50000, 60000, 45000, 70000, 80000, 90000, 75000][Math.floor(Math.random() * 19)],
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

                clearInterval(interval)
                removeChannelFromDatabase()
                collector.stop()
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
            removeChannelFromDatabase()
            msg.edit({
                content: `${valueMultiplication?.toFixed(1)} | ${dotSequence}${boom}`,
                components: []
            }).catch(() => { })

            totalPrice('Zeppelin.loseTotalMoney', value)

            Database.PushTransaction(
                message.author.id,
                `${e.loss} Perdeu ${value} Safiras jogando *Zeppelin*`
            )
            return message.channel.send(`${e.Deny} | Não foi dessa vez ${message.author}. O balão explodiu e você perdeu o dinheiro apostado`)
        }

        function win() {

            let moneyResult = value * valueMultiplication?.toFixed(1)
            Database.add(message.author.id, moneyResult?.toFixed(0))
            Database.PushTransaction(
                message.author.id,
                `${e.gain} Ganhou ${moneyResult?.toFixed(0)} Safiras jogando *Zeppelin*`
            )

            totalPrice('Zeppelin.winTotalMoney', moneyResult - value)
            return message.channel.send(`${e.Check} | Parabéns ${message.author}! Você ganhou um montante de ${moneyResult?.toFixed(0)} ${moeda} retirando a aposta em ${valueMultiplication?.toFixed(1)}. Lembrando que o resultado é o valor da aposta vezes o número do zeppelin.`)
        }

        async function removeChannelFromDatabase() {
            await Database.Client.updateOne(
                { id: client.user.id },
                { $pull: { ['Zeppelin.Channels']: message.channel.id } }
            )
            return
        }

        async function totalPrice(route, value) {

            await Database.Client.updateOne(
                { id: client.user.id },
                {
                    $inc: { [route]: value }
                }
            )
            return
        }

        async function registerChannel() {
            await Database.Client.updateOne(
                { id: client.user.id },
                { $push: { ['Zeppelin.Channels']: message.channel.id } }
            )
            return
        }

        function addDot(msg) {

            let getValueFromArray = Math.floor(Math.random() * 8)

            let addPointsToValue = [0.1, 0.4, 0.3, 0.2, 0.7, 0.1, 0.1, 0.1]
            valueMultiplication = valueMultiplication + addPointsToValue[getValueFromArray]

            let addValue = ['.', '..', '...', '....', '.....', '.', '.', '.'][getValueFromArray]
            dotSequence = `${dotSequence}${addValue}`

            if (valueMultiplication >= 2 && button[0].components[0].disabled) {
                button[0].components[0].disabled = false
                msg.edit({ components: button }).catch(() => { })
            }

            return
        }

    }
}