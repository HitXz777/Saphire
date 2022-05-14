const { e } = require('../../../JSON/emojis.json'),
    Moeda = require('../../../modules/functions/public/moeda'),
    Colors = require('../../../modules/functions/plugins/colors'),
    { MessageButton, MessageActionRow } = require('discord.js'),
    passCode = require('../../../modules/functions/plugins/PassCode')

module.exports = {
    name: 'bet',
    aliases: ['apostar', 'aposta'],
    category: 'economy',
    ClientPermissions: ['ADD_REACTIONS'],
    emoji: '💵',
    usage: '<bet> <info>',
    description: 'Aposte dinheiro no chat',

    run: async (client, message, args, prefix, MessageEmbed, Database) => {

        let moeda = await Moeda(message),
            color = await Colors(message.author.id)

        if (!args[0] || ['info', 'ajuda', 'help']?.includes(args[0]?.toLowerCase())) return betInfo()
        if (['global', 'g'].includes(args[0]?.toLowerCase())) return betGlobal()
        if (['party', 'festa', 'p'].includes(args[0]?.toLowerCase())) return betParty()

        let authorData = await Database.User.findOne({ id: message.author.id }, 'Balance Timeouts'),
            quantia = parseInt(args[0].replace(/k/g, '000')),
            Money = parseInt(authorData?.Balance) || 0,
            BetUsers = [],
            LimitUsers = parseInt(args[1]) || 30,
            atualPrize = 0

        if (['all', 'tudo'].includes(args[0]?.toLowerCase())) quantia = parseInt(Money)
        if (isNaN(quantia)) return message.reply(`${e.Deny} | A quantia dada não é um número`)
        if (!quantia || !Money || Money < quantia || quantia < 1) return message.reply(`${e.Deny} | Você não tem todo esse dinheiro na carteira.`)
        if (isNaN(LimitUsers) || LimitUsers > 30 || LimitUsers < 2) return message.reply(`${e.Deny} | O limite de participantes deve estar entre 2~30 usuários.`)

        function BetUsersEmbed() {
            return BetUsers?.length >= 1
                ? BetUsers.map(id => `<@${id}>`).join('\n')
                : 'Ninguém'
        }

        const BetEmbed = new MessageEmbed()
            .setColor('GREEN')
            .setThumbnail('https://imgur.com/k5NKfe8.gif')
            .setTitle(`${message.member.displayName} iniciou uma nova aposta`)
            .setFooter({ text: `Limite máximo: ${LimitUsers} participantes` })

        return Money >= quantia
            ? (() => {
                Database.subtract(message.author.id, quantia)
                atualPrize += quantia
                Database.PushTransaction(message.author.id, `${e.loss} Apostou ${quantia || 0} Safiras no comando bet`)
                BetUsers.push(message.author.id)
                return BetInit()
            })()
            : message.reply(`${e.Deny} | Você está usando o comando errado... Tenta \`${prefix}bet\``)

        async function BetInit() {

            BetEmbed
                .setDescription(`Valor da aposta: ${atualPrize} ${moeda}\n**Participantes**\n${BetUsersEmbed()}\n \n💰 Prêmio acumulado: ${(BetUsers?.length || 0) * quantia}`)

            const buttons = new MessageActionRow()
                .addComponents(
                    new MessageButton()
                        .setCustomId('finish')
                        .setLabel('Finalizar Aposta')
                        .setStyle('PRIMARY')
                )
                .addComponents(
                    new MessageButton()
                        .setCustomId('join')
                        .setLabel('Participar')
                        .setStyle('SUCCESS')
                )
                .addComponents(
                    new MessageButton()
                        .setCustomId('leave')
                        .setLabel('Sair')
                        .setStyle('DANGER')
                )

            let msg = await message.channel.send({ embeds: [BetEmbed], components: [buttons] }),
                collector = msg.createMessageComponentCollector({
                    filter: () => true,
                    time: 120000,
                    errors: ['time']
                })

                    .on('collect', async (interaction) => {
                        interaction.deferUpdate().catch(() => { })

                        let customId = interaction.customId

                        if (customId === 'finish' && interaction.user.id === message.author.id)
                            return collector.stop()

                        if (customId === 'join') {

                            if (BetUsers.includes(interaction.user.id)) return

                            let userData = await Database.User.findOne({ id: interaction.user.id }, 'Balance')

                            if (userData?.Balance < quantia)
                                return message.channel.send(`${e.Deny} | ${interaction.user}, você deve ter pelo menos **${quantia} ${moeda}** na carteira para entrar na aposta.`)

                            Database.subtract(interaction.user.id, quantia)
                            atualPrize += quantia
                            BetUsers.push(interaction.user.id)

                            Database.PushTransaction(interaction.user.id, `${e.loss} Apostou ${quantia || 0} Safiras no comando bet`)

                            BetEmbed.setDescription(`Valor da aposta: ${quantia} ${moeda}\n**Participantes**\n${BetUsersEmbed()}\n \n💰 Prêmio acumulado: ${atualPrize}`)

                            msg.edit({ embeds: [BetEmbed] }).catch(err => {
                                message.channel.send(`${e.Deny} | Houve um erro ao editar a mensagem da aposta.\n\`${err}\``)
                                return collector.stop()
                            })

                            if (BetUsers.length >= LimitUsers)
                                return collector.stop()

                            return
                        }

                        if (customId === 'leave')
                            return RemoveUser(interaction.user)

                    })

                    .on('end', () => Win())

            async function Win() {

                if (BetUsers.length === 0 || BetUsers.length === 1 && BetUsers.includes(message.author.id)) {

                    msg.edit({
                        embeds: [
                            new MessageEmbed()
                                .setColor('RED')
                                .setTitle(`${message.member.displayName} fez uma aposta`)
                                .setThumbnail('https://imgur.com/k5NKfe8.gif')
                                .setDescription(`${BetEmbed.description}\n \n${e.Deny} Essa aposta foi cancelada por não haver participantes suficientes`)
                        ],
                        components: []
                    }).catch(() => { })

                    if (atualPrize > 0) {
                        Database.add(message.author.id, atualPrize)
                        Database.PushTransaction(
                            message.author.id,
                            `${e.gain} Recebeu de volta ${parseInt(atualPrize) || 0} Safiras no comando bet`
                        )
                    }

                    return message.channel.send(`${e.Deny} | ${message.author}, aposta cancelada.`)

                }

                let winner = BetUsers[Math.floor(Math.random() * BetUsers.length)],
                    taxa = parseInt(atualPrize * 0.05).toFixed(0)

                if (taxa > 0) atualPrize -= taxa
                if (atualPrize > 0) Database.add(winner, atualPrize)

                Database.PushTransaction(winner, `${e.gain} Recebeu ${parseInt(atualPrize) || 0} Safiras no comando bet`)

                message.channel.send(`${e.MoneyWings} | <@${winner}> ganhou a aposta no valor de **${atualPrize} ${moeda}** iniciada por ${message.author}.\n${taxa > 0 ? `${e.Taxa} | Taxa cobrada (5%): ${taxa} ${moeda}` : ''}`)
                const NewWinner = new MessageEmbed().setColor('RED').setTitle(`${message.member.displayName} fez uma aposta`).setThumbnail('https://imgur.com/k5NKfe8.gif').setDescription(`${BetEmbed.description}\n \n🏆 <@${winner}> ganhou a aposta`)
                return msg.edit({ embeds: [NewWinner], components: [] }).catch(() => { })

            }

            function RemoveUser(user) {
                if (!BetUsers.includes(user.id)) return

                BetUsers.splice(BetUsers.indexOf(user.id), 1)
                BetEmbed.setDescription(`Valor da aposta: ${quantia} ${moeda}\n**Participantes**\n${BetUsersEmbed()}\n \n💰 Prêmio acumulado: ${(BetUsers?.length || 0) * (quantia || 0)}`)
                msg.edit({ embeds: [BetEmbed] }).catch(() => { })

                Database.add(user.id, quantia)
                Database.PushTransaction(
                    user.id,
                    `${e.gain} Recebeu de volta ${quantia || 0} Safiras no comando bet`
                )
                atualPrize -= quantia
                return
            }
        }

        async function betParty() {

            let amount = parseInt(args[1]?.replace(/k/g, '000')),
                options = [2, 3, 4],
                optionsChoosen = parseInt(args[2])

            if (!args[1])
                return message.reply(`${e.Info} | Você precisa dizer a quantia que deseja para criar a *:tada: Bet Party*. \`${prefix}bet party <Quantia> <2~4>\``)

            if (!amount)
                return message.reply(`${e.Deny} | Você precisa dizer um valor pra iniciar a bet party.`)

            if (amount <= 0)
                return message.reply(`${e.Deny} | O valor tem que ser maior do que 0, né?`)

            let authorBalance = await Database.balance(message.author.id)

            if (authorBalance <= 0)
                return message.reply(`${e.Deny} | Ishhh, você não tem nada...`)

            if (authorBalance < amount)
                return message.reply(`${e.Deny} | Você não tem todo esse dinheiro não...`)

            if (!options.includes(optionsChoosen))
                return message.reply(`${e.Deny} | Você precisa me dizer quantas opções de apostas *(2~5)* vai ter a *:tada: Bet Party*`)

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
                arrayControl = {
                    usersInMatch: [],
                    areas: ['1']
                }

            for (let i = 1; i <= optionsChoosen; i++) {

                buttons.components.push({
                    type: 2,
                    label: `Area ${i}`,
                    custom_id: `${i}`,
                    style: 'PRIMARY'
                })
                arrayControl[`${i}`] = []
                arrayControl.areas.push(`${i}`)
            }

            Database.subtract(message.author.id, amount)
            let prize = 0,
                embed = new MessageEmbed()
                    .setColor(color)
                    .setTitle(':tada: Bet Party')
                    .setDescription(`${message.author} iniciou uma Bet Party!\n \n${e.MoneyWithWings} Valor de entrada: ${amount} ${moeda}`)

            const msg = await message.reply(
                {
                    embeds: [embed],
                    components: [buttons]
                }
            ),
                collector = msg.createMessageComponentCollector({
                    filter: () => true,
                    time: 60000,
                    errors: ['time']
                })

                    .on('collect', async int => {
                        int.deferUpdate().catch(() => { })

                        let customId = int.customId,
                            user = int.user

                        if (customId === 'cancel' && user.id === message.author.id)
                            return collector.stop()

                        if (!arrayControl.areas.includes(customId)) return
                        if (arrayControl.usersInMatch.includes(user.id)) return
                        let userBalance = await Database.balance(user.id)

                        if (userBalance <= 0)
                            return message.reply(`${e.Deny} | ${user}, você não tem nada na sua carteira :(`)

                        if (userBalance < amount)
                            return message.reply(`${e.Deny} | ${user}, você precisa ter **${amount} ${moeda}** para entrar na Bet Party`)

                        arrayControl.usersInMatch.push(user.id)
                        arrayControl[`${customId}`].push(user.id)
                        subtractAndAddPrize(user.id)

                        return message.channel.send(`**:tada: Bet Party** | ${user} entrou na **Area ${customId}**`)
                    })
                    .on('end', () => finishBetParty())

            function subtractAndAddPrize(userId) {
                Database.subtract(userId, amount)
                prize += amount
                attEmbed()
                return
            }

            function attEmbed() {
                embed.description = `${message.author} iniciou uma Bet Party!\n \n${e.MoneyWithWings} Valor de entrada: ${amount} ${moeda}\n${e.gain} Total acumulado: ${prize} ${moeda}\n `

                for (let i = 1; i <= arrayControl.areas.length; i++)
                    if (arrayControl[`${i}`]?.length > 0)
                        embed.description = `${embed.description}\n**Area ${i}**: ${arrayControl[`${i}`].length} players`

                return msg.edit({ embeds: [embed] }).catch(() => { })
            }

            function finishBetParty() {

                let areaChoosen = arrayControl.areas[Math.floor(Math.random() * arrayControl.areas.length)],
                    area = arrayControl[`${areaChoosen}`],
                    allPlayers = arrayControl.usersInMatch

                if (!allPlayers || allPlayers.length === 0) return nobody()

                if (!area || area.length === 0) return nobodyInBetParty()

                let winner = area[Math.floor(Math.random() * area.length)],
                    userUsername = client.users.cache.get(winner)?.tag || 'Indefinido'

                Database.add(winner, prize)
                Database.PushTransaction(winner, `${e.gain} Ganhou ${prize} Safiras em uma *bet party*`)
                msg.edit({ embeds: [embed.setColor(client.red).setTitle(':tada: Bet Party | Cancelada').setFooter({ text: `Ganhador: ${userUsername} | Area ${areaChoosen}` })], components: [] }).catch(() => { })
                return message.channel.send(`**:tada: Bet Party** | A **Area ${areaChoosen}** foi sorteada e o ganhador foi ${message.guild.members.cache.get(winner)}. Prêmio: **${prize} ${moeda}**`)

                function nobodyInBetParty() {
                    Database.add(message.author.id, prize)
                    msg.edit({ embeds: [embed.setColor(client.red).setTitle(':tada: Bet Party | Cancelada').setFooter({ text: `A area sorteada (${areaChoosen}) não tinha ninguém.` })], components: [] }).catch(() => { })
                    return message.channel.send(`**:tada: Bet Party** | A **Area ${areaChoosen}** não tinha ninguém, então o prêmio de **${prize} ${moeda}** foi para ${message.author}.`)
                }

                function nobody() {
                    Database.add(message.author.id, prize)
                    msg.edit({ embeds: [embed.setColor(client.red).setTitle(':tada: Bet Party | Cancelada').setFooter({ text: 'Ninguém participou da Bet Party' })], components: [] }).catch(() => { })
                    return message.channel.send(`**:tada: Bet Party** | Ninguém participou dessa rodada.`)
                }

            }

            return
        }

        async function betGlobal() {
            // return message.reply(`${e.Loading} | Este recurso está em construção...`)

            if (!args[1])
                return message.reply({
                    embeds: [
                        new MessageEmbed()
                            .setColor(color)
                            .setTitle('🌎 Bet Global - (BETA)')
                            .setDescription(`\`${prefix}bet global init <quantia>\` - Injete uma aposta no sistema de apostas globais\n\`${prefix}bet global delete <betId>\` - Delete uma aposta e receba o dinheiro de volta\n\`${prefix}bet global bet\` - Veja todas as apostas globais\n\`${prefix}bet global me\` - Veja todas as suas apostas globais\n\`${prefix}bet global <betId>\` - Aposte contra alguém globalmente`)
                    ]
                })

            if (['init', 'iniciar', 'começar', 'start'].includes(args[1]?.toLowerCase())) return injetGlobalBet()
            if (['bet', 'apostar'].includes(args[1]?.toLowerCase())) return InitGlobalBet()
            if (['me', 'eu', 'i'].includes(args[1]?.toLowerCase())) return personalGlobalBets()
            if (['delete', 'del', 'apagar', 'excluir'].includes(args[1]?.toLowerCase())) return deleteBet(args[2])

            if (args[1].length === 5) return valideAndInitGlobalBet(args[1])

            return message.reply(`${e.Deny} | Sub argumento desconhecido. Use \`${prefix}bet info\` para você obter todas as informações.`)
        }

        async function InitGlobalBet() {

            let data = await Database.Client.findOne({ id: client.user.id }, 'GlobalBet'),
                bets = data?.GlobalBet?.Bets || []

            if (!bets || bets.length === 0) return message.reply(`${e.Deny} | Nenhuma aposta global foi encontrada.`)

            let embeds = EmbedGenerator(bets),
                emojis = ['⬅️', '➡️', '❌'],
                embedControl = 0

            if (!embeds || embeds.length === 0) return message.reply(`${e.Info} | Não tem nenhuma aposta global iniciada. Que tal você iniciar? \`${prefix}bet global init <quantia>\``)

            let msg = await message.reply({ embeds: [embeds[0]] })

            if (embeds.length > 1)
                for (let i of emojis) msg.react(i).catch(() => { })
            else return

            let collector = msg.createReactionCollector({
                filter: (r, u) => emojis.includes(r.emoji.name) && u.id === message.author.id,
                idle: 40000,
                errors: ['idle']
            })
                .on('collect', (r, u) => {

                    if (r.emoji.name === emojis[0]) {
                        embedControl--
                        if (embedControl < 0) embedControl = embeds.length - 1
                        return msg.edit({ embeds: [embeds[embedControl]] }).catch(() => { })
                    }

                    if (r.emoji.name === emojis[1]) {
                        embedControl++
                        if (embedControl >= embeds.length) embedControl = 0
                        return msg.edit({ embeds: [embeds[embedControl]] }).catch(() => { })
                    }

                    if (r.emoji.name === emojis[2])
                        return collector.stop()

                    return
                })
                .on('end', () => {
                    msg.reactions.removeAll().catch(() => { })
                    let cancelEmbed = embeds[embedControl]
                    cancelEmbed.color = client.red

                    return msg.edit({
                        content: `${e.Deny} | Comando cancelado.`,
                        embeds: [embeds[embedControl]]
                    })
                })
        }

        async function personalGlobalBets() {

            let data = await Database.Client.findOne({ id: client.user.id }, 'GlobalBet'),
                allBets = data?.GlobalBet?.Bets || []

            if (!allBets || allBets.length === 0) return message.reply(`${e.Deny} | Nenhuma aposta global foi encontrada.`)

            let bets = allBets.filter(d => d.userId === message.author.id)

            if (!bets || bets.length === 0) return message.reply(`${e.Deny} | Você não possui nenhuma aposta global.`)

            let embeds = EmbedGenerator(bets, true),
                emojis = ['⬅️', '➡️', '❌'],
                embedControl = 0

            let msg = await message.reply({ embeds: [embeds[0]] })

            if (embeds.length > 1)
                for (let i of emojis) msg.react(i).catch(() => { })
            else return

            let collector = msg.createReactionCollector({
                filter: (r, u) => emojis.includes(r.emoji.name) && u.id === message.author.id,
                idle: 40000,
                errors: ['idle']
            })
                .on('collect', (r, u) => {

                    if (r.emoji.name === emojis[0]) {
                        embedControl--
                        if (embedControl < 0) embedControl = embeds.length - 1
                        return msg.edit({ embeds: [embeds[embedControl]] }).catch(() => { })
                    }

                    if (r.emoji.name === emojis[1]) {
                        embedControl++
                        if (embedControl >= embeds.length) embedControl = 0
                        return msg.edit({ embeds: [embeds[embedControl]] }).catch(() => { })
                    }

                    if (r.emoji.name === emojis[2])
                        return collector.stop()

                    return
                })
                .on('end', () => {
                    msg.reactions.removeAll().catch(() => { })
                    let cancelEmbed = embeds[embedControl]
                    cancelEmbed.color = client.red

                    return msg.edit({
                        content: `${e.Deny} | Comando cancelado.`,
                        embeds: [embeds[embedControl]]
                    })
                })
        }

        async function injetGlobalBet() {

            let value = parseInt(args[2]?.replace(/k/g, '000'))
            if (!value || isNaN(value)) return message.reply(`${e.Deny} | Você precisar me dizer um valor válido para iniciar uma aposta global. \`${prefix}bet global init <Quantia>\``)

            let data = await Database.User.findOne({ id: message.author.id }, 'Balance')
            if (!data) return message.reply(`${e.Database} | DATABASE | Tente novamente.`)

            let money = data?.Balance || 0

            if (money <= 0) return message.reply(`${e.Deny} | Você não possui dinheiro para apostar.`)
            if (value < 200) return message.reply(`${e.Deny} | No Bet Global, o valor mínimo é de 200 ${moeda}.`)
            if (value > money) return message.reply(`${e.Deny} | Você não possui todo esse dinheiro.`)

            Database.subtract(message.author.id, value)
            await Database.Client.updateOne(
                { id: client.user.id },
                {
                    $push: {
                        ['GlobalBet.Bets']: {
                            betId: passCode(5),
                            userId: message.author.id,
                            Value: value
                        }
                    },
                    $inc: { ['GlobalBet.totalValue']: value }
                }
            )

            return message.reply(`${e.Check} | Sua aposta de **${value} ${moeda}** foi injetada na Global Bet! Agora basta aguardar até alguém apostar com você!`)
        }

        async function betInfo() {

            let data = await Database.Client.findOne({ id: client.user.id }, 'GlobalBet.totalValue'),
                value = parseInt(data?.GlobalBet?.totalValue || 0)?.toFixed(0)

            let msg = await message.reply({
                embeds: [
                    new MessageEmbed()
                        .setColor(color)
                        .setTitle('💵 Comando Aposta')
                        .setDescription(`Você pode apostar ${moeda} com todos no chat.`)
                        .addFields(
                            {
                                name: `${e.On} Simple Bet`,
                                value: `\`${prefix}bet [quantia] [LimiteDePlayers]\` - Aposte uma quantia`
                            },
                            {
                                name: `:tada: Bet Party`,
                                value: `\`${prefix}bet party [quantia] <QuantidadeDeOpções (2~4)>\` - A bet party é um novo jeito de se apostar.`
                            },
                            {
                                name: '🌎 Bet Global',
                                value: `Total de apostas injetadas: *${value} ${moeda}*\n\`${prefix}bet global init <quantia>\` - Injete uma aposta no sistema de apostas globais\n\`${prefix}bet global delete <betId>\` - Delete uma aposta e receba o dinheiro de volta\n\`${prefix}bet global bet\` - Veja todas as apostas globais\n\`${prefix}bet global me\` - Veja todas as suas apostas globais\n\`${prefix}bet global <betId>\` - Aposte contra alguém globalmente`
                            }
                        )
                ]
            }),
                clicked = false

            msg.react('🌎').catch(() => { })

            return msg.createReactionCollector({
                filter: (r, u) => message.author.id === u.id && r.emoji.name === '🌎',
                max: 1,
                time: 30000,
                errors: ['time', 'max']
            })
                .on('collect', () => {

                    msg.delete().catch(() => { })
                    return InitGlobalBet()
                })
                .on('end', () => {
                    if (clicked) return
                    return msg.reactions.removeAll().catch(() => { })
                })
        }

        function EmbedGenerator(dataArray, personal = false) {

            let amount = 10,
                Page = 1,
                embeds = [],
                length = dataArray.length / 10 <= 1 ? 1 : parseInt((dataArray.length / 10) + 1)

            function map(bet) {

                return personal
                    ? bet.userId === message.author.id
                        ? `~~\`${bet.betId}\`~~`
                        : `\`${bet.betId}\``
                    : bet.userId === message.author.id
                        ? `\`${bet.betId}\``
                        : `~~\`${bet.betId}\`~~`
            }

            for (let i = 0; i < dataArray.length; i += 10) {

                let current = dataArray.slice(i, amount),
                    description = current.map(bet => `🆔 ${map(bet)} | ${bet.Value} ${moeda}`).join('\n'),
                    PageCount = length > 1 ? ` - ${Page}/${length}` : ''

                if (current.length > 0) {

                    let embed = {
                        color: client.blue,
                        title: `🌎  ${client.user.username} Global Bet${PageCount}${personal ? ' | Personal Bets' : ''}`,
                        description: `${description}`,
                        footer: {
                            text: `${dataArray.length} apostas contabilizadas`
                        },
                    }

                    !personal
                        ? embed.fields = [
                            {
                                name: `${e.Info} Adicional informativo`,
                                value: `1. \`${prefix}bet global <IdDaAposta>\` - Comece uma aposta global\n2. Apostas ~~riscadas~~ são as suas apostas\n3. \`${prefix}bet global me\` - Mostra somente suas apostas`
                            }
                        ]
                        : embed.fields = [
                            {
                                name: `${e.Info} Adicional informativo`,
                                value: `\`${prefix}bet global delete <IdDaAposta>\` - Delete uma aposta e receba o dinheiro de volta`
                            }
                        ]

                    embeds.push(embed)
                    Page++
                    amount += 10

                }

            }

            return embeds;
        }

        async function valideAndInitGlobalBet(betIdGiven) {

            /**
             * betObject = {
             *    betId: passCode(5),
             *    userId: message.author.id,
             *    Value: value
             * }
             */

            let data = await Database.Client.findOne({ id: client.user.id }, 'GlobalBet'),
                allBets = data?.GlobalBet?.Bets,
                authorData = await Database.User.findOne({ id: message.author.id }, 'Balance'),
                Money = parseInt(authorData?.Balance) || 0

            if (!allBets || allBets.length === 0)
                return message.reply(`${e.Deny} | Não há nenhuma aposta global aberta no momento.`)

            if (Money <= 0)
                return message.reply(`${e.Deny} | Você não tem 1 centavo. O que você quer nas apostas globais?`)

            let bet = allBets.find(d => d.betId === betIdGiven)

            let betAuthor = client.users.cache.get(bet.userId)

            if (!betAuthor) {
                deleteBetFromDatabase(betIdGiven)
                return message.reply(`${e.Deny} | Eu não achei o criador da aposta **\`${betIdGiven}\`** em lugar nenhum. Foi mal, mas vou deletar essa aposta.`)
            }

            if (!bet)
                return message.reply(`${e.Deny} | Não existe nenhuma aposta com o id **"${betIdGiven}**".`)

            if (bet.userId === message.author.id)
                return message.reply(`${e.Deny} | Você não pode apostar com você mesmo.`)

            if (Money < bet.Value)
                return message.reply(`${e.Deny} | O valor da aposta \`${betIdGiven}\` é de **${bet.Value} ${moeda}**. E claro, você não tem esse dinheiro.`)

            return confirmGlobalBetExec(bet.betId, bet.Value, betAuthor)

        }

        async function confirmGlobalBetExec(betId, betValue, betAuthor) {

            deleteBetFromDatabase(betId)
            Database.subtract(message.author.id, betValue)

            let emojis = ['✅', '❌'],
                msg = await message.reply(`${e.QuestionMark} | Você realmente deseja efetuar essa aposta global no valor de **${betValue} ${moeda}**?`),
                started = false

            for (let i of emojis) msg.react(i).catch(() => { })

            let collector = msg.createReactionCollector({
                filter: (reaction, user) => emojis.includes(reaction.emoji.name) && user.id === message.author.id,
                time: 30000,
                erros: ['time']
            })
                .on('collect', (reaction) => {

                    if (reaction.emoji.name === emojis[1])
                        return collector.stop()

                    started = true
                    return startGlobalBet(msg, betId, betValue, betAuthor)
                })
                .on('end', () => {
                    if (started) return
                    msg.edit(`${e.Deny} | Aposta global cancelada.`)
                    return resetBet(betId, betValue, betAuthor.id)
                })
            return
        }

        async function startGlobalBet(msg, betId, betValue, betAuthor) {

            msg.edit(`${e.Check} | Você inicou a aposta global **\`${betId}\`** no valor de **${betValue} ${moeda}**.\n${e.Loading} | Contabilizando, analizando e sorteando...`).catch(() => { })

            let winner = [message.author, betAuthor][Math.floor(Math.random() * 2)]

            return setTimeout(() => {

                msg.edit(`👑 | *${winner.tag} - \`${winner.id}\`* ganhou a aposta global no valor de **${betValue} ${moeda}**.`).catch(() => { })
                registerTransactions(betValue, winner, winner.id === message.author.id ? betAuthor : message.author)
            }, 3500)
        }

        function registerTransactions(betValue, winner, loser) {

            Database.add(winner.id, betValue)

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

        async function resetBet(betId, betValue, betAuthorId) {
            Database.add(message.author.id, betValue)
            await Database.Client.updateOne(
                { id: client.user.id },
                {
                    $push: {
                        ['GlobalBet.Bets']: {
                            betId: betId,
                            userId: betAuthorId,
                            Value: betValue
                        }
                    }
                }
            )
            return
        }

        async function deleteBetFromDatabase(betId) {

            await Database.Client.updateOne(
                { id: client.user.id },
                {
                    $pull: { ['GlobalBet.Bets']: { betId: betId } }
                }
            )
            return
        }

        async function deleteBet(betId) {

            if (!betId)
                return message.reply(`${e.Info} | Com este comando você deletar apostas globais que você fez. Você pode ver todas as suas apostas usando o comando \`${prefix}bet global me\` e depois \`${prefix}bet global delete <idDaAposta>\``)

            if (betId.length !== 5)
                return message.reply(`${e.Deny} | ID de aposta inválido.`)

            let data = await Database.Client.findOne({ id: client.user.id }, 'GlobalBet.Bets'),
                allBets = data?.GlobalBet?.Bets || []

            if (!allBets || allBets.length === 0) return message.reply(`${e.Deny} | Não existe nenhuma aposta global no momento.`)

            let bets = allBets.filter(x => x.userId === message.author.id)

            if (!bets || bets.length === 0) return message.reply(`${e.Deny} | Você não possui nenhuma aposta global ativa.`)

            let betToDelete = bets.find(x => x.betId === betId)

            if (!betToDelete) return message.reply(`${e.Deny} | O id **\`${betId}\`** não corresponde a nenhuma aposta global aberta por você.`)

            let emojis = ['✅', '❌'],
                clicked = false,
                msg = await message.reply({
                    content: `${e.QuestionMark} | Você realmente deseja deletar a aposta **\`${betId}\`** no valor de **${betToDelete.Value} ${moeda}**?`
                })

            for (let i of emojis) msg.react(i).catch(() => { })

            let collector = msg.createReactionCollector({
                filter: (reaction, user) => emojis.includes(reaction.emoji.name) && user.id === message.author.id,
                time: 30000,
                max: 1,
                errors: ['time', 'max']

            })
                .on('collect', (r) => {

                    if (r.emoji.name === emojis[1])
                        return collector.stop()

                    clicked = true
                    Database.add(message.author.id, betToDelete.Value)
                    deleteBetFromDatabase(betToDelete.betId)
                    return msg.edit(`${e.Check} | A aposta global **\`${betId}\`** no valor de **${betToDelete.Value} ${moeda}** foi deletada com sucesso!`).catch(() => { })
                })
                .on('end', () => {
                    if (clicked) return
                    return msg.edit(`${e.Deny} | Comando cancelado.`)
                })
            return
        }

    }
}