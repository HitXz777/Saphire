module.exports = {
    name: 'lastclick',
    description: '[games] Quem clicar na bomba, perde.',
    dm_permission: false,
    type: 1,
    options: [
        {
            name: 'oponente',
            description: 'Quem será seu oponente nesta partida?',
            type: 6,
            required: true
        }
    ],
    async execute({ interaction: interaction, emojis: e, database: Database }) {

        const { user, options, channel } = interaction

        if (Database.Cache.get('lastClick')?.includes(channel.id))
            return await interaction.reply({
                content: `${e.Deny} | Já tem um last click rolando neste canal, espere ele terminar.`,
                ephemeral: true
            })

        Database.Cache.push('lastClick', channel.id)
        const opponent = options.getUser('oponente')

        if (opponent.id === user.id)
            return await interaction.reply({
                content: `${e.Deny} | Você não pode jogar contra você mesmo.`,
                ephemeral: true
            })

        if (opponent.bot)
            return await interaction.reply({
                content: `${e.Deny} | Eu manipularia o jogo pros bot vencerem. Não acha?`,
                ephemeral: true
            })

        let msg = await interaction.reply({
            content: `${e.QuestionMark} | ${opponent}, você está sendo desafiado por ${user} para uma partida de *Last Click*.`,
            components: [
                {
                    type: 1,
                    components: [
                        {
                            type: 2,
                            label: 'ACEITAR',
                            custom_id: 'accept',
                            style: 'SUCCESS'
                        },
                        {
                            type: 2,
                            label: 'RECUSAR',
                            custom_id: 'refuse',
                            style: 'DANGER'
                        }
                    ]
                }
            ],
            fetchReply: true
        })

        const collector = msg.createMessageComponentCollector({
            filter: int => int.user.id === opponent.user.id,
            time: 60000,
            max: 1
        })
            .on('collect', int => {

                const { customId } = int

                if (customId === 'refuse') {
                    collector.stop()
                    return msg.edit({
                        content: `${e.Deny} | Desafio recusado`,
                        components: []
                    }).catch(() => { })
                }

                int.deferUpdate().catch(() => { })
                return initGame()
            })
            .on('end', (i, reason) => {
                if (['user', 'limit'].includes(reason)) return
                Database.Cache.pull('lastClick', channel.id)
                return msg.edit({
                    content: `${e.Deny} | Desafio cancelado`,
                    components: []
                }).catch(() => { })
            })

        async function initGame() {

            let control = {
                playNow: [opponent.id, user.id].random(),
                buttons: getButtons(),
                customIds: []
            }

            msg.edit({
                content: `<@${control.playNow}>, é sua vez.`,
                components: control.buttons
            })

            let collector = msg.createMessageComponentCollector({
                filter: int => [user.id, opponent.id].includes(int.user.id),
                idle: 60000
            })
                .on('collect', async int => {

                    const { customId, user: author } = int

                    int.deferUpdate().catch(() => { })
                    if (author.id !== control.playNow) return

                    let buttonIndex = { a1: 0, a2: 0, a3: 0, a4: 0, a5: 0, b1: 1, b2: 1, b3: 1, b4: 1, b5, c1: 2, c2: 2, c3: 2, c4: 2, c5: 2, d1: 3, d2: 3, d3: 3, d4: 3, d5: 3 }[`${customId}`]

                    if (control.customIds.includes(customId)) return

                    control.customIds.push(customId)

                    let buttom = control.buttons[buttonIndex].components.find(data => data.custom_id === customId)

                    buttom.emoji = ['💣', e.CoolDoge, e.CoolDoge, e.CoolDoge, e.CoolDoge].random()
                    buttom.disabled = true
                    buttom.style = 'PRIMARY'
                    await validateButton(customId)
                })
                .on('end', (i, reason) => {
                    Database.Cache.pull('lastClick', channel.id)
                    return msg.edit({
                        content: `${e.Deny} | Game cancelado por falta de resposta`,
                        components: []
                    }).catch(() => { })
                })
        }

        function getButtons() {

            let emojiDefault = e.Hmmm

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
                        },
                        {
                            type: 2,
                            emoji: emojiDefault,
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
                        },
                        {
                            type: 2,
                            emoji: emojiDefault,
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
                        },
                        {
                            type: 2,
                            emoji: emojiDefault,
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
                        },
                        {
                            type: 2,
                            emoji: emojiDefault,
                            custom_id: 'd5',
                            style: 'SECONDARY'
                        }
                    ]
                }
            ]
        }

        function validateButton() {

            let a1 = buttons[0].components[0],
                a2 = buttons[0].components[1],
                a3 = buttons[0].components[2],
                a4 = buttons[0].components[3],
                a5 = buttons[0].components[4],
                b1 = buttons[1].components[0],
                b2 = buttons[1].components[1],
                b3 = buttons[1].components[2],
                b4 = buttons[1].components[3],
                b5 = buttons[1].components[4],
                c1 = buttons[2].components[0],
                c2 = buttons[2].components[1],
                c3 = buttons[2].components[2],
                c4 = buttons[2].components[3],
                c5 = buttons[2].components[4],
                d1 = buttons[3].components[0],
                d2 = buttons[3].components[1],
                d3 = buttons[3].components[2],
                d4 = buttons[3].components[3],
                d5 = buttons[3].components[4]

            // a1 a2 a3 a4 a5
            // b1 b2 b3 b4 b5
            // c1 c2 c3 c4 c5
            // d1 d2 d3 d4 d5

            return
        }
    }
}