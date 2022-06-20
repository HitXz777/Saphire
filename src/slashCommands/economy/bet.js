const passCode = require('../../../modules/functions/plugins/PassCode')
const Colors = require('../../../modules/functions/plugins/colors')

module.exports = {
    name: 'bet',
    description: '[economy] Aposte e conquiste todo o dinheiro',
    dm_permission: false,
    type: 1,
    options: [
        {
            name: 'party',
            description: '[economy] Comece uma festa com bet',
            type: 1,
            options: [
                {
                    name: 'opções',
                    description: 'Quantas áreas de apostas para essa party?',
                    type: 4,
                    required: true,
                    choices: [
                        {
                            name: '2 Áreas',
                            value: 2
                        },
                        {
                            name: '3 Áreas',
                            value: 3
                        },
                        {
                            name: '4 Áreas',
                            value: 4
                        }
                    ]
                },
                {
                    name: 'value',
                    description: 'Quantia a ser apostada',
                    type: 4,
                    min_value: 1,
                    required: true
                },
                {
                    name: 'players',
                    description: 'Quantia de players nessa aposta',
                    type: 4,
                    min_value: 1,
                    max_value: 30
                },
            ]
        },
        {
            name: 'simples',
            description: '[economy] Inicie uma aposta simples',
            type: 1,
            options: [
                {
                    name: 'value',
                    description: 'Quantia a ser apostada',
                    type: 4,
                    min_value: 1,
                    required: true
                },
                {
                    name: 'players',
                    description: 'Limite de jogadores (max: 30)',
                    type: 4,
                    min_value: 1,
                    max_value: 30
                }
            ]
        },
        {
            name: 'user',
            description: '[economy] Aposte com alguém',
            type: 1,
            options: [
                {
                    name: 'value',
                    description: 'Quantia a ser apostada',
                    type: 4,
                    min_value: 1,
                    required: true
                },
                {
                    name: 'user',
                    description: 'Contra quem é a aposta?',
                    type: 6,
                    required: true
                }
            ]
        },
        {
            name: 'global',
            description: '[economy] Aposte globalmente com qualquer pessoa',
            type: 1
        }
    ],
    async execute({ interaction: interaction, client: client, database: Database, emojis: e, guildData: guildData }) {

        const { options, user: author, channel } = interaction

        let user = options.getUser('user'),
            subCommand = options.getSubcommand(),
            value = options.getInteger('value'),
            moeda = guildData?.Moeda || `${e.Coin} Safiras`,
            authorData = await Database.User.findOne({ id: author.id }, 'Balance Timeouts'),
            money = authorData?.Balance || 0

        if (subCommand === 'global')
            return await interaction.reply({
                content: `${e.Loading} | Este recurso está sob construção.`,
                ephemeral: true
            })

        switch (subCommand) {
            case 'simples': case 'party': betSimples(); break;
            case 'user': betUser(); break;
        }
        return

        async function betSimples() {

            const color = await Colors(author.id)
            if (subCommand === 'party') return betParty()

            let BetUsers = [],
                LimitUsers = options.getInteger('players') || 30,
                atualPrize = 0

            if (!money || value > money || money < 1)
                return await interaction.reply({
                    content: `${e.Deny} | Você não tem todo esse dinheiro na carteira.`,
                    ephemeral: true
                })

            function BetUsersEmbed() {
                return BetUsers?.length >= 1
                    ? BetUsers.map(id => `<@${id}>`).join('\n')
                    : 'Ninguém'
            }

            const BetEmbed = {
                color: color,
                thumbnail: { url: 'https://imgur.com/k5NKfe8.gif' },
                title: `${author.username} iniciou uma nova aposta`,
                footer: { text: `Limite máximo: ${LimitUsers} participantes` }
            }

            return money >= value
                ? (() => {
                    Database.subtract(author.id, value)
                    atualPrize += value
                    Database.PushTransaction(author.id, `${e.loss} Apostou ${value || 0} Safiras no comando bet`)
                    BetUsers.push(author.id)
                    return BetInit()
                })()
                : await interaction.reply({
                    content: `${e.Deny} | Você está usando o comando errado... Tenta \`${prefix}bet\``,
                    ephemeral: true
                })

            async function BetInit() {

                BetEmbed.fields = [
                    {
                        name: '⠀',
                        value: 'Dinheiro perdido no comando de aposta não será extornado. Cuidado com promessas de jogadores e sua ganância. Uma vez que o dinheiro foi perdido, você não o terá de volta por meios de reclamações.'
                    }
                ]
                BetEmbed.description = `Valor da aposta: ${atualPrize} ${moeda}\n**Participantes**\n${BetUsersEmbed()}\n \n💰 Prêmio acumulado: ${(BetUsers?.length || 0) * value}`

                let buttons = {
                    type: 1,
                    components: [
                        {
                            type: 2,
                            label: 'Finalizar Aposta',
                            custom_id: 'finish',
                            style: 'PRIMARY'
                        },
                        {
                            type: 2,
                            label: 'Participar',
                            custom_id: 'join',
                            style: 'SUCCESS'
                        },
                        {
                            type: 2,
                            label: 'Sair',
                            custom_id: 'leave',
                            style: 'DANGER'
                        }
                    ]
                }

                let msg = await interaction.reply({
                    embeds: [BetEmbed],
                    components: [buttons],
                    fetchReply: true
                })

                let collector = msg.createMessageComponentCollector({
                    filter: () => true,
                    time: 120000,
                    errors: ['time']
                })

                    .on('collect', async (int) => {

                        let { customId, user: intUser } = int

                        if (customId === 'finish' && intUser.id === author.id)
                            return collector.stop()

                        if (customId === 'join') {

                            if (BetUsers.includes(intUser.id))
                                return await int.reply({
                                    content: `${e.Deny} | Você já entrou nesta aposta.`,
                                    ephemeral: true
                                })

                            let userData = await Database.User.findOne({ id: intUser.id }, 'Balance')

                            if (userData?.Balance < value)
                                return await int.reply({
                                    content: `${e.Deny} | ${intUser}, você deve ter pelo menos **${value} ${moeda}** na carteira para entrar nesta aposta.`,
                                    ephemeral: true
                                })

                            Database.subtract(intUser.id, value)
                            atualPrize += value
                            BetUsers.push(intUser.id)
                            Database.PushTransaction(intUser.id, `${e.loss} Apostou ${value || 0} Safiras no comando bet`)

                            BetEmbed.description = `Valor da aposta: ${value} ${moeda}\n**Participantes**\n${BetUsersEmbed()}\n \n💰 Prêmio acumulado: ${atualPrize}`

                            msg.edit({ embeds: [BetEmbed] })
                                .catch(err => {
                                    channel.send(`${e.Deny} | Houve um erro ao editar a mensagem da aposta.\n\`${err}\``)
                                    return collector.stop()
                                })

                            if (BetUsers.length >= LimitUsers)
                                return collector.stop()

                            return
                        }

                        if (customId === 'leave') {
                            int.deferUpdate().catch(() => { })
                            return RemoveUser(intUser)
                        }
                    })

                    .on('end', () => Win())

                async function Win() {

                    if (BetUsers.length === 0 || BetUsers.length === 1 && BetUsers.includes(author.id)) {

                        msg.edit({
                            embeds: [
                                {
                                    color: client.red,
                                    title: `${author.username} fez uma aposta`,
                                    thumbnail: { url: 'https://imgur.com/k5NKfe8.gif' },
                                    description: `${BetEmbed.description}\n \n${e.Deny} Essa aposta foi cancelada por não haver participantes suficientes`
                                }
                            ],
                            components: []
                        }).catch(() => { })

                        if (atualPrize > 0) {
                            Database.add(author.id, atualPrize)
                            Database.PushTransaction(
                                author.id,
                                `${e.gain} Recebeu de volta ${parseInt(atualPrize) || 0} Safiras no comando bet`
                            )
                        }

                        return await interaction.followUp({
                            content: `${e.Deny} | ${author}, aposta cancelada.`
                        }).catch(() => { })
                    }

                    let winnerId = BetUsers.random(),
                        taxa = parseInt(atualPrize * 0.05).toFixed(0)

                    if (taxa > 0) atualPrize -= taxa
                    if (atualPrize > 0) Database.add(winnerId, atualPrize)

                    Database.PushTransaction(winnerId, `${e.gain} Recebeu ${parseInt(atualPrize) || 0} Safiras no comando bet`)

                    await interaction.followUp({
                        content: `${e.MoneyWings} | <@${winnerId}> ganhou a aposta no valor de **${atualPrize} ${moeda}** iniciada por ${author}.\n${taxa > 0 ? `${e.Taxa} | Taxa cobrada (5%): ${taxa} ${moeda}` : ''}`
                    }).catch(() => { })

                    return msg.edit({
                        embeds: [{
                            color: client.red,
                            title: `${author.username} fez uma aposta`,
                            thumbnail: { url: 'https://imgur.com/k5NKfe8.gif' },
                            description: `${BetEmbed.description}\n \n🏆 <@${winnerId}> ganhou a aposta`
                        }],
                        components: []
                    }).catch(() => { })
                }

                function RemoveUser(user) {
                    if (!BetUsers.includes(user.id)) return

                    BetUsers.splice(BetUsers.indexOf(user.id), 1)
                    BetEmbed.description = `Valor da aposta: ${value} ${moeda}\n**Participantes**\n${BetUsersEmbed()}\n \n💰 Prêmio acumulado: ${(BetUsers?.length || 0) * (value || 0)}`
                    msg.edit({ embeds: [BetEmbed] }).catch(() => { })

                    Database.add(user.id, value)
                    Database.PushTransaction(
                        user.id,
                        `${e.gain} Recebeu de volta ${value || 0} Safiras no comando bet`
                    )
                    atualPrize -= value
                    return
                }
            }

            async function betParty() {

                let optionsChoosen = options.getInteger('opções')

                if (money <= 0)
                    return await interaction.reply({
                        content: `${e.Deny} | Ishhh, você não tem nada...`,
                        ephemeral: true
                    })

                if (money < value)
                    return await interaction.reply({
                        content: `${e.Deny} | Você não tem todo esse dinheiro não...`,
                        ephemeral: true
                    })

                /**
                 * BUTTONS OPTIONS
                 * {
                 *    type: 2,
                 *    label: 'string...',
                 *    emoji: 'rawOrCustomEmoji',
                 *    custom_id: 'string',
                 *    style: 'PRIMARY' - In this case
                 * }
                 */

                let buttons = {
                    type: 1,
                    components: [
                        {
                            type: 2,
                            label: 'Finalizar',
                            custom_id: 'cancel',
                            style: 'SUCCESS'
                        }
                    ],
                },
                    arrayControl = { usersInMatch: [], Areas: ['1'] }

                for (let i = 1; i <= optionsChoosen; i++) {
                    buttons.components.push({
                        type: 2,
                        label: `Area ${i}`,
                        custom_id: `${i}`,
                        style: 'PRIMARY'
                    })
                    arrayControl[i] = []
                    arrayControl.Areas.push(`${i}`)
                }

                Database.subtract(author.id, value)
                let prize = 0,
                    embed = {
                        color: color,
                        title: '🎉 Bet Party',
                        description: `${author} iniciou uma Bet Party!\n \n${e.MoneyWithWings} Valor de entrada: ${value} ${moeda}`
                    }

                const msg = await interaction.reply({
                    embeds: [embed],
                    components: [buttons],
                    fetchReply: true
                })

                let collector = msg.createMessageComponentCollector({
                    filter: () => true,
                    time: 60000,
                    errors: ['time']
                })

                    .on('collect', async int => {

                        let { customId, user: intUser } = int

                        if (customId === 'cancel' && intUser.id === author.id)
                            return collector.stop()

                        if (!arrayControl.Areas.includes(customId)) return int.deferUpdate().catch(() => { })
                        if (arrayControl.usersInMatch.includes(intUser.id)) return int.deferUpdate().catch(() => { })
                        let userBalance = await Database.balance(intUser.id)

                        if (userBalance <= 0)
                            return await int.reply({
                                content: `${e.Deny} | ${intUser}, você não tem nada na sua carteira :(`,
                                ephemeral: true
                            })

                        if (userBalance < value)
                            return await int.reply({
                                content: `${e.Deny} | ${intUser}, você precisa ter **${value} ${moeda}** para entrar na Bet Party`,
                                ephemeral: true
                            })

                        arrayControl.usersInMatch.push(intUser.id)
                        arrayControl[`${customId}`].push(intUser.id)
                        subtractAndAddPrize(intUser.id)

                        return await int.reply({
                            content: `**🎉 Bet Party** | ${intUser} entrou na **Area ${customId}**`
                        }).catch(() => { })
                    })
                    .on('end', () => finishBetParty())

                function subtractAndAddPrize(userId) {
                    Database.subtract(userId, value)
                    prize += value
                    attEmbed()
                    return
                }

                function attEmbed() {
                    embed.description = `${author} iniciou uma Bet Party!\n \n${e.MoneyWithWings} Valor de entrada: ${value} ${moeda}\n${e.gain} Total acumulado: ${prize} ${moeda}\n `

                    for (let i = 1; i <= arrayControl.Areas.length; i++)
                        if (arrayControl[`${i}`]?.length > 0)
                            embed.description = `${embed.description}\n**Area ${i}**: ${arrayControl[`${i}`].length} players`

                    return msg.edit({ embeds: [embed] }).catch(() => { })
                }

                async function finishBetParty() {

                    let areaChoosen = arrayControl.Areas.random(),
                        area = arrayControl[`${areaChoosen}`],
                        allPlayers = arrayControl.usersInMatch

                    if (!allPlayers || allPlayers.length === 0) return nobody()

                    if (!area || area.length === 0) return nobodyInBetParty()

                    let winner = area.random(),
                        userUsername = interaction.guild.members.cache.get(winner)?.user?.username || 'Indefinido'

                    Database.add(winner, prize)
                    Database.PushTransaction(winner, `${e.gain} Ganhou ${prize} Safiras em uma *bet party*`)
                    embed.color = client.red
                    embed.title = '🎉 Bet Party | Cancelada'
                    embed.footer = `Ganhador: ${userUsername} | Area ${areaChoosen}`
                    msg.edit({ embeds: [embed], components: [] }).catch(() => { })
                    return await interaction.followUp({
                        content: `**🎉 Bet Party** | A **Area ${areaChoosen}** foi sorteada e o ganhador foi ${interaction.guild.members.cache.get(winner)}. Prêmio: **${prize} ${moeda}**`
                    }).catch(() => { })

                    async function nobodyInBetParty() {
                        Database.add(author.id, prize)
                        embed.color = client.red
                        embed.title = '🎉 Bet Party | Cancelada'
                        embed.footer = { text: `A area sorteada (${areaChoosen}) não tinha ninguém.` }
                        msg.edit({
                            embeds: [embed], components: []
                        }).catch(() => { })
                        return await interaction.followUp({
                            content: `**🎉 Bet Party** | A **Area ${areaChoosen}** não tinha ninguém, então o prêmio de **${prize} ${moeda}** foi para ${author}.`
                        })
                    }

                    async function nobody() {
                        Database.add(author.id, prize)
                        embed.color = client.red
                        embed.title = '🎉 Bet Party | Cancelada'
                        embed.footer = { text: 'Ninguém participou da Bet Party' }
                        msg.edit({ embeds: [embed], components: [] }).catch(() => { })
                        return await interaction.followUp({
                            content: `**🎉 Bet Party** | Ninguém participou dessa rodada.`
                        })
                    }

                }

                return
            }

            // async function betGlobal() {

            //     if (!args[1])
            //         return await interaction.reply({
            //             embeds: [
            //                 new MessageEmbed()
            //                     .setColor(color)
            //                     .setTitle('🌎 Bet Global - (BETA)')
            //                     .setDescription(`\`${prefix}bet global init <value>\` - Injete uma aposta no sistema de apostas globais\n\`${prefix}bet global delete <betId>\` - Delete uma aposta e receba o dinheiro de volta\n\`${prefix}bet global bet\` - Veja todas as apostas globais\n\`${prefix}bet global me\` - Veja todas as suas apostas globais\n\`${prefix}bet global <betId>\` - Aposte contra alguém globalmente`)
            //             ]
            //         })

            //     if (['init', 'iniciar', 'começar', 'start'].includes(args[1]?.toLowerCase())) return injetGlobalBet()
            //     if (['bet', 'apostar'].includes(args[1]?.toLowerCase())) return InitGlobalBet()
            //     if (['me', 'eu', 'i'].includes(args[1]?.toLowerCase())) return personalGlobalBets()
            //     if (['delete', 'del', 'apagar', 'excluir'].includes(args[1]?.toLowerCase())) return deleteBet(args[2])

            //     if (args[1].length === 5) return valideAndInitGlobalBet(args[1])

            //     return await interaction.reply(`${e.Deny} | Sub argumento desconhecido. Use \`${prefix}bet info\` para você obter todas as informações.`)
            // }

            // async function InitGlobalBet() {

            //     let data = await Database.Client.findOne({ id: client.user.id }, 'GlobalBet'),
            //         bets = data?.GlobalBet?.Bets || []

            //     if (!bets || bets.length === 0) return await interaction.reply(`${e.Deny} | Nenhuma aposta global foi encontrada.`)

            //     let embeds = EmbedGenerator(bets),
            //         emojis = ['⬅️', '➡️', '❌'],
            //         embedControl = 0

            //     if (!embeds || embeds.length === 0) return await interaction.reply(`${e.Info} | Não tem nenhuma aposta global iniciada. Que tal você iniciar? \`${prefix}bet global init <value>\``)

            //     let msg = await await interaction.reply({ embeds: [embeds[0]] })

            //     if (embeds.length > 1)
            //         for (let i of emojis) msg.react(i).catch(() => { })
            //     else return

            //     let collector = msg.createReactionCollector({
            //         filter: (r, u) => emojis.includes(r.emoji.name) && u.id === author.id,
            //         idle: 40000,
            //         errors: ['idle']
            //     })
            //         .on('collect', (r, u) => {

            //             if (r.emoji.name === emojis[0]) {
            //                 embedControl--
            //                 if (embedControl < 0) embedControl = embeds.length - 1
            //                 return msg.edit({ embeds: [embeds[embedControl]] }).catch(() => { })
            //             }

            //             if (r.emoji.name === emojis[1]) {
            //                 embedControl++
            //                 if (embedControl >= embeds.length) embedControl = 0
            //                 return msg.edit({ embeds: [embeds[embedControl]] }).catch(() => { })
            //             }

            //             if (r.emoji.name === emojis[2])
            //                 return collector.stop()

            //             return
            //         })
            //         .on('end', () => {
            //             msg.reactions.removeAll().catch(() => { })
            //             let cancelEmbed = embeds[embedControl]
            //             cancelEmbed.color = client.red

            //             return msg.edit({
            //                 content: `${e.Deny} | Comando cancelado.`,
            //                 embeds: [embeds[embedControl]]
            //             })
            //         })
            // }

            // async function personalGlobalBets() {

            //     let data = await Database.Client.findOne({ id: client.user.id }, 'GlobalBet'),
            //         allBets = data?.GlobalBet?.Bets || []

            //     if (!allBets || allBets.length === 0) return await interaction.reply(`${e.Deny} | Nenhuma aposta global foi encontrada.`)

            //     let bets = allBets.filter(d => d.userId === author.id)

            //     if (!bets || bets.length === 0) return await interaction.reply(`${e.Deny} | Você não possui nenhuma aposta global.`)

            //     let embeds = EmbedGenerator(bets, true),
            //         emojis = ['⬅️', '➡️', '❌'],
            //         embedControl = 0

            //     let msg = await await interaction.reply({ embeds: [embeds[0]] })

            //     if (embeds.length > 1)
            //         for (let i of emojis) msg.react(i).catch(() => { })
            //     else return

            //     let collector = msg.createReactionCollector({
            //         filter: (r, u) => emojis.includes(r.emoji.name) && u.id === author.id,
            //         idle: 40000,
            //         errors: ['idle']
            //     })
            //         .on('collect', (r, u) => {

            //             if (r.emoji.name === emojis[0]) {
            //                 embedControl--
            //                 if (embedControl < 0) embedControl = embeds.length - 1
            //                 return msg.edit({ embeds: [embeds[embedControl]] }).catch(() => { })
            //             }

            //             if (r.emoji.name === emojis[1]) {
            //                 embedControl++
            //                 if (embedControl >= embeds.length) embedControl = 0
            //                 return msg.edit({ embeds: [embeds[embedControl]] }).catch(() => { })
            //             }

            //             if (r.emoji.name === emojis[2])
            //                 return collector.stop()

            //             return
            //         })
            //         .on('end', () => {
            //             msg.reactions.removeAll().catch(() => { })
            //             let cancelEmbed = embeds[embedControl]
            //             cancelEmbed.color = client.red

            //             return msg.edit({
            //                 content: `${e.Deny} | Comando cancelado.`,
            //                 embeds: [embeds[embedControl]]
            //             })
            //         })
            // }

            // async function injetGlobalBet() {

            //     let value = parseInt(args[2]?.replace(/k/g, '000'))
            //     if (!value || isNaN(value)) return await interaction.reply(`${e.Deny} | Você precisar me dizer um valor válido para iniciar uma aposta global. \`${prefix}bet global init <Quantia>\``)

            //     let data = await Database.User.findOne({ id: author.id }, 'Balance')
            //     if (!data) return await interaction.reply(`${e.Database} | DATABASE | Tente novamente.`)

            //     let money = data?.Balance || 0

            //     if (money <= 0) return await interaction.reply(`${e.Deny} | Você não possui dinheiro para apostar.`)
            //     if (value < 200) return await interaction.reply(`${e.Deny} | No Bet Global, o valor mínimo é de 200 ${moeda}.`)
            //     if (value > money) return await interaction.reply(`${e.Deny} | Você não possui todo esse dinheiro.`)

            //     Database.subtract(author.id, value)
            //     Database.PushTransaction(author.id, `${e.loss} Injetou ${value} Safiras no *bet global*`)
            //     await Database.Client.updateOne(
            //         { id: client.user.id },
            //         {
            //             $push: {
            //                 ['GlobalBet.Bets']: {
            //                     betId: passCode(5),
            //                     userId: author.id,
            //                     Value: value
            //                 }
            //             },
            //             $inc: { ['GlobalBet.totalValue']: value }
            //         }
            //     )

            //     return await interaction.reply(`${e.Check} | Sua aposta de **${value} ${moeda}** foi injetada na Global Bet! Agora basta aguardar até alguém apostar com você!`)
            // }

            // function EmbedGenerator(dataArray, personal = false) {

            //     let value = 10,
            //         Page = 1,
            //         embeds = [],
            //         length = dataArray.length / 10 <= 1 ? 1 : parseInt((dataArray.length / 10) + 1)

            //     function map(bet) {

            //         return personal
            //             ? bet.userId === author.id
            //                 ? `\`${bet.betId}\``
            //                 : `~~\`${bet.betId}\`~~`
            //             : bet.userId === author.id
            //                 ? `~~\`${bet.betId}\`~~`
            //                 : `\`${bet.betId}\``
            //     }

            //     for (let i = 0; i < dataArray.length; i += 10) {

            //         let current = dataArray.slice(i, value),
            //             description = current.map(bet => `🆔 ${map(bet)} | ${bet.Value} ${moeda}`).join('\n'),
            //             PageCount = length > 1 ? ` - ${Page}/${length}` : ''

            //         if (current.length > 0) {

            //             let embed = {
            //                 color: client.blue,
            //                 title: `🌎  ${client.user.username} Global Bet${PageCount}${personal ? ' | Personal Bets' : ''}`,
            //                 description: `${description}`,
            //                 footer: {
            //                     text: `${dataArray.length} apostas contabilizadas`
            //                 },
            //             }

            //             !personal
            //                 ? embed.fields = [
            //                     {
            //                         name: `${e.Info} Adicional informativo`,
            //                         value: `1. \`${prefix}bet global <IdDaAposta>\` - Comece uma aposta global\n2. Apostas ~~riscadas~~ são as suas apostas\n3. \`${prefix}bet global me\` - Mostra somente suas apostas`
            //                     }
            //                 ]
            //                 : embed.fields = [
            //                     {
            //                         name: `${e.Info} Adicional informativo`,
            //                         value: `\`${prefix}bet global delete <IdDaAposta>\` - Delete uma aposta e receba o dinheiro de volta`
            //                     }
            //                 ]

            //             embeds.push(embed)
            //             Page++
            //             value += 10

            //         }

            //     }

            //     return embeds;
            // }

            // async function valideAndInitGlobalBet(betIdGiven) {

            //     /**
            //      * betObject = {
            //      *    betId: passCode(5),
            //      *    userId: author.id,
            //      *    Value: value
            //      * }
            //      */

            //     let data = await Database.Client.findOne({ id: client.user.id }, 'GlobalBet'),
            //         allBets = data?.GlobalBet?.Bets,
            //         authorData = await Database.User.findOne({ id: author.id }, 'Balance'),
            //         Money = parseInt(authorData?.Balance) || 0

            //     if (!allBets || allBets.length === 0)
            //         return await interaction.reply(`${e.Deny} | Não há nenhuma aposta global aberta no momento.`)

            //     if (Money <= 0)
            //         return await interaction.reply(`${e.Deny} | Você não tem 1 centavo. O que você quer nas apostas globais?`)

            //     let bet = allBets.find(d => d.betId === betIdGiven)

            //     if (!bet)
            //         return await interaction.reply(`${e.Deny} | Essa aposta não existe ou não está mais disponível na tabela global.`)

            //     let betAuthor = client.users.cache.get(bet.userId)

            //     if (!betAuthor) {
            //         deleteBetFromDatabase(betIdGiven)
            //         return await interaction.reply(`${e.Deny} | Eu não achei o criador da aposta **\`${betIdGiven}\`** em lugar nenhum. Foi mal, mas vou deletar essa aposta.`)
            //     }

            //     if (!bet)
            //         return await interaction.reply(`${e.Deny} | Não existe nenhuma aposta com o id **"${betIdGiven}**".`)

            //     if (bet.userId === author.id)
            //         return await interaction.reply(`${e.Deny} | Você não pode apostar com você mesmo.`)

            //     if (Money < bet.Value)
            //         return await interaction.reply(`${e.Deny} | O valor da aposta \`${betIdGiven}\` é de **${bet.Value} ${moeda}**. E claro, você não tem esse dinheiro.`)

            //     return confirmGlobalBetExec(bet.betId, bet.Value, betAuthor)

            // }

            // async function confirmGlobalBetExec(betId, betValue, betAuthor) {

            //     Database.subtract(author.id, betValue)

            //     let emojis = ['✅', '❌'],
            //         msg = await await interaction.reply(`${e.QuestionMark} | Você realmente deseja efetuar essa aposta global no valor de **${betValue} ${moeda}**?`),
            //         started = false

            //     for (let i of emojis) msg.react(i).catch(() => { })

            //     let collector = msg.createReactionCollector({
            //         filter: (reaction, user) => emojis.includes(reaction.emoji.name) && user.id === author.id,
            //         time: 30000,
            //         erros: ['time']
            //     })
            //         .on('collect', (reaction) => {

            //             if (reaction.emoji.name === emojis[1])
            //                 return collector.stop()

            //             started = true
            //             deleteBetFromDatabase(betId)
            //             return startGlobalBet(msg, betId, betValue, betAuthor)
            //         })
            //         .on('end', () => {
            //             if (started) return
            //             msg.edit(`${e.Deny} | Aposta global cancelada.`)
            //             return resetBet(betId, betValue, betAuthor.id)
            //         })
            //     return
            // }

            // async function startGlobalBet(msg, betId, betValue, betAuthor) {

            //     msg.edit(`${e.Check} | Você inicou a aposta global **\`${betId}\`** no valor de **${betValue} ${moeda}**.\n${e.Loading} | Contabilizando, analizando e sorteando...`).catch(() => { })

            //     let winner = [author, betAuthor].random()

            //     return setTimeout(() => {

            //         msg.edit(`👑 | *${winner.tag} - \`${winner.id}\`* ganhou a aposta global no valor de **${betValue} ${moeda}**.`).catch(() => { })
            //         registerTransactions(betValue, winner, winner.id === author.id ? betAuthor : author)
            //     }, 3500)
            // }

            function registerTransactions(betValue, winner, loser) {

                Database.add(winner.id, parseInt(betValue * 2))

                Database.PushTransaction(
                    winner.id,
                    `${e.gain} Ganhou ${betValue} na aposta global contra ${loser.tag}`
                )

                Database.PushTransaction(
                    loser.id,
                    `${e.loss} Perdeu ${betValue} na aposta global contra ${winner.tag}`
                )

                return
            }

            // async function resetBet(betId, betValue, betAuthorId) {
            //     Database.add(author.id, betValue)
            //     await Database.Client.updateOne(
            //         { id: client.user.id },
            //         {
            //             $push: {
            //                 ['GlobalBet.Bets']: {
            //                     betId: betId,
            //                     userId: betAuthorId,
            //                     Value: betValue
            //                 }
            //             }
            //         }
            //     )
            //     return
            // }

            // async function deleteBetFromDatabase(betId) {

            //     await Database.Client.updateOne(
            //         { id: client.user.id },
            //         {
            //             $pull: { ['GlobalBet.Bets']: { betId: betId } }
            //         }
            //     )
            //     return
            // }

            // async function deleteBet(betId) {

            //     if (!betId)
            //         return await interaction.reply(`${e.Info} | Com este comando você deletar apostas globais que você fez. Você pode ver todas as suas apostas usando o comando \`${prefix}bet global me\` e depois \`${prefix}bet global delete <idDaAposta>\``)

            //     if (betId.length !== 5)
            //         return await interaction.reply(`${e.Deny} | ID de aposta inválido.`)

            //     let data = await Database.Client.findOne({ id: client.user.id }, 'GlobalBet.Bets'),
            //         allBets = data?.GlobalBet?.Bets || []

            //     if (!allBets || allBets.length === 0) return await interaction.reply(`${e.Deny} | Não existe nenhuma aposta global no momento.`)

            //     let bets = allBets.filter(x => x.userId === author.id)

            //     if (!bets || bets.length === 0) return await interaction.reply(`${e.Deny} | Você não possui nenhuma aposta global ativa.`)

            //     let betToDelete = bets.find(x => x.betId === betId)

            //     if (!betToDelete) return await interaction.reply(`${e.Deny} | O id **\`${betId}\`** não corresponde a nenhuma aposta global aberta por você.`)

            //     let emojis = ['✅', '❌'],
            //         clicked = false,
            //         msg = await await interaction.reply({
            //             content: `${e.QuestionMark} | Você realmente deseja deletar a aposta **\`${betId}\`** no valor de **${betToDelete.Value} ${moeda}**?`
            //         })

            //     for (let i of emojis) msg.react(i).catch(() => { })

            //     let collector = msg.createReactionCollector({
            //         filter: (reaction, user) => emojis.includes(reaction.emoji.name) && user.id === author.id,
            //         time: 30000,
            //         max: 1,
            //         errors: ['time', 'max']

            //     })
            //         .on('collect', (r) => {

            //             if (r.emoji.name === emojis[1])
            //                 return collector.stop()

            //             clicked = true
            //             Database.add(author.id, betToDelete.Value)
            //             deleteBetFromDatabase(betToDelete.betId)
            //             return msg.edit(`${e.Check} | A aposta global **\`${betId}\`** no valor de **${betToDelete.Value} ${moeda}** foi deletada com sucesso!`).catch(() => { })
            //         })
            //         .on('end', () => {
            //             if (clicked) return
            //             return msg.edit(`${e.Deny} | Comando cancelado.`)
            //         })
            //     return
            // }

        }

        async function betUser() {

            if (user.id === client.user.id) {
                let result = ~~(value * 0.05)
                let msg = ''

                if (result < 20) {
                    msg = 'Sorte sua que o valor calculado foi 0, se não eu ia tirar de você pra deixar de ser esperto*(a)*'
                } else {
                    msg = `Eu tirei 5% (*${result} ${moeda}*) de você pra parar de ser esperto*(a)*.`
                    Database.subtract(author.id, value)
                }

                return await interaction.reply({
                    content: `${e.Deny} | Eu posso manipular as apostas e você tem coragem de apostar comigo? ${msg}`,
                    ephemeral: true
                })
            }

            if (user.id === author.id)
                return await interaction.reply({
                    content: `${e.Deny} | Opa! Nada de apostar contra você mesmo.`,
                    ephemeral: true
                })

            if (!money || money <= 0)
                return await interaction.reply({
                    content: `${e.Deny} | Você não tem dinheiro nenhum... Poxa...`,
                    ephemeral: true
                })

            if (value > money)
                return await interaction.reply({
                    content: `${e.Deny} | Você não possui todo esse dinheiro.`,
                    ephemeral: true
                })

            let memberData = await Database.User.findOne({ id: user.id }, 'Balance')

            let memberMoney = memberData?.Balance || 0

            if (!memberMoney || memberMoney <= 0)
                return await interaction.reply({
                    content: `${e.Deny} | ${user.username} não tem dinheiro pra brincar de apostar.`,
                    ephemeral: true
                })

            if (value > memberMoney)
                return await interaction.reply({
                    content: `${e.Deny} | ${user.username} não tem todo o dinheiro da aposta.`,
                    ephemeral: true
                })

            let buttons = [
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
                            custom_id: 'cancel',
                            style: 'DANGER'
                        }
                    ]
                }
            ]

            Database.subtract(author.id, value)

            let msg = await interaction.reply({
                content: `${e.QuestionMark} | ${user}, você está sendo desafiado por ${author} para um *bet* no valor de **${value} ${moeda}**.\n> *A aposta será realizada no momento em que ${user.displayName} clicar em "aceitar".*`,
                components: buttons,
                fetchReply: true
            }), collected = false

            let collector = msg.createMessageComponentCollector({
                filter: int => [user.id, author.id].includes(int.user.id),
                time: 60000,
            })
                .on('collect', int => {
                    int.deferUpdate().catch(() => { })

                    const { customId, user: u } = int

                    if (customId === 'cancel') return collector.stop()

                    if (customId === 'accept' && u.id !== user.id) return

                    Database.subtract(user.id, value)
                    collected = true
                    msg.delete().catch(() => { })
                    return executeBet()
                })
                .on('end', () => {
                    if (collected) return
                    Database.add(author.id, value)
                    return msg.edit({
                        content: `${e.Deny} | Aposta cancelada.`,
                        components: []
                    }).catch(() => { })
                })

            async function executeBet() {

                let winner = [author, user].random()
                let loser = winner.id === user.id ? author : user

                let taxa = parseInt((value * 0.05).toFixed(0)), taxaValidate = ''

                if (value >= 1000) {
                    value -= taxa
                    taxaValidate = `\n${e.Taxa} | *Apostas maiores que 1000 ${moeda} tem uma taxa de 5% (-${taxa})*`
                }

                channel.send(`👑 | ${winner} ganhou a aposta contra ${loser}! E com sua vitória, faturou **${value} ${moeda}**.${taxaValidate}`)

                return paymentAndRegister(winner, loser, value, taxa)
            }

            async function paymentAndRegister(winner, loser, value, taxa = 0) {

                let prize = parseInt((value + taxa) * 2)

                Database.add(winner.id, prize)

                Database.PushTransaction(
                    winner.id,
                    `${e.gain} Ganhou ${value} Safiras apostando contra ${loser.tag}`
                )

                Database.PushTransaction(
                    loser.id,
                    `${e.loss} Perdeu ${value} Safiras apostando contra ${winner.tag}`
                )
            }

            return

        }

    }
}