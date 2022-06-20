class Pikachu {

    async game(client, message, args, prefix, Database, data) {

        const { zeppelin, moeda, ballon, boom, stateZero, jumping, e } = data

        let channels = Database.Cache.get('GameChannels.Zeppelin') || []
        if (channels.includes(message.channel.id))
            return message.reply(`${ballon || e.Deny} | Já tem um Pikachu correndo neste canal.`)

        let requestValue = parseInt(args[0].replace(/k/g, '000')),
            dataRequire = await Database.User.findOne({ id: message.author.id }, 'Balance')

        if (!dataRequire) return message.reply(`${e.Warn} | Houve um problema ao encontrar seus dados na minha database. Por favor, tente de novo.`)

        if (['all', 'tudo'].includes(args[0].toLowerCase())) requestValue = dataRequire?.Balance || 0
        if (['half', 'metade'].includes(args[0].toLowerCase())) requestValue = parseInt((dataRequire?.Balance / 2)?.toFixed(0)) || 0

        let value = parseInt(requestValue),
            money = dataRequire?.Balance || 0,
            dotSequence = '',
            retired = false,
            valueMultiplication = 0.0,
            button = [
                {
                    type: 1,
                    components: [
                        {
                            type: 2,
                            label: 'Pegar o Pikachu',
                            custom_id: 'retire',
                            style: 'SUCCESS',
                            disabled: true,
                        }
                    ],
                },
            ],
            accepted = false

        if (!value || isNaN(value))
            return message.reply(`${e.Deny} | Diga um valor válido para apostar com o Pikachu. Lembrando que deve ser um número válido e que você possua na carteira. Você pode consultar quanto você tem utilizando \`${prefix}balance\`.`)

        if (!money || money <= 0)
            return message.reply(`${e.Deny} | Você não possui dinheiro algúm.`)

        if (value < 1)
            return message.reply(`${e.Deny} | O valor minímo de aposta é de 1 ${moeda}.`)

        if (value > money)
            return message.reply(`${e.Deny} | Você não possui todo esse dinheiro.`)

        return confirmBet()

        async function confirmBet() {
            registerChannel()

            let msg = await message.reply({
                content: `${e.pikachuChallanger || e.QuestionMark} | Você tem certeza que deseja apostar **${value} ${moeda}** com o *Pikachu*?`
            }),
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

                        accepted = true
                        Database.subtract(message.author.id, value)
                        return startZeppelin()
                    }

                    return collector.stop()
                })
                .on('end', () => {
                    if (accepted) return
                    removeChannelFromDatabase()
                    return msg.edit(`${e.Deny} | Comando cancelado.`).catch(() => { })
                })

        }

        async function startZeppelin() {
            registerChannel()
            let resultToTimeout = [5000, 5000, 5000, 5000, 5000, 10000, 6000, 15000, 20000, 30000, 40000, 25000, 50000, 60000, 45000, 70000, 80000, 90000, 75000].random(),
                timeResult = Math.floor(Math.random() * resultToTimeout) + 2000

            let msg = await message.reply({
                content: `${valueMultiplication} | ${dotSequence}${stateZero}`,
                components: button
            })

            const collector = msg.createMessageComponentCollector({
                filter: (int) => int.user.id === message.author.id,
                time: timeResult,
                max: 1,
                errors: ['time', 'max']
            })

            let interval = setInterval(() => {
                if (zeppelin?.Zeppelin?.Explode >= 3) return collector.stop()
                addDot(msg)
                msg.edit({ content: `${valueMultiplication?.toFixed(1)} | ${dotSequence}${ballon}` }).catch(() => { })
            }, 2000)

            collector.on('collect', interaction => {
                interaction.deferUpdate().catch(() => { })

                retired = true
                explode(msg)
                return win(msg)
            })
                .on('end', () => {
                    if (retired) return
                    explode(msg)
                })

            async function explode(msg) {
                clearInterval(interval)
                removeChannelFromDatabase()
                collector.stop(msg)

                if (zeppelin?.Zeppelin?.Explode >= 3)
                    await Database.Client.updateOne({ id: client.user.id }, { ['Zeppelin.Explode']: 0 }, { upsert: true })

                if (!retired) {
                    totalPrice('Zeppelin.loseTotalMoney', value)

                    Database.PushTransaction(
                        message.author.id,
                        `${e.loss} Perdeu ${value} Safiras jogando *Zeppelin*`
                    )

                    msg.edit({
                        content: `${valueMultiplication?.toFixed(1)} | ${dotSequence}${boom}`,
                        components: []
                    }).catch(() => { })

                    return message.channel.send(`${e.Deny} | Não foi dessa vez ${message.author}. O Pikachu fugiu e você perdeu o dinheiro apostado.`)
                }
            }
        }

        async function win(msg) {

            let valueMult = valueMultiplication?.toFixed(1)

            let moneyResult = parseInt((value / 2) * valueMultiplication),
                totalPrize = value + moneyResult

            Database.add(message.author.id, totalPrize)
            Database.PushTransaction(
                message.author.id,
                `${e.gain} Ganhou ${moneyResult} Safiras pegando o *Pikachu*`
            )

            if (valueMult > (zeppelin.Zeppelin.distanceData?.value || 0))
                await Database.Client.updateOne(
                    { id: client.user.id },
                    {
                        ['Zeppelin.distanceData']: {
                            value: valueMult,
                            winner: `${valueMult} | ${message.author.tag} \`${message.author.id}\` | *(+${moneyResult})*`
                        }
                    }
                )

            totalPrice('Zeppelin.winTotalMoney', value)
            msg.edit({
                content: `${valueMultiplication?.toFixed(1)} | ${dotSequence}${jumping}`,
                components: []
            }).catch(() => { })
            message.channel.send(`${e.Check} | Parabéns ${message.author}! Você ganhou um montante de ${totalPrize} ${moeda} pegando o Pikachu na distância ${valueMultiplication?.toFixed(1)} com um lucro de *(+${moneyResult})*. Lembrando que o resultado é metade do valor da aposta vezes o número da *distância*.`)
            await Database.Client.updateOne({ id: client.user.id }, { $inc: { ['Zeppelin.Explode']: 1 } })
            return
        }

        async function removeChannelFromDatabase() {
            Database.registerChannelControl('pull', 'Zeppelin', message.channel.id)
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
            Database.registerChannelControl('push', 'Zeppelin', message.channel.id)
            return
        }

        function addDot(msg) {

            let addPointsToValue = [0.1, 0.4, 0.3, 0.2, 0.7, 0.1, 0.1, 0.1, 1.0, 0.5, 0.1],
                getValueFromArray = Math.floor(Math.random() * addPointsToValue.length)

            valueMultiplication += addPointsToValue[getValueFromArray]

            let addValue = ['.', '....', '...', '..', '.......', '.', '.', '.', '..........', '.....', '.'][getValueFromArray]
            dotSequence += addValue

            if (valueMultiplication >= 1.8 && button[0].components[0].disabled) {
                button[0].components[0].disabled = false
                msg.edit({ components: button }).catch(() => { })
            }

            return
        }

    }

}

module.exports = Pikachu