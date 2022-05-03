const { e } = require('../../../JSON/emojis.json')

module.exports = {
    name: 'click',
    aliases: ['clique', 'clicar'],
    category: 'games',
    emoji: '👉',
    usage: '<click> <@user>',
    description: 'Quem clicar primeiro ganha ponto',

    run: async (client, message, args, prefix, MessageEmbed, Database) => {

        if (['help', 'ajuda', 'info'].includes(args[0]?.toLowerCase())) return clickCommandInfo()

        let user = getUser()

        if (!user)
            return message.reply(`${e.Deny} | Você precisa me dizer um usuário para começar o jogo.`)

        if (user.id === message.author.id)
            return message.reply(`${e.Deny} | Você não pode jogar com você mesmo.`)

        if (user.id === client.user.id)
            return message.reply(`${e.SaphireObs} | Foi mal, mas eu ganho todas, não acha? Eu sempre sei onde vai ser o clique.`)

        if (user.user.bot)
            return message.reply(`${e.Deny} | Bots são invencíveis.`)

        const buttons = {
            lineOne: [
                {
                    type: 1,
                    components: [
                        {
                            type: 2,
                            emoji: '💤',
                            custom_id: 'a1',
                            style: 'SECONDARY',
                            disabled: true
                        },
                        {
                            type: 2,
                            emoji: '💤',
                            custom_id: 'a2',
                            style: 'SECONDARY',
                            disabled: true
                        },
                        {
                            type: 2,
                            emoji: '💤',
                            custom_id: 'a3',
                            style: 'SECONDARY',
                            disabled: true
                        },
                    ],
                },
            ],
            lineTwo: [
                {
                    type: 1,
                    components: [
                        {
                            type: 2,
                            emoji: '💤',
                            custom_id: 'b1',
                            style: 'SECONDARY',
                            disabled: true
                        },
                        {
                            type: 2,
                            emoji: '💤',
                            custom_id: 'b2',
                            style: 'SECONDARY',
                            disabled: true
                        },
                        {
                            type: 2,
                            emoji: '💤',
                            custom_id: 'b3',
                            style: 'SECONDARY',
                            disabled: true
                        },
                    ],
                },
            ],
            lineThree: [
                {
                    type: 1,
                    components: [
                        {
                            type: 2,
                            emoji: '💤',
                            custom_id: 'c1',
                            style: 'SECONDARY',
                            disabled: true
                        },
                        {
                            type: 2,
                            emoji: '💤',
                            custom_id: 'c2',
                            style: 'SECONDARY',
                            disabled: true
                        },
                        {
                            type: 2,
                            emoji: '💤',
                            custom_id: 'c3',
                            style: 'SECONDARY',
                            disabled: true
                        },
                    ],
                },
            ],
            confirmAndDeclineButton: [
                {
                    type: 1,
                    components: [
                        {
                            type: 2,
                            label: 'Aceitar',
                            custom_id: 'accept',
                            style: 'SUCCESS'
                        },
                        {
                            type: 2,
                            label: 'Recusar',
                            custom_id: 'deny',
                            style: 'DANGER'
                        }
                    ],
                },
            ]
        },
            control = {
                authorPoints: 0,
                userPoints: 0,
                maxPoints: definePoints(),
                initiated: false,
                finished: false,
                clicked: false,
                buttons: [buttons.lineOne, buttons.lineTwo, buttons.lineThree].flat()
            }

        return askingToInit()

        function definePoints() {

            let points = parseInt(args[1])?.toFixed(0)

            if (points > 20 || points < 1) return 5

            return !points || isNaN(points) ? 5 : points

        }

        function clickCommandInfo() {
            return message.reply({
                embeds: [
                    new MessageEmbed()
                        .setColor(client.blue)
                        .setTitle('👉 Clique Game')
                        .setDescription(`O jogo é simples! Quem clicar primeiro na opção verde ganha 1 ponto.\n \n1. Por padrão, o número de pontos é definido em 5.\n2. Para mudar, use \`${prefix}click @user <QuantidadeDePontos>\` *(max: 20 | min: 1)*`)
                        .setFooter(`${client.user.username}'s Games`)
                ]
            })
        }

        function getUser(args0 = args[0]) {

            return message.mentions.members.first()
                || message.guild.members.cache.find(data => {
                    return data.displayName?.toLowerCase() === args.join(' ')?.toLowerCase()
                        || [args0?.toLowerCase()].includes(data.user.tag?.toLowerCase())
                        || [args0].includes(data.user.discriminator)
                        || [args0, message.mentions.repliedUser?.id].includes(data.id)
                        || [args0?.toLowerCase()].includes(data.displayName?.toLowerCase())
                        || data.user.username === args.join(' ')
                })

        }

        async function askingToInit() {

            let msg = await message.channel.send({
                content: `${e.QuestionMark} | ${user}, você está sendo chamado para uma partida de *Cliques*.`,
                components: buttons.confirmAndDeclineButton
            })

            return collector = msg.createMessageComponentCollector({
                filter: int => [message.author.id, user.id].includes(int.user.id),
                time: 60000
            })
                .on('collect', (interaction) => {
                    interaction.deferUpdate().catch(() => { })

                    let customId = interaction.customId

                    if (customId === 'accept' && interaction.user.id === user.id)
                        return init(msg, collector)

                    if (customId === 'deny')
                        return collector.stop()

                    if (interaction.user.id === message.author.id && customId === 'accept') return

                    return collector.stop()
                })

                .on('end', () => {
                    if (control.initiated) return
                    return msg.edit({ content: `${e.Deny} | Jogo cancelado.`, components: [] }).catch(() => { })
                })
        }

        function enableRandomButton(msg) {

            let a1 = control.buttons[0].components[0],
                a2 = control.buttons[0].components[1],
                a3 = control.buttons[0].components[2],
                b1 = control.buttons[1].components[0],
                b2 = control.buttons[1].components[1],
                b3 = control.buttons[1].components[2],
                c1 = control.buttons[2].components[0],
                c2 = control.buttons[2].components[1],
                c3 = control.buttons[2].components[2],
                allEmojis = [a1, a2, a3, b1, b2, b3, c1, c2, c3],
                button = allEmojis[Math.floor(Math.random() * allEmojis.length)]

            button.disabled = false
            button.style = 'SUCCESS'
            button.emoji = '🚀'
            control.clicked = false

            return msg.edit({ components: control.buttons }).catch(() => { })

        }

        function init(msg, askingCollector) {

            control.initiated = true
            askingCollector.stop()

            msg.edit({
                content: `${e.Info} | Espere aparecer o botão verde e clique nele o mais rápido que puder!\n🏆 | ${message.author} ${control.authorPoints} 🆚 ${control.userPoints} ${user}\n📑 | Objetivo: ${control.maxPoints} pontos`,
                components: control.buttons
            }).catch(() => { })

            setTimeout(() => enableRandomButton(msg), 3000)

            return collector = msg.createMessageComponentCollector({
                filter: int => [message.author.id, user.id].includes(int.user.id),
                idle: 10000
            })
                .on('collect', async (interaction) => {
                    interaction.deferUpdate().catch(() => { })

                    if (control.clicked) return
                    control.clicked = true

                    let customId = interaction.customId,
                        indexButton = { a1: 0, a2: 0, a3: 0, b1: 1, b2: 1, b3: 1, c1: 2, c2: 2, c3: 2 }[`${customId}`],
                        button = control.buttons[indexButton].components.find(data => data.custom_id === customId)

                    button.disabled = true
                    button.style = 'SECONDARY'
                    button.emoji = '💤'

                    interaction.user.id === message.author.id
                        ? control.authorPoints++
                        : control.userPoints++

                    if (control.authorPoints >= control.maxPoints || control.userPoints >= control.maxPoints)
                        return collector.stop()

                    msg.edit({
                        content: `${e.Info} | Espere aparecer o botão verde e clique nele o mais rápido que puder!\n🏆 | ${message.author} ${control.authorPoints} 🆚 ${control.userPoints} ${user}`,
                        components: control.buttons
                    }).catch(() => { })

                    if (!control.finished)
                        return setTimeout(() => enableRandomButton(msg), 3000)

                    return
                })
                .on('end', () => {
                    control.finished = true
                    return msg.edit({
                        content: `${e.Deny} | Jogo finalizado.\n🏆 | ${message.author} ${control.authorPoints} 🆚 ${control.userPoints} ${user}`,
                        components: []
                    }).catch(() => { })
                })

        }

    }
}