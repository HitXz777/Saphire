class Raspadinha {
    construction() { }

    async start(client, message, args, prefix, MessageEmbed, Database) {

        const { e } = require('../../../../JSON/emojis.json'),
            Moeda = require('../../../../modules/functions/public/moeda')

        let data = await Database.User.findOne({ id: message.author.id }, 'Slot.Raspadinhas')
        if (!data) return message.reply(`${e.Database} | DATABASE | Tente novamente por favor.`)

        let prize = {
            '🦤': -1000,
            '🐭': 150,
            '🦆': 5000,
            '🐒': 1000,
            '🐔': 100,
            '🐦': 500,
            '🦋': 10000
        }, emojis = Object.keys(prize)

        if (['info', 'ajuda', 'help'].includes(args[0]?.toLowerCase())) return raspInfo()

        let raspadinhas = data.Slot?.Raspadinhas || 0
        if (!raspadinhas || raspadinhas <= 0) return message.reply(`${e.Deny} | Você não tem nenhuma raspadinha. Que tal comprar algumas? \`${prefix}comprar raspadinhas <quantidade>\`\n> ${e.Info} | Se quiser ver mais detalhes, use o comando \`${prefix}raspadinha info\``)

        let raspadinhaData = await Database.Client.findOne({ id: client.user.id }, 'GameChannels.Raspadinhas')

        if (raspadinhaData?.GameChannels?.Raspadinhas?.includes(message.author.id))
            return message.reply(`${e.Deny} | Você já tem uma raspadinha sendo aberta. Termine de abrir, depois abra outra. Cuidado com a ganância, ser humano.`)

        let channelsId = Database.Cache.get('Raspadinhas') || []

        if (channelsId.includes(message.channel.id))
            return message.reply(`${e.Deny} | Já tem uma raspadinha sendo aberta neste canal. Espere ela fechar para você abrir a sua, ok?.`)

        registerRaspadinha()

        let moeda = await Moeda(message),
            control = {
                checkEmojis: ['✅', '❌'],
                accepted: false,
                clicks: 0,
                ended: false,
                customIds: []
            },
            emojiDefault = e.raspadinha,
            buttons = getButtons()

        let msg = await message.reply(`${e.QuestionMark} | Você deseja gastar uma raspadinha e tentar sua sorte?`)
        for (let i of control.checkEmojis) msg.react(i).catch(() => { })

        const collector = msg.createReactionCollector({
            filter: (reaction, user) => control.checkEmojis.includes(reaction.emoji.name) && user.id === message.author.id,
            time: 30000,
            max: 1,
            erros: ['time', 'max']
        })
            .on('collect', async (reaction) => {

                if (reaction.emoji.name === control.checkEmojis[1])
                    return collector.stop()

                control.accepted = true
                addRaspadinha()
                msg.delete().catch(() => { })
                return startRaspadinha()
            })
            .on('end', () => {
                if (control.accepted) return
                unregisterRaspadinha()
                return msg.edit({ content: `${e.Deny} | Comando cancelado.` }).catch(() => { })
            })

        async function startRaspadinha() {

            Database.subtractItem(message.author.id, 'Slot.Raspadinhas', 1)

            msg = await message.reply({
                content: `${e.Loading} | Clique nos botões e boa sorte!`,
                components: buttons
            }).catch(() => { })

            return msg.createMessageComponentCollector({
                filter: int => {
                    if (int.channel.id !== message.channel.id) return false
                    return int.user.id === message.author.id
                },
                idle: 20000,
                erros: ['idle']
            })
                .on('collect', async interaction => {
                    interaction.deferUpdate().catch(() => { })

                    let customId = interaction.customId,
                        buttonIndex = { a1: 0, a2: 0, a3: 0, a4: 0, b1: 1, b2: 1, b3: 1, b4: 1, c1: 2, c2: 2, c3: 2, c4: 2, d1: 3, d2: 3, d3: 3, d4: 3 }[`${customId}`]

                    if (control.customIds.includes(customId)) return

                    control.customIds.push(customId)
                    control.clicks++

                    let buttom = buttons[buttonIndex].components.find(data => data.custom_id === customId)

                    buttom.emoji = getRandomEmoji()
                    buttom.disabled = true
                    buttom.style = 'PRIMARY'
                    await checkButtons(customId, buttonIndex)
                    msg.edit({ components: buttons }).catch(() => { })
                    return
                })
                .on('end', () => {
                    if (control.ended) return
                    unregisterRaspadinha()
                    return msg.edit({ content: `${e.Deny} | Raspadinha cancelada.`, components: [] }).catch(() => { })
                })
        }

        function getRandomEmoji() {
            return emojis[Math.floor(Math.random() * emojis.length)]
        }

        function checkButtons(customId, buttonIndex) {

            let a1 = buttons[0].components[0],
                a2 = buttons[0].components[1],
                a3 = buttons[0].components[2],
                a4 = buttons[0].components[3],
                b1 = buttons[1].components[0],
                b2 = buttons[1].components[1],
                b3 = buttons[1].components[2],
                b4 = buttons[1].components[3],
                c1 = buttons[2].components[0],
                c2 = buttons[2].components[1],
                c3 = buttons[2].components[2],
                c4 = buttons[2].components[3],
                d1 = buttons[3].components[0],
                d2 = buttons[3].components[1],
                d3 = buttons[3].components[2],
                d4 = buttons[3].components[3]

            let winCondicionals = [
                [a1, a2, a3], [a1, b1, c1], [a1, b2, c3],
                [a2, a3, a4], [a2, b2, c2], [a2, b3, c4],
                [a3, b3, c3], [a3, b2, c1],
                [a4, b4, c4], [a4, b3, c2],
                [b1, b2, b3], [b1, c1, d1], [b1, c2, d3],
                [b2, c2, d2], [b2, c3, d4], [b2, b3, b4],
                [b3, c3, d3], [b3, c2, d1],
                [b4, c4, d4], [b4, c3, d2],
                [c1, c2, c3],
                [d1, d2, d3],
                [d2, d3, d4]
            ]

            for (let condicional of winCondicionals)
                if (condicional.every(data => data.emoji === condicional[0].emoji && data.emoji !== emojiDefault)) {
                    for (let i of condicional)
                        i.emoji !== '🦤' ? i.style = 'SUCCESS' : i.style = 'DANGER'

                    disableAllButtons([a1, a2, a3, a4, b1, b2, b3, b4, c1, c2, c3, c4, d1, d2, d3, d4])
                    return win(condicional[0].emoji)
                }
                else continue

            if (control.clicks >= 16) {
                disableAllButtons([a1, a2, a3, a4, b1, b2, b3, b4, c1, c2, c3, c4, d1, d2, d3, d4])
                return lose()
            }

            return

        }

        function win(emoji) {
            control.ended = true
            collector.stop()
            unregisterRaspadinha()

            let winPrize = prize[emoji] || 0

            if (winPrize > 0) {
                if (control.added) return
                control.added = true
                Database.add(message.author.id, winPrize)
                Database.PushTransaction(message.author.id, `${e.gain} Ganhou ${winPrize} Safiras em uma *raspadinha*`)
                addTotalPrize(winPrize)
            }

            if (winPrize === -1000) {
                Database.add(message.author.id, winPrize)
                Database.PushTransaction(message.author.id, `${e.loss} Perdeu ${winPrize} Safiras em uma *raspadinha*`)
                addTotalPrize(winPrize)
            }

            let finalText = winPrize <= 0
                ? `🦤 | Você encontrou um sequência de dodos e perdeu 1000 ${moeda}`
                : `${e.Check} | Você ganhou **${winPrize} ${moeda}** achando 3 ${emoji}`

            return msg.edit({
                content: finalText,
                components: buttons
            }).catch(() => { })
        }

        function lose() {
            control.ended = true
            collector.stop()
            unregisterRaspadinha()
            return msg.edit(`${e.Deny} | Que pena, você não ganhou nada nessa raspadinha.`).catch(() => { })
        }

        function disableAllButtons(arr) {
            for (let button of arr)
                if (!button.disabled)
                    button.disabled = true
            return
        }

        async function registerRaspadinha() {
            Database.Cache.push('Raspadinhas', message.channel.id)

            await Database.Client.updateOne(
                { id: client.user.id },
                { $push: { ['GameChannels.Raspadinhas']: message.author.id } },
                { upsert: true }
            )
        }

        async function unregisterRaspadinha() {
            Database.Cache.pull('Raspadinhas', message.channel.id)

            await Database.Client.updateOne(
                { id: client.user.id },
                { $pull: { ['GameChannels.Raspadinhas']: message.author.id } }
            )
        }

        async function addRaspadinha() {
            await Database.Client.updateOne(
                { id: client.user.id },
                { $inc: { ['Raspadinhas.Bought']: 1 } }
            )
        }

        async function addTotalPrize(winPrize) {
            await Database.Client.updateOne(
                { id: client.user.id },
                { $inc: { ['Raspadinhas.totalPrize']: winPrize || 0 } }
            )
        }

        async function raspInfo() {

            let data = Object.entries(prize),
                moeda = await Moeda(message)

            return message.reply(
                {
                    embeds: [
                        new MessageEmbed()
                            .setColor(client.blue)
                            .setTitle(`${e.raspadinha} Raspadinhas ${client.user.username}`)
                            .setDescription(`${e.FirePo} Azar ou sorte? Na raspadinha você tem os dois`)
                            .addFields(
                                {
                                    name: '1 - Como jogar?',
                                    value: `Primeiramente, você precisa de uma raspadinha para jogar a raspadinha, né? Você pode comprar usando o comando \`${prefix}buy raspadinha <Quantidade>\` *(max: 50)*`
                                },
                                {
                                    name: '1.1 - Eu já comprei as raspadinhas, como jogar?',
                                    value: `Basta você usar o comando \`${prefix}raspadinha\`. Você confirma a pergunta de confirmação e pronto, boa sorte!`
                                },
                                {
                                    name: '2 - Vitórias e Derrotas',
                                    value: `Para você ganhar, você tem que ter a sorte de obter uma sequência de **3 emojis** ao clicar nos botões. Caso não tenha, já sabe, perdeu.`
                                },
                                {
                                    name: '3 - Prêmios',
                                    value: data.sort((a, b) => a[1] - b[1]).map(value => `${value[0]} ${value[1]} ${moeda}`).join('\n')
                                }
                            )
                            .setFooter({ text: `Per Emoji Chance: ${((1 / emojis.length) * 100).toFixed(2)}%` })
                    ]
                }
            )
        }

        function getButtons() {

            /*
                a1 a2 a3 a4
                b1 b2 b3 b4
                c1 c2 c3 c4
                d1 d2 d3 d4
            */

            return [
                {
                    type: 1,
                    components: [
                        {
                            type: 2,
                            emoji: emojiDefault,
                            custom_id: 'a1',
                            style: 'SECONDARY'
                        },
                        {
                            type: 2,
                            emoji: emojiDefault,
                            custom_id: 'a2',
                            style: 'SECONDARY'
                        },
                        {
                            type: 2,
                            emoji: emojiDefault,
                            custom_id: 'a3',
                            style: 'SECONDARY'
                        },
                        {
                            type: 2,
                            emoji: emojiDefault,
                            custom_id: 'a4',
                            style: 'SECONDARY'
                        }
                    ]
                },
                {
                    type: 1,
                    components: [
                        {
                            type: 2,
                            emoji: emojiDefault,
                            custom_id: 'b1',
                            style: 'SECONDARY'
                        },
                        {
                            type: 2,
                            emoji: emojiDefault,
                            custom_id: 'b2',
                            style: 'SECONDARY'
                        },
                        {
                            type: 2,
                            emoji: emojiDefault,
                            custom_id: 'b3',
                            style: 'SECONDARY'
                        },
                        {
                            type: 2,
                            emoji: emojiDefault,
                            custom_id: 'b4',
                            style: 'SECONDARY'
                        }
                    ]
                },
                {
                    type: 1,
                    components: [
                        {
                            type: 2,
                            emoji: emojiDefault,
                            custom_id: 'c1',
                            style: 'SECONDARY'
                        },
                        {
                            type: 2,
                            emoji: emojiDefault,
                            custom_id: 'c2',
                            style: 'SECONDARY'
                        },
                        {
                            type: 2,
                            emoji: emojiDefault,
                            custom_id: 'c3',
                            style: 'SECONDARY'
                        },
                        {
                            type: 2,
                            emoji: emojiDefault,
                            custom_id: 'c4',
                            style: 'SECONDARY'
                        }
                    ]
                },
                {
                    type: 1,
                    components: [
                        {
                            type: 2,
                            emoji: emojiDefault,
                            custom_id: 'd1',
                            style: 'SECONDARY'
                        },
                        {
                            type: 2,
                            emoji: emojiDefault,
                            custom_id: 'd2',
                            style: 'SECONDARY'
                        },
                        {
                            type: 2,
                            emoji: emojiDefault,
                            custom_id: 'd3',
                            style: 'SECONDARY'
                        },
                        {
                            type: 2,
                            emoji: emojiDefault,
                            custom_id: 'd4',
                            style: 'SECONDARY'
                        }
                    ]
                }
            ]
        }

    }

}

module.exports = Raspadinha