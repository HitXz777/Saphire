module.exports = {
    name: 'jogodememoria',
    aliases: ['jogodamemoria', 'memorygame', 'jdm', 'gm', 'mg', 'memory', 'memoria', 'memória'],
    category: 'games',
    emoji: '❔',
    usage: '<gm>',
    description: 'O clássico jogo de memória',

    run: async (client, message, args, prefix, MessageEmbed, Database) => {

        let e = Database.Emojis,
            defaultEmoji = e.duvida || '❔'

        if (['help', 'info', 'ajuda'].includes(args[0]?.toLowerCase()))
            return message.reply({
                embeds: [
                    new MessageEmbed()
                        .setColor(client.blue)
                        .setTitle(`${defaultEmoji} Memory Game - Modos`)
                        .setDescription('Aqui é onde você consegue escolher os modos de jogos. Cada modo tem suas características')
                        .addFields(
                            {
                                name: '👤 Solo | Sozinho',
                                value: 'Jogue com você e apenas você.'
                            },
                            {
                                name: '🤝 Coop | Cooperativo',
                                value: 'Jogue junto com um amigo, cada um escolhe um emoji e tentam completar o jogo junto.'
                            },
                            {
                                name: '⚔️ Competitivo',
                                value: 'Aquele que achar mais pares ganha.'
                            },
                            {
                                name: '⏳ Limitado',
                                value: 'Você tem apenas 1:30 (um minuto e trinta segundos) para completar o jogo.'
                            }
                        )
                ]
            })

        let emojis = [['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤎', '🤍', '💖'], ['🇧🇷', '🏳️‍🌈', '🇺🇸', '🇻🇳', '🇹🇷', '🇦🇺', '🇨🇺', '🇪🇨', '🇯🇵', '🇰🇷'], ['🐶', '🐱', '🐨', '🐯', '🐒', '🐷', '🐦', '🐥', '🐺', '🦅'], ['🍎', '🍓', '🍒', '🍐', '🍊', '🌶️', '🥝', '🍇', '🥕', '🍌'], ['🎱', '⚽', '🏀', '🏈', '⚾', '🎾', '🪃', '🏐', '🏉', '🥏']][Math.floor(Math.random() * 5)],
            alreadyUsed = [], emojisClicked = [], toComplete = [], gameData = { author: 0, user: 0, limiteTimeSet: 0 }, firstButtonClicked, finished, restauring, msg, playingNow, user, gameMode,
            indexButton = { a1: 0, a2: 0, a3: 0, a4: 0, a5: 0, b1: 1, b2: 1, b3: 1, b4: 1, b5: 1, c1: 2, c2: 2, c3: 2, c4: 2, c5: 2, d1: 3, d2: 3, d3: 3, d4: 3, d5: 3 },
            emojiButton = { a1: getEmojis(), a2: getEmojis(), a3: getEmojis(), a4: getEmojis(), a5: getEmojis(), b1: getEmojis(), b2: getEmojis(), b3: getEmojis(), b4: getEmojis(), b5: getEmojis(), c1: getEmojis(), c2: getEmojis(), c3: getEmojis(), c4: getEmojis(), c5: getEmojis(), d1: getEmojis(), d2: getEmojis(), d3: getEmojis(), d4: getEmojis(), d5: getEmojis() },
            aButtons = [{ type: 1, components: [] }], bButtons = [{ type: 1, components: [] }], cButtons = [{ type: 1, components: [] }], dButtons = [{ type: 1, components: [] }]

        for (let i = 1; i < 6; i++) {
            aButtons[0].components.push({ type: 2, emoji: defaultEmoji, custom_id: `a${i}`, style: 'SECONDARY' })
            bButtons[0].components.push({ type: 2, emoji: defaultEmoji, custom_id: `b${i}`, style: 'SECONDARY' })
            cButtons[0].components.push({ type: 2, emoji: defaultEmoji, custom_id: `c${i}`, style: 'SECONDARY' })
            dButtons[0].components.push({ type: 2, emoji: defaultEmoji, custom_id: `d${i}`, style: 'SECONDARY' })
        }

        let buttons = [aButtons, bButtons, cButtons, dButtons].flat()

        if (['solo', 'sozinho', 'me', 'alone', 's'].includes(args[0]?.toLowerCase())) return startMemoryGame()
        if (['limitado', 'limite', 'tempo', 'corrido', 't'].includes(args[0]?.toLowerCase())) return startMemoryGame('time')
        if (['coop', 'cooperatico', 'c'].includes(args[0]?.toLowerCase())) return getUserAndStartGame('coop')
        if (['competitive', 'competitivo', 'comp'].includes(args[0]?.toLowerCase())) return getUserAndStartGame('competitive')
        return confirmGameMode()

        async function confirmGameMode() {

            let data = {
                buttons: [{ type: 1, components: [] }],
                canceled: false,
                buttonsCustom_id: [{ label: 'Solo', style: 'PRIMARY', customId: 'solo' }, { label: 'Coop', customId: 'coop', style: 'PRIMARY' }, { label: 'Competitivo', customId: 'competitive', style: 'PRIMARY' }, { label: 'Limitado', customId: 'limited', style: 'PRIMARY' }, { label: 'Cancelar', customId: 'cancel', style: 'DANGER' }]
            }

            for (let button of data.buttonsCustom_id)
                data.buttons[0].components.push({ type: 2, label: button.label, custom_id: button.customId, style: button.style })

            msg = await message.reply({
                embeds: [
                    new MessageEmbed()
                        .setColor(client.blue)
                        .setTitle(`${defaultEmoji} Memory Game - Modos`)
                        .setDescription('Aqui é onde você consegue escolher os modos de jogos. Cada modo tem suas características')
                        .addFields(
                            {
                                name: '👤 Solo | Sozinho',
                                value: 'Jogue com você e apenas você.'
                            },
                            {
                                name: '🤝 Coop | Cooperativo',
                                value: 'Jogue junto com um amigo, cada um escolhe um emoji e tentam completar o jogo junto.'
                            },
                            {
                                name: '⚔️ Competitivo',
                                value: 'Aquele que achar mais pares ganha.'
                            },
                            {
                                name: '⏳ Limitado',
                                value: 'Você tem apenas 1:30 (um minuto e trinta segundos) para completar o jogo.'
                            }
                        )
                ],
                components: data.buttons
            })

            return msg.createMessageComponentCollector({
                filter: int => int.user.id === message.author.id,
                time: 30000,
                max: 1,
                errors: ['time']
            })
                .on('collect', interaction => {
                    interaction.deferUpdate().catch(() => { })

                    switch (interaction.customId) {
                        case 'cancel': data.canceled = true; break;
                        case 'solo': startMemoryGame(); break;
                        case 'limited': startMemoryGame('time'); break;
                        case 'coop': getUserAndStartGame('coop'); break;
                        case 'competitive': getUserAndStartGame('competitive'); break;
                        default: data.canceled = true; break;
                    }

                    return
                })
                .on('end', () => {
                    if (data.canceled)
                        return msg.edit({ content: `${e.Deny} | Comando cancelado.`, embeds: [], components: [] })

                    return msg.delete().catch(() => { })
                })
        }

        async function startMemoryGame(limited = 'idle') {

            if (limited === 'time') gameData.limiteTimeSet = Date.now()

            msg = await message.reply({
                content: `${e.Loading} | **Memory Game** | Tente achar os pares de emojis iguais.\n${e.Info} | Clique nos botões com calma para não estragar o jogo.${limited === 'time' ? '\n⏱️ | Tempo corrido ativado.' : ''}${user ? `\n${gameMode === 'coop' ? '🤝 | Modo cooperação' : '⚔️ | Modo competitivo'} ativado.\n👉 | <@${playingNow}> é sua vez.` : ''}`,
                components: buttons
            }),
                collector = msg.createMessageComponentCollector({
                    filter: int => gameMode ? [user?.id, message.author.id].includes(int.user.id) : int.user.id === message.author.id,
                    [limited]: limited === 'time' ? 90000 : 30000,
                    errors: ['idle']
                })
                    .on('collect', interaction => {
                        interaction.deferUpdate().catch(() => { })

                        if (restauring) return

                        if (gameMode) {
                            if (interaction.user.id !== playingNow) return
                            if (gameMode === 'coop') playingNow = playingNow === message.author.id ? user?.id : message.author.id
                        }

                        let customId = interaction.customId,
                            index = indexButton[`${customId}`],
                            emoji = emojiButton[`${customId}`]

                        return tradeAndCheck(customId, index, emoji, limited)
                    })
                    .on('end', () => {
                        if (finished) return
                        return msg.edit({ content: `${e.Deny} | Jogo finalizado, porém incompleto.${limited === 'time' ? '\n⏱️ | Você não conseguiu finalizar a tempo.' : ''}${gameMode ? `\n👥 | Ambos perderam. <@${playingNow}> demorou muito.` : ''}` })
                    })
        }

        async function tradeAndCheck(customId, index, emoji, limited) {

            let button = buttons[index].components.find(data => data.custom_id === customId)

            if (!firstButtonClicked) firstButtonClicked = button

            button.disabled = true
            button.emoji = emoji
            button.style = 'PRIMARY'

            emojisClicked.push(emoji)

            if (emojisClicked.length === 2 && emojisClicked.every(data => data === emoji))
                return await validateMemory(button, emoji, limited)

            gameMode === 'coop'
                ? msg.edit({
                    content: `${e.Loading} | **Memory Game** | Tente achar os pares de emojis iguais.\n${e.Info} | Clique nos botões com calma para não estragar o jogo.${limited === 'time' ? '\n⏱️ | Tempo corrido ativado.' : ''}${user ? `\n${gameMode === 'coop' ? '🤝 | Modo cooperação' : '⚔️ | Modo competitivo'} ativado.\n👉 | <@${playingNow}> é sua vez.` : ''}`,
                    components: buttons
                }).catch(() => { })
                : msg.edit({ components: buttons }).catch(() => { })

            if (emojisClicked.length === 2 && !emojisClicked.every(data => data === emoji))
                return await defaultMemory(button)

            return
        }

        function validateMemory(button, emoji, limited) {
            button.style = 'SUCCESS'
            firstButtonClicked.style = 'SUCCESS'
            toComplete.push(emoji)
            emojisClicked = []

            if (gameMode === 'competitive')
                playingNow === message.author.id
                    ? gameData.author++
                    : gameData.user++

            if (toComplete.length === 10) {

                if (gameData.author > gameData.user) Database.addItem(message.author.id, 'CompetitiveMemoryCount', 1)
                if (gameData.user > gameData.author) Database.addItem(user.id, 'CompetitiveMemoryCount', 1)

                finished = true
                collector.stop()
                return msg.edit({
                    content: `${e.Check} | Jogo completado com sucesso!${limited === 'time' ? `\n⏱️ | Você venceu o tempo corrido em ${formatTimestamp(gameData.limiteTimeSet)}.` : ''}${user ? `\n${gameMode === 'coop' ? `🤝 | Modo cooperativo bem sucedido.` : `${gameData.author === gameData.user ? '🏳️' : e.CoroaDourada} | ${message.author} ${gameData.author} X ${gameData.user} ${user}`}` : ''}`,
                    components: buttons
                })
            }

            gameMode
                ? msg.edit({
                    content: `${e.Loading} | **Memory Game** | Tente achar os pares de emojis iguais.\n${e.Info} | Clique nos botões com calma para não estragar o jogo.${limited === 'time' ? '\n⏱️ | Tempo corrido ativado.' : ''}${gameMode === 'competitive' ? `\n📝 | ${message.author.username}: ${gameData.author} Pontos\n📝 | ${user.user.username}: ${gameData.user} Pontos` : ''}${user ? `\n${gameMode === 'coop' ? '🤝 | Modo cooperação' : '⚔️ | Modo competitivo'} ativado.\n👉 | <@${playingNow}> é sua vez.` : ''}`,
                    components: buttons
                }).catch(() => { })
                : msg.edit({ components: buttons }).catch(() => { })

            firstButtonClicked = undefined
            return
        }

        function defaultMemory(button) {
            restauring = true
            emojisClicked = []

            return setTimeout(() => {
                button.style = 'SECONDARY'
                button.disabled = false
                button.emoji = defaultEmoji
                firstButtonClicked.style = 'SECONDARY'
                firstButtonClicked.disabled = false
                firstButtonClicked.emoji = defaultEmoji

                gameMode === 'competitive'
                    ? (() => {
                        playingNow = playingNow === message.author.id ? user?.id : message.author.id
                        msg.edit({
                            content: `${e.Loading} | **Memory Game** | Tente achar os pares de emojis iguais.\n${e.Info} | Clique nos botões com calma para não estragar o jogo.${limited === 'time' ? '\n⏱️ | Tempo corrido ativado.' : ''}${gameMode === 'competitive' ? `\n📝 | ${message.author.username}: ${gameData.author} Pontos\n📝 | ${user.user.username}: ${gameData.user} Pontos` : ''}${user ? `\n${gameMode === 'coop' ? '🤝 | Modo cooperação' : '⚔️ | Modo competitivo'} ativado.\n👉 | <@${playingNow}> é sua vez.` : ''}`,
                            components: buttons
                        }).catch(() => { })
                    })()
                    : msg.edit({ components: buttons }).catch(() => { })

                firstButtonClicked = undefined
                restauring = undefined
                return
            }, 1500)
        }

        function getEmojis() {
            let emoji = emojis[Math.floor(Math.random() * emojis.length)],
                test = alreadyUsed.filter(data => data === emoji)

            if (test.length >= 2) return getEmojis()
            alreadyUsed.push(emoji)
            return emoji
        }

        async function getUserAndStartGame(gameModeChoosen) {

            let hasUser = getUser(message), started = false
            if (hasUser?.user.bot) return message.reply(`${e.Deny} | Bots não participam desse game.`)
            if (hasUser) return setAndInit(hasUser)

            let Msg = await message.reply(`${e.Loading} | Ok, vamos lá! Eu não achei nenhum usuário na sua mensagem original... Então, vamos para uma segunda tentativa. Me diga com quem você quer jogar ${gameModeChoosen === 'coop' ? 'no modo cooperativo' : 'no modo competitivo'}`)

            return Msg.channel.createMessageCollector({
                filter: m => m.author.id === message.author.id,
                time: 30000,
                max: 1,
                erros: ['time', 'max']
            })
                .on('collect', Message => {

                    let result = getUser(Message)
                    if (!result) return

                    if (result?.user.bot) return Message.reply(`${e.Deny} | Bots não participam desse game.`)
                    return setAndInit(result)
                })
                .on('end', () => {
                    if (started) return Msg.delete().catch(() => { })
                    return Msg.edit(`${e.Deny} | Não encontrei ninguém... Você precisa me dizer quem é o usuário. Basta @marca-lo ou dizer o nome dele/a. Ou quem sabe dizer o ID? Nome inteiro? Hummm`)
                })

            function setAndInit(result) {
                user = result
                gameMode = gameModeChoosen
                playingNow = [result.id, message.author.id][Math.floor(Math.random() * 2)]
                started = true
                return startMemoryGame(limited = 'idle')
            }

            function getUser(Message) {

                let content = Message.content?.toLowerCase()

                return Message.mentions.members.first()
                    || Message.guild.members.cache.find(data => {
                        return data.displayName?.toLowerCase() === content
                            || data.user.tag?.toLowerCase() === content
                            || data.user.discriminator === content
                            || [content, Message.mentions.repliedUser?.id].includes(data.id)
                            || data.user.username === content
                    })
            }
        }

        function formatTimestamp(timeStamp) {

            const moment = require('moment')

            let now = Date.now(),
                ms = moment(now).diff(moment(timeStamp)),
                date = moment.duration(ms),
                Minutes = date.minutes() > 0 ? `${date.minutes()} minuto` : '',
                Seconds = date.seconds() > 0 ? `${date.seconds()} segundos` : '',
                Ms = ''

            if (Minutes && Seconds) Ms = ' e '

            return `${Minutes}${Ms}${Seconds}`
        }

    }
}