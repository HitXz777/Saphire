const { e } = require('../../../JSON/emojis.json')
const quizData = require('../../../JSON/quiz.json')

module.exports = {
    name: 'quiz',
    category: 'games',
    emoji: `${e.QuestionMark}`,
    usage: 'quiz <info>',
    description: 'Quiz é bem legal, garanto.',

    run: async (client, message, args, prefix, MessageEmbed, Database) => {

        let rankingControl = [],
            timesSkiped = 0,
            accept = false,
            skipped = false,
            fastMode = 25000

        if (!args[0] || ['help', 'info', 'ajuda'].includes(args[0]?.toLowerCase())) return quizInfo()
        if (['status', 'stats', 'st'].includes(args[0]?.toLowerCase())) return quizStatus()
        if (['start', 'começar', 'init', 's'].includes(args[0]?.toLowerCase())) return init()
        if (['reset', 'reboot', 'r', 'del', 'delete'].includes(args[0]?.toLowerCase())) return resetQuizChannels()
        return quizInfo()

        async function quizStatus() {

            let user = message.mentions.users.first() || message.mentions.repliedUser || client.users.cache.find(data => data.username?.toLowerCase() === args.join(' ')?.toLowerCase() || data.tag?.toLowerCase() === args[0]?.toLowerCase() || data.discriminator === args[0] || data.id === args[0]) || message.author

            let data = await Database.User.findOne({ id: user.id }, 'QuizCount'),
                acertos = data.QuizCount || 0

            return message.reply(`${e.QuestionMark} | ${user.id === message.author.id ? 'Você' : user.username} acertou **${acertos}** perguntas no quiz.`)

        }

        function quizInfo() {
            return message.reply(
                {
                    embeds: [
                        new MessageEmbed()
                            .setColor(client.blue)
                            .setTitle(`${e.QuestionMark} ${client.user.username} Quiz`)
                            .addFields(
                                {
                                    name: `${e.On} Inicie um Quiz`,
                                    value: `\`${prefix}quiz start\``
                                },
                                {
                                    name: '⏩ Pule perguntas',
                                    value: 'Quando o quiz estiver ativado, fale "**skip**"'
                                },
                                {
                                    name: '⚡ Speed Mode',
                                    value: `\`${prefix}quiz start speed\``
                                },
                                {
                                    name: `${e.Info} Confira os acertos`,
                                    value: `\`${prefix}quiz status [@user]\``
                                },
                                {
                                    name: `${e.CoroaDourada} Aceita um ranking?`,
                                    value: `\`${prefix}rank quiz\``
                                },
                                {
                                    name: `${e.Info} Informações adicionais`,
                                    value: `O tempo normal das perguntas é de 30 segundos, speed mode é 5 segundos.`
                                }
                            )
                            .setFooter({ text: `${quizData?.length || 0} perguntas ativas` })
                    ]
                }
            )
        }

        async function init(isJumped) {

            let query = quizData[Math.floor(Math.random() * quizData.length)],
                question = query.question,
                answer = query.answers

            accept = false

            if (isJumped) return start(question, answer)

            let clientData = await Database.Client.findOne({ id: client.user.id }, 'QuizChannels'),
                channelsBlockToInit = clientData.QuizChannels || []

            if (!channelsBlockToInit || channelsBlockToInit.includes(message.channel.id))
                return message.reply(`${e.Deny} | Já tem um quiz rolando nesse chat.`).then(m => setTimeout(() => m.delete().catch(() => { }), 2500))

            if (['fast', 'rapido', 'rápido', 'speed'].includes(args[1]?.toLowerCase())) fastMode = 5000

            let msg = await message.channel.send(`${e.Loading} | ${fastMode === 5000 ? '⚡ **Speed Mode** | ' : ''}Inicializando Quiz... Prepare-se!`)

            registerChannel(message.channel.id)
            return setTimeout(() => start(question, answer, msg), 3000)

        }

        async function start(question, answer, MessageToDelete) {
            MessageToDelete?.delete().catch(() => { })
            skipped = false

            if (!question || !answer) {
                await pullChannel(message.channel.id)
                message.reply(`${e.Warn} | Algo não deveria ter acontecido. Vou começar outro quiz.`)
                return init()
            }

            let msg = await message.channel.send(`${e.Loading} | **${question}**`).catch(() => {
                pullChannel(message.channel.id)
                return message.channel.send(`${e.Deny} | Quiz Started Failed.`)
            })

            const collector = message.channel.createMessageCollector({
                filter: m => [...answer, 'skip', 'jump', 'pular'].includes(m.content?.toLowerCase()),
                time: fastMode,
                errors: ['time']
            })

                .on('collect', async m => {

                    if (['skip', 'jump', 'pular'].includes(m.content?.toLowerCase())) {
                        if (skipped) return

                        if (timesSkiped >= 3)
                            return m.reply(`${e.Deny} | O limite de skips são 3 vezes.`)

                        return skip(m)
                    }

                    msg.edit(`${e.Check} | **${question}**\n🏆 | ${m.author.tag} acertou essa pergunta.`).catch(() => { })
                    accept = true
                    await addPoint(m.author.id)
                    m.reply(`${e.Check} | ${m.author}, acertou a pergunta e venceu essa rodada!`)
                    addAcceptToUser(m.author.id)

                    if (rankingControl.length > 1) {
                        let embed = EmbedGenerator(rankingControl)
                        message.channel.send({ embeds: [embed] })
                    }

                    return collector.stop()
                })

                .on('end', async () => {

                    if (skipped) return

                    if (accept)
                        return init(true)

                    await pullChannel(message.channel.id)

                    msg.edit(`${e.Check} | **${question}**\n> Ninguém acertou essa pergunta.`).catch(() => { })
                    const msgCancel = await message.channel.send(`${e.Loading} | Quiz encerrado. Ninguém acertou a pergunta. Recomeçar?`),
                        emojis = ['✅', '❌']

                    for (const i of emojis) msgCancel.react(i).catch(() => { })

                    const collectorAfterCancel = msgCancel.createReactionCollector({
                        filter: (reaction, user) => emojis.includes(reaction.emoji.name) && !user.bot,
                        time: 15000,
                        max: 1,
                        errors: ['time', 'max']
                    })
                        .on('collect', (reaction) => {

                            if (reaction.emoji.name === emojis[0])
                                return init()

                            return collectorAfterCancel.stop()
                        })
                        .on('end', () => msgCancel.delete().catch(() => { }))
                    return
                })

            return

            async function skip(m) {
                skipped = true

                const data = await Database.User.findOne({ id: m.author.id }, 'Slot.Skip'),
                    skips = data?.Slot?.Skip || 0

                if (!data || !skips || skips <= 0) {
                    skipped = false
                    return m.reply(`${e.Deny} | Você não tem *⏩ Quiz Skip* para pular de pergunta. Compre o limite no painel rápido da \`${prefix}loja\` ou use o comando \`${prefix}buy skip <quantia>\``)
                }

                const skipMsg = await m.reply(`${e.Loading} | Você deseja pular para a próxima pergunta? ${timesSkiped}/3`)

                for (const i of ['✅', '❌']) skipMsg.react(i).catch(() => { })

                const emojis = ['✅', '❌'],
                    skipCollector = skipMsg.createReactionCollector({
                        filter: (reaction, user) => emojis.includes(reaction.emoji.name) && user.id === m.author.id,
                        time: 15000,
                        max: 1,
                        errors: ['time', 'max']
                    })

                        .on('collect', async (reaction) => {

                            if (reaction.emoji.name !== emojis[0]) return skipCollector.stop()

                            timesSkiped += 1
                            message.channel.send(`⏩ | ${m.author} pulou para a próxima pergunta. Prepare-se!`).catch(() => { })
                            msg.delete().catch(() => { })
                            collector.stop()
                            Database.subtractItem(m.author.id, 'Slot.Skip', 1)
                            return setTimeout(() => init(true), 3000)

                        })
                        .on('end', () => {
                            skipped = false
                            return skipMsg.delete().catch(() => { })
                        })

                return

            }
        }

        async function addAcceptToUser(userId) {
            await Database.User.updateOne(
                { id: userId },
                { $inc: { QuizCount: 1 } },
                { upsert: true }
            )
            return
        }

        async function registerChannel(channelId) {
            await Database.Client.updateOne(
                { id: client.user.id },
                { $push: { QuizChannels: channelId } }
            )
            return
        }

        async function pullChannel(channelId) {
            await Database.Client.updateOne(
                { id: client.user.id },
                { $pull: { QuizChannels: channelId } }
            )
            return
        }

        function addPoint(userId) {
            let index = rankingControl.findIndex(data => data.id === `${userId}`)

            if (index < 0)
                return rankingControl.push({ id: `${userId}`, count: 1 })

            rankingControl[index].count++
            return
        }

        function EmbedGenerator(array) {

            let sorted = array.sort((a, b) => b.count - a.count),
                current = sorted.slice(0, 15),
                description = current.map(data => `**${message.guild.members.cache.get(data.id) || 'Não encontrado'}** - ${data.count || 0} Pontos`).join("\n")

            let embed = {
                color: client.blue,
                title: `🏆 ${client.user.username} Quiz Match Ranking`,
                description: `${description || 'Nenhum item encontrado'}`,
                footer: {
                    text: `${array.length} usuários entraram no ranking`
                },
            }
            return embed
        }

        async function resetQuizChannels() {

            let data = await Database.Client.findOne({ id: client.user.id }, 'Administradores'),
                adms = data?.Administradores || []

            if (!adms.includes(message.author.id))
                return message.reply(`${e.Admin} | Este é um comando privado da classe Saphire's Team Administrators.`)

            await Database.Client.updateOne(
                { id: client.user.id },
                { $unset: { QuizChannels: 1 } }
            )

            return message.reply(`${e.Check} | Todos os canais registrados no quiz foram deletados da minha database.`)
        }

    }
}