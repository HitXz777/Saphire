module.exports = {
    name: 'jogodavelha',
    aliases: ['ttt', 'tictactoe'],
    category: 'games',
    emoji: '❌',
    usage: '<ttt> <@user>',
    description: 'Vai um joguinho da velha?',

    run: async (client, message, args, prefix, MessageEmbed, Database) => {

        let emojis = ['❌', '⭕', '➖'],
            e = Database.Emojis,
            amount, isBet, moeda, initiated, autoPlay

        if (['bet', 'apostar', 'aposta'].includes(args[0]?.toLowerCase())) {

            amount = parseInt(args[2]?.replace(/k/g, '000'))

            if (!args[1])
                return message.reply(`${e.Info} | O jogo da velha versão bet é simples. Quem ganhar o jogo da velha, ganha a aposta.\n${e.Gear} Comando: \`${prefix}ttt bet @user Quantia\``)

            if (!amount || isNaN(amount))
                return message.reply(`${e.Deny} | Você precisa dizer uma quantia válida para apostar no jogo da velha. Exemplo: \`${prefix}ttt bet @user Quantia\``)

            if (amount <= 0)
                return message.reply(`${e.Deny} | A quantia para iniciar uma aposta deve maior que 0, não é?`)

            let Moeda = require('../../../modules/functions/public/moeda')
            isBet = true
            moeda = await Moeda(message)
        }

        let user = getUser(isBet)

        if (!user)
            return message.reply(`${e.Info} | Você precisa me dizer um adversário para jogar.`)

        if (user.id === message.author.id)
            return message.reply(`${e.Deny} | Você não pode jogar contra você mesmo.`)

        if (user.id === client.user.id) autoPlay = true

        if (user.id !== client.user.id && (user?.bot || user?.user?.bot))
            return message.reply(`${e.Deny} | Nada de jogar contra bots. Eles são mais inteligentes do que você.`)

        let playNow = [message.author.id, user.id][Math.floor(Math.random() * 2)]

        if (autoPlay) playNow = message.author.id

        const aButtons = [
            {
                type: 1,
                components: [
                    {
                        type: 2,
                        emoji: '➖',
                        custom_id: 'a1',
                        style: 'SECONDARY'
                    },
                    {
                        type: 2,
                        emoji: '➖',
                        custom_id: 'a2',
                        style: 'SECONDARY'
                    },
                    {
                        type: 2,
                        emoji: '➖',
                        custom_id: 'a3',
                        style: 'SECONDARY'
                    },
                ],
            },
        ]

        const bButtons = [
            {
                type: 1,
                components: [
                    {
                        type: 2,
                        emoji: '➖',
                        custom_id: 'b1',
                        style: 'SECONDARY'
                    },
                    {
                        type: 2,
                        emoji: '➖',
                        custom_id: 'b2',
                        style: 'SECONDARY'
                    },
                    {
                        type: 2,
                        emoji: '➖',
                        custom_id: 'b3',
                        style: 'SECONDARY'
                    },
                ],
            },
        ]

        const cButtons = [
            {
                type: 1,
                components: [
                    {
                        type: 2,
                        emoji: '➖',
                        custom_id: 'c1',
                        style: 'SECONDARY'
                    },
                    {
                        type: 2,
                        emoji: '➖',
                        custom_id: 'c2',
                        style: 'SECONDARY'
                    },
                    {
                        type: 2,
                        emoji: '➖',
                        custom_id: 'c3',
                        style: 'SECONDARY'
                    },
                ],
            },
        ]

        const confirmAndDeclineButton = [
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

        let buttons = [aButtons, bButtons, cButtons].flat(),
            disabled = false, msg

        return confirmationMatch()

        async function confirmationMatch() {

            if (isBet) {

                if (autoPlay) return message.reply(`${e.Deny} | Foi mal, mas eu não aposto.`)

                let authorMoney = await Database.balance(message.author.id),
                    userMoney = await Database.balance(user.id)

                if (!authorMoney || authorMoney < amount)
                    return message.reply(`${e.Deny} | Você não tem todo esse dinheiro para apostar.`)

                if (!userMoney || userMoney < amount)
                    return message.reply(`${e.Deny} | ${user} não tem todo esse dinheiro.`)

            }

            msg = await message.channel.send({
                content: `${e.Loading} | ${user}, você está sendo desafiado para uma partida de *Jogo da Velha* por ${message.author}.\n${isBet ? `${e.MoneyWithWings} | Valor da aposta: ${amount} ${moeda}` : ''}`,
                components: confirmAndDeclineButton
            })

            if (autoPlay) return startGame()

            return collector = msg.createMessageComponentCollector({
                filter: int => [message.author.id, user.id].includes(int.user.id),
                time: 60000
            })
                .on('collect', (interaction) => {
                    interaction.deferUpdate().catch(() => { })

                    let customId = interaction.customId

                    if (customId === 'accept' && interaction.user.id === user.id)
                        return startGame(isBet, amount, collector)

                    if (customId === 'deny')
                        return collector.stop()

                    if (interaction.user.id === message.author.id && customId === 'accept') return

                    return collector.stop()
                })

                .on('end', () => {
                    if (initiated) return
                    return msg.edit({ content: `${e.Deny} | Jogo cancelado.`, components: [] }).catch(() => { })
                })

        }

        async function startGame(isBet = false, amount = 0, collector) {

            initiated = true
            if (collector) collector.stop()
            if (isBet)
                subtractMoney(amount)

            msg.edit({
                content: `${e.Loading} | <@${playNow}>, é sua vez.\n${isBet ? `${e.MoneyWithWings} | Bet Match | ${amount} ${moeda}` : ''}`,
                components: buttons
            }).catch(() => { })

            return msg.createMessageComponentCollector({
                filter: int => [message.author.id, user.id].includes(int.user.id),
                idle: 15000
            })

                .on('collect', (interaction) => {
                    interaction.deferUpdate().catch(() => { })

                    if (playNow !== interaction.user.id) return

                    let customId = interaction.customId,
                        intUserId = interaction.user.id,
                        emoji = intUserId === message.author.id ? emojis[0] : emojis[1],
                        buttonIndex = { a1: 0, a2: 0, a3: 0, b1: 1, b2: 1, b3: 1, c1: 2, c2: 2, c3: 2 }[`${customId}`]

                    playNow = playNow === message.author.id ? user.id : message.author.id
                    return setTicTacToePlace(customId, buttonIndex, intUserId, emoji, playNow)
                })

                .on('end', () => {
                    if (disabled) return
                    if (isBet) addMoney(true)
                    return msg.edit({ content: `${e.Deny} | Jogo cancelado, ${playNow === message.author.id ? user : message.author} ganhou por W.O! ${isBet ? `Como <@${playNow}> demorou muito para responder, eu devolvi o dinheiro pros dois.` : ''}`, components: [] })
                })

        }

        function setTicTacToePlace(customId, buttonIndex, userId, emoji, playingNow) {

            let button = buttons[buttonIndex]?.components.find(data => data.custom_id === customId)
            button.disabled = true
            button.emoji = emoji
            button.style = userId === message.author.id ? 'SUCCESS' : 'PRIMARY'

            let check = checkAndValidate()

            if (check) return

            msg.edit({
                content: `${e.Loading} | <@${playingNow}>, é sua vez.\n${isBet ? `${e.MoneyWithWings} | Bet Match | ${amount} ${moeda}` : ''}`,
                components: buttons
            }).catch(() => { })

            if (autoPlay && playingNow === client.user.id) {

                setTimeout(() => {
                    let a1 = buttons[0].components[0],
                        a2 = buttons[0].components[1],
                        a3 = buttons[0].components[2],
                        b1 = buttons[1].components[0],
                        b2 = buttons[1].components[1],
                        b3 = buttons[1].components[2],
                        c1 = buttons[2].components[0],
                        c2 = buttons[2].components[1],
                        c3 = buttons[2].components[2],
                        allButtons = [a1, a2, a3, b1, b2, b3, c1, c2, c3]

                    let options = allButtons.filter(buttonFil => buttonFil.emoji === emojis[2]),
                        choise = options[Math.floor(Math.random() * options.length)]

                    buttonIndex = { a1: 0, a2: 0, a3: 0, b1: 1, b2: 1, b3: 1, c1: 2, c2: 2, c3: 2 }[`${choise.custom_id}`]

                    playNow = message.author.id
                    return setTicTacToePlace(choise.custom_id, buttonIndex, client.user.id, emojis[1], playNow)
                }, 1700)
            }

            return
        }

        function checkAndValidate() {

            let a1 = buttons[0].components[0].emoji,
                a2 = buttons[0].components[1].emoji,
                a3 = buttons[0].components[2].emoji,
                b1 = buttons[1].components[0].emoji,
                b2 = buttons[1].components[1].emoji,
                b3 = buttons[1].components[2].emoji,
                c1 = buttons[2].components[0].emoji,
                c2 = buttons[2].components[1].emoji,
                c3 = buttons[2].components[2].emoji,
                allEmojis = [a1, a2, a3, b1, b2, b3, c1, c2, c3]

            let winsArray = [[a1, a2, a3], [b1, b2, b3], [c1, c2, c3], [a1, b1, c1], [a2, b2, c2], [a3, b3, c3], [a1, b2, c3], [a3, b2, c1]]

            for (const array of winsArray) {

                let authorWin = array.every(emoji => emoji === emojis[0])
                let userWin = array.every(emoji => emoji === emojis[1])

                if (authorWin) {
                    win(true)
                    addMoney(false, message.author.id)
                    return true
                }

                if (userWin) {
                    win(false)
                    addMoney(false, user.id)
                    return true
                }

                continue
            }

            let isDraw = allEmojis.every(emoji => emoji !== emojis[2])

            if (isDraw) {
                draw()
                addMoney(true)
                return true
            }

            return false
        }

        async function win(authorWin) {

            disableButtons()

            msg.edit({
                content: `${e.CoroaDourada} | ${authorWin ? message.author : user}, ganhou a partida.`,
                components: buttons
            }).catch(() => { })

            if (user.id === client.user.id) return
            await Database.User.updateOne(
                { id: authorWin ? message.author.id : user.id },
                { $inc: { TicTacToeCount: 1 } }
            )

            return
        }

        function draw() {

            disableButtons()
            return msg.edit({
                content: `🧓 | ${message.author}, ${user}... Deu velha,`,
                components: buttons
            }).catch(() => { })

        }

        function disableButtons() {
            disabled = true
            for (let i = 0; i < 3; i++) {
                let components = buttons[i].components

                for (let index = 0; index < 3; index++)
                    if (!buttons[i].components[index].disabled) components[index].disabled = true
            }
        }

        function getUser() {

            let args0 = args[0]
            if (isBet) args0 = null

            return message.mentions.members.first()
                || message.guild.members.cache.find(data => {
                    return data.displayName?.toLowerCase() === args.join(' ')?.toLowerCase()
                        || [args0?.toLowerCase(), args[1]?.toLowerCase()].includes(data.user.tag?.toLowerCase())
                        || [args0, args[1]].includes(data.user.discriminator)
                        || [args0, args[1], message.mentions.repliedUser?.id].includes(data.id)
                        || [args0?.toLowerCase(), args[1]?.toLowerCase()].includes(data.displayName?.toLowerCase())
                        || data.user.username === args.join(' ')
                })

        }

        function subtractMoney() {
            Database.subtract(message.author.id, amount)
            Database.subtract(user.id, amount)
            return
        }

        async function addMoney(isDraw, winnerId) {

            if (isDraw) {
                Database.add(message.author.id, amount)
                Database.add(user.id, amount)
            } else {
                Database.add(winnerId, amount * 2)
                Database.PushTransaction(winnerId, `${e.gain} Ganhou ${amount} Safiras em um *Jogo da Velha Bet* contra ${client.users.cache.get(winnerId === message.author.id ? message.author.id : user.id)?.tag}`)
                Database.PushTransaction(winnerId === message.author.id ? user.id : message.author.id, `${e.loss} Perdeu ${amount} Safiras em um *Jogo da Velha Bet* contra ${client.users.cache.get(user.id)?.tag}`)
            }
            return
        }

    }
}