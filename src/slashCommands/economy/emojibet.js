module.exports = {
    name: 'emojibet',
    description: '[economy] Uma super luta entre emojis',
    dm_permission: false,
    type: 1,
    options: [
        {
            name: 'value',
            description: 'Valor do emojibet',
            type: 4,
            min_value: 1,
            required: true
        }
    ],
    async execute({ interaction: interaction, database: Database, emojis: e, client: client, guildData: guildData }) {

        const { options, user, channel } = interaction

        if (Database.Cache.get('emojiBet')?.includes(channel.id))
            return await interaction.reply({
                content: `${e.Deny} | Já tem um emoji bet ativo neste canal. Espere ele finalizar.`,
                ephemeral: true
            })

        let emojis = ['🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐻‍❄️', '🙈', '🐵', '🐸', '🐨', '🐒', '🦁', '🐯', '🐮', '🐔', '🐧', '🐦', '🐤', '🦄', '🐴', '🐗', '🐺', '🦇', '🦉', '🦅', '🦤', '🦆', '🐛', '🦋', '🐌', '🐝', '🪳', '🪲', '🦗', '🦂', '🐢']
        let emojisChoosen = await getEmojis()
        let buttons = await getButtons()
        let participants = []
        let total = 0
        let value = options.getInteger('value')
        let userData = await Database.User.findOne({ id: user.id }, 'Balance')
        let userBalance = userData?.Balance || 0
        let moeda = guildData?.Moeda || `${e.Coin} Safiras`
        let alreadyWarned = []

        if (!userBalance || userBalance <= 0 || userBalance < value)
            return await interaction.reply({
                content: `${e.Deny} | Você não tem dinheiro suficiente para iniciar um emoji bet`,
                ephemeral: true
            })

        participants.push({ user: user.id, emoji: emojisChoosen[0] })
        total += value

        let embed = {
            color: client.blue,
            title: `${emojis.random()} ${user.username} inicou um emoji bet`,
            description: `Valor: ${value} ${moeda}`,
            fields: [

                {
                    name: `${e.MoneyWings} Prêmio acumulado`,
                    value: `${total} ${moeda}`
                },
                {
                    name: '👥 Participantes (1)',
                    value: `${emojisChoosen[0]} ${user}`
                }
            ],
            footer: { text: 'O emoji será sorteado após 30 segundos.' }
        }

        Database.Cache.push('emojiBet', channel.id)
        Database.subtract(user.id, value)
        Database.PushTransaction(
            user.id,
            `${e.loss} Apostou ${value} Safiras no Emoji Bet`
        )
        let msg = await interaction.reply({
            embeds: [embed],
            components: buttons,
            fetchReply: true
        })

        let collector = msg.createMessageComponentCollector({
            filter: int => true,
            time: 30000
        })
            .on('collect', async int => {

                const { customId, user: author } = int

                if (customId === 'finalize') {
                    if (author.id !== user.id)
                        return await int.reply({
                            content: `${e.Deny} | Apenas ${user} pode finalizar este emoji bet.`,
                            ephemeral: true
                        })

                    return collector.stop()
                }

                if (participants.find(d => d.user === author.id)) {

                    if (alreadyWarned.includes(author.id))
                        return int.deferUpdate().catch(() => { })

                    alreadyWarned.push(author.id)
                    return await int.reply({
                        content: `${e.Info} | Você já entrou neste emoji bet`,
                        ephemeral: true
                    })
                }

                let authorData = await Database.User.findOne({ id: author.id }, 'Balance')
                if (!authorData?.Balance || authorData.Balance < value)
                    return await int.reply({
                        content: `${e.Deny} | Você não possui dinheiro suficiente para entrar neste emoji bet.`,
                        ephemeral: true
                    })

                int.deferUpdate().catch(() => { })

                let buttonIndex = { a1: 0, a2: 0, a3: 0, a4: 0, a5: 0, b1: 1, b2: 1, b3: 1, b4: 1, b5: 1, c1: 2, c2: 2, c3: 2, c4: 2, c5: 2, d1: 3, d2: 3, d3: 3, d4: 3, d5: 3 }[`${customId}`]
                let buttom = buttons[buttonIndex].components.find(data => data.custom_id === customId)

                participants.push({ user: author.id, emoji: buttom.emoji })

                buttom.disabled = true
                buttom.style = 'PRIMARY'
                total += value

                embed.fields[1].value = participants.map(d => `${d.emoji} <@${d.user}>`).join('\n')
                embed.fields[1].name = `👥 Participantes (${participants.length})`
                embed.fields[0].value = `${total} ${moeda}`

                Database.subtract(author.id, value)
                Database.PushTransaction(
                    author.id,
                    `${e.loss} Apostou ${value} Safiras no Emoji Bet`
                )

                return msg.edit({ embeds: [embed], components: buttons }).catch(() => { })
            })
            .on('end', async () => {

                Database.Cache.pull('emojiBet', channel.id)
                if (participants.length === 1) {

                    Database.add(user.id, value)

                    embed.color = client.red
                    embed.footer = { text: 'Cancelado' }

                    await interaction.followUp({
                        content: `${e.Deny} | Emoji bet cancelado por falta de participantes.`
                    })

                    return msg.edit({ embeds: [embed], components: [] }).catch(() => { })
                }

                let winData = participants.random()

                embed.fields[2] = {
                    name: 'Vencedor',
                    value: `${winData.emoji} <@${winData.user}>`
                }

                embed.color = client.green
                embed.footer = { text: 'Finalizado' }

                Database.add(winData.user, total)
                Database.PushTransaction(
                    winData.user,
                    `${e.gain} Ganhou ${total} Safiras no Emoji Bet`
                )

                await interaction.followUp({
                    content: `${e.Check} | O emoji bet foi finalizado. O vencedor desta rodada foi o emoji ${winData.emoji} de <@${winData.user}>. Levando pra casa o total de **${total} ${moeda}**.`
                })

                return msg.edit({ content: null, embeds: [embed], components: [] }).catch(() => { })
            })

        return

        function getEmojis() {

            let emojisArray = []

            for (let i = 0; i < 20; i++) {

                let emoji = emojis[Math.floor(Math.random() * emojis.length)]

                if (emojisArray.includes(emoji)) {
                    i--
                    continue
                }

                emojisArray.push(emoji)
            }

            return emojisArray
        }

        async function getButtons() {


            /*
                a1 a2 a3 a4 a5
                b1 b2 b3 b4 b5
                c1 c2 c3 c4 c5
                d1 d2 d3 d4 d5
            */

            return [
                {
                    type: 1,
                    components: [
                        {
                            type: 2,
                            emoji: emojisChoosen[0],
                            custom_id: 'a1',
                            disabled: true,
                            style: 'PRIMARY'
                        },
                        {
                            type: 2,
                            emoji: emojisChoosen[1],
                            custom_id: 'a2',
                            style: 'SECONDARY'
                        },
                        {
                            type: 2,
                            emoji: emojisChoosen[2],
                            custom_id: 'a3',
                            style: 'SECONDARY'
                        },
                        {
                            type: 2,
                            emoji: emojisChoosen[3],
                            custom_id: 'a4',
                            style: 'SECONDARY'
                        },
                        {
                            type: 2,
                            emoji: emojisChoosen[4],
                            custom_id: 'a5',
                            style: 'SECONDARY'
                        }
                    ]
                },
                {
                    type: 1,
                    components: [
                        {
                            type: 2,
                            emoji: emojisChoosen[5],
                            custom_id: 'b1',
                            style: 'SECONDARY'
                        },
                        {
                            type: 2,
                            emoji: emojisChoosen[6],
                            custom_id: 'b2',
                            style: 'SECONDARY'
                        },
                        {
                            type: 2,
                            emoji: emojisChoosen[7],
                            custom_id: 'b3',
                            style: 'SECONDARY'
                        },
                        {
                            type: 2,
                            emoji: emojisChoosen[8],
                            custom_id: 'b4',
                            style: 'SECONDARY'
                        },
                        {
                            type: 2,
                            emoji: emojisChoosen[9],
                            custom_id: 'b5',
                            style: 'SECONDARY'
                        }
                    ]
                },
                {
                    type: 1,
                    components: [
                        {
                            type: 2,
                            emoji: emojisChoosen[10],
                            custom_id: 'c1',
                            style: 'SECONDARY'
                        },
                        {
                            type: 2,
                            emoji: emojisChoosen[11],
                            custom_id: 'c2',
                            style: 'SECONDARY'
                        },
                        {
                            type: 2,
                            emoji: emojisChoosen[12],
                            custom_id: 'c3',
                            style: 'SECONDARY'
                        },
                        {
                            type: 2,
                            emoji: emojisChoosen[13],
                            custom_id: 'c4',
                            style: 'SECONDARY'
                        },
                        {
                            type: 2,
                            emoji: emojisChoosen[14],
                            custom_id: 'c5',
                            style: 'SECONDARY'
                        }
                    ]
                },
                {
                    type: 1,
                    components: [
                        {
                            type: 2,
                            emoji: emojisChoosen[15],
                            custom_id: 'd1',
                            style: 'SECONDARY'
                        },
                        {
                            type: 2,
                            emoji: emojisChoosen[16],
                            custom_id: 'd2',
                            style: 'SECONDARY'
                        },
                        {
                            type: 2,
                            emoji: emojisChoosen[17],
                            custom_id: 'd3',
                            style: 'SECONDARY'
                        },
                        {
                            type: 2,
                            emoji: emojisChoosen[18],
                            custom_id: 'd4',
                            style: 'SECONDARY'
                        },
                        {
                            type: 2,
                            emoji: emojisChoosen[19],
                            custom_id: 'd5',
                            style: 'SECONDARY'
                        }
                    ]
                },
                {
                    type: 1,
                    components: [
                        {
                            type: 2,
                            label: `FINALIZAR EMOJIBET - (${user.username})`,
                            custom_id: 'finalize',
                            style: 'SUCCESS'
                        }
                    ]
                }
            ]
        }

    }
}