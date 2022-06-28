const quizData = require('../../../JSON/quiz.json'),
    { formatString, emoji, formatNumberCaracters, getUser } = require('../../../src/commands/games/plugins/gamePlugins'),
    Database = require('../Database'),
    { e } = require('../../../JSON/emojis.json')

class QuizManager {
    constructor(data, options) {
        this.interaction = data.interaction
        this.options = options
        this.author = data.interaction.user
        this.client = data.client
        this.prefix = data.guildData?.Prefix || this.client.prefix
        this.channel = data.interaction.channel
        this.guild = data.interaction.guild
        this.clientData = data.clientData
        this.admins = this.clientData?.Administradores || []
        this.control = { embed: {}, usersPoints: [], animePaginationList: [], embedsTrading: [], selectMenuForEmbedsTrading: [] }
    }

    async normalQuiz() {

        const { interaction, author, pushChannel, pullChannel, control, client, guild, channel } = this

        let rankingControl = [],
            timesSkiped = 0,
            characters = Database.Characters,
            fastMode = 25000

        return chooseMode()

        async function init(isJumped) {

            let query = quizData.random(),
                question = query.question,
                answer = query.answers

            control.accept = false

            if (isJumped) return start(question, answer)
            if (control.fast) fastMode = 5000

            let msg = await channel.send({
                content: `${e.Loading} | ${fastMode === 5000 ? '⚡ **Speed Mode** | ' : ''}Inicializando Quiz... Prepare-se!`,
                fetchReply: true
            })

            return setTimeout(() => start(question, answer, msg), 3000)
        }

        async function chooseMode() {

            let buttons = [
                {
                    type: 1,
                    components: [
                        {
                            type: 2,
                            label: 'Padrão',
                            emoji: e.QuestionMark,
                            style: 'PRIMARY',
                            custom_id: 'normalMode'
                        },
                        {
                            type: 2,
                            label: 'Fast Mode',
                            emoji: '⚡',
                            style: 'PRIMARY',
                            custom_id: 'fastMode'
                        },
                        {
                            type: 2,
                            label: 'Anime Theme',
                            emoji: e.Hmmm,
                            style: 'PRIMARY',
                            custom_id: 'animeMode'
                        },
                        {
                            type: 2,
                            label: 'Cancelar',
                            emoji: '❌',
                            style: 'DANGER',
                            custom_id: 'cancel'
                        }
                    ]
                }
            ]

            let msg = await interaction.reply({
                content: `${e.QuestionMark} | Escolha seu modo de jogo...`,
                components: buttons,
                fetchReply: true
            })

            let collector = msg.createMessageComponentCollector({
                filter: int => int.user.id === author.id,
                time: 60000,
                erros: ['time', 'max']
            })
                .on('collect', async int => {
                    int.deferUpdate().catch(() => { })

                    let { customId } = int

                    if (customId === 'cancel') return collector.stop()

                    pushChannel()
                    if (customId === 'animeMode') {

                        let _characters = characters.get('Characters') || []
                        if (_characters.length <= 3) {
                            control.interactionReact = false
                            pullChannel()
                            return msg.edit({ content: `${e.Deny} | Não foi possível iniciar o *Quiz Anime Theme* por falta de personagens no banco de dados.`, embeds: [] }).catch(() => { })
                        }

                        msg.delete().catch(() => { })
                        return startAnimeThemeQuiz()
                    }

                    control.interactionReact = true
                    msg.delete().catch(() => { })
                    if (customId === 'normalMode') return init()
                    if (customId === 'fastMode') {
                        control.fast = true
                        return init()
                    }

                })
                .on('end', async () => {

                    if (control.interactionReact) return
                    pullChannel()
                    return msg.edit({ content: `${e.Deny} | Comando cancelado`, components: [] }).catch(() => { })
                })
        }

        async function start(question, answer, MessageToDelete) {

            MessageToDelete?.delete().catch(() => { })
            control.skipped = false

            if (!question || !answer) {
                pullChannel()
                channel.send(`${e.Warn} | Algo não deveria ter acontecido. Vou começar outro quiz.`)
                return init()
            }

            let msg = await channel.send({
                content: `${e.Loading} | **${question}**`,
                fetchReply: true
            }).catch(() => {
                pullChannel()
                return channel.send(`${e.Deny} | Quiz Started Failed.`)
            })

            const collector = channel.createMessageCollector({
                filter: m => [...answer, 'skip', 'jump', 'pular'].includes(m.content?.toLowerCase()),
                time: fastMode,
                errors: ['time']
            })
                .on('collect', async m => {

                    if (['skip', 'jump', 'pular'].includes(m.content?.toLowerCase())) {
                        if (control.skipped) return

                        if (timesSkiped >= 3)
                            return m.reply(`${e.Deny} | O limite de skips são 3 vezes.`)

                        return skip(m)
                    }

                    msg.edit(`${e.Check} | **${question}**\n🏆 | ${m.author.tag} acertou essa pergunta.`).catch(() => { })
                    control.accept = true
                    await addPoint(m.author.id)
                    m.reply(`${e.Check} | ${m.author}, acertou a pergunta e venceu essa rodada!`)
                    addAcceptToUser(m.author.id)

                    if (rankingControl.length > 1) {
                        let embed = EmbedGenerator(rankingControl)
                        channel.send({ embeds: [embed] })
                    }

                    return collector.stop()
                })

                .on('end', async () => {

                    if (!channel || control.skipped) return

                    if (control.accept)
                        return init(true)

                    pullChannel()

                    msg.edit(`${e.Check} | **${question}**\n> Ninguém acertou essa pergunta.`).catch(() => { })
                    const msgCancel = await channel.send(`${e.Loading} | Quiz encerrado. Ninguém acertou a pergunta. Recomeçar?`),
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
                control.skipped = true

                const data = await Database.User.findOne({ id: m.author.id }, 'Slot.Skip'),
                    skips = data?.Slot?.Skip || 0

                if (!data || !skips || skips <= 0) {
                    control.skipped = false
                    return m.reply(`${e.Deny} | Você não tem *⏩ Quiz Skip* para pular de pergunta. Compre o limite no painel rápido da \`${this.prefix}loja\` ou use o comando \`${this.prefix}buy skip <quantia>\``)
                }

                const skipMsg = await m.reply({
                    content: `${e.Loading} | Você deseja pular para a próxima pergunta? ${timesSkiped}/3`,
                    fetchReply: true
                })

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
                            channel.send(`⏩ | ${m.author} pulou para a próxima pergunta. Prepare-se!`).catch(() => { })
                            msg.delete().catch(() => { })
                            collector.stop()
                            Database.subtractItem(m.author.id, 'Slot.Skip', 1)
                            return setTimeout(() => init(true), 3000)

                        })
                        .on('end', () => {
                            control.skipped = false
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
                description = current.map(data => `**${guild.members.cache.get(data.id) || 'Não encontrado'}** - ${data.count || 0} Pontos`).join("\n")

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

        async function startAnimeThemeQuiz() {

            control.embed.color = client.blue
            control.embed.title = `${e.Hmmm} ${client.user.username}'s Quiz Anime Theme`
            control.embed.description = `${e.Loading} | Obtendo personagens... Prepare-se!`

            randomizeCharacters(0)
            let msg = await channel.send({ embeds: [control.embed] })

            setTimeout(() => startCharactersGame(msg), 4000)
            return
        }

        function randomizeCharacters(wrongAnswer = 0) {

            let _characters = characters.get('Characters')

            if (wrongAnswer > 0) {
                let charac = _characters[Math.floor(Math.random() * _characters.length)]

                if (charac.name === control.atualCharacter.name || control.wrongAnswers.some(p => p.name === charac.name)) return randomizeCharacters(1)
                else control.wrongAnswers.push(charac)
                return
            }

            let data = _characters[Math.floor(Math.random() * _characters.length)]
            if (data.name === control.atualCharacter?.name) return randomizeCharacters(0)
            control.atualCharacter = data
            return
        }

        async function startCharactersGame(Msg) {

            control.collectedMessage = false
            control.rounds++

            if (Msg)
                Msg?.delete().catch(() => pullChannel())

            control.embed.description = `${e.Loading} | Qual o nome deste personagem?`
            control.embed.image = { url: control.atualCharacter.image || null }
            control.embed.footer = { text: `Round: ${control.rounds || 0}` }

            let msg = await channel.send({ embeds: [control.embed] }).catch(() => Database.registerChannelControl('pull', 'Quiz', channel.id))

            return msg.channel.createMessageCollector({
                filter: m => collectorFilter(m),
                idle: 15000,
                max: 1,
                errors: ['idle', 'max']
            })
                .on('collect', async Message => {

                    control.collectedMessage = true

                    control.embed.description = `${e.Check} | ${Message.author} acertou o personagem!\n👤 | Personagem: **\`${formatString(control.atualCharacter.name)}\`** from **\`${control.atualCharacter?.anime || 'ANIME NOT FOUND'}\`**\n \n${e.Loading} | Próximo personagem...`
                    control.embed.image = { url: null }

                    msg.delete().catch(() => Database.registerChannelControl('push', 'Quiz', channel.id))
                    await randomizeCharacters(0)
                    let toDelMessage = await Message.reply({ embeds: [control.embed] }).catch(() => Database.registerChannelControl('push', 'Quiz', channel.id))

                    await addPoint(Message.author)
                    return setTimeout(async () => {
                        await toDelMessage.delete().catch(() => { })
                        startCharactersGame()
                    }, 4000)

                })
                .on('end', () => {

                    if (!channel || control.collectedMessage) return control.collected = false

                    Database.registerChannelControl('pull', 'Quiz', channel.id)
                    control.embed.color = client.red
                    control.embed.description = `${e.Deny} | Ninguém acertou.\n👤 | Personagem: **\`${formatString(control.atualCharacter.name)}\`** from **\`${control.atualCharacter?.anime || 'ANIME NOT FOUND'}\`**\n🔄 | ${control.rounds || 0} Rounds`
                    control.embed.footer = { text: 'Quiz Anime Theme Endded' }
                    msg.delete().catch(() => { })

                    return channel.send({ embeds: [control.embed] }).catch(() => { })
                })
        }

        function addPoint(User, justAdd = false) {

            let data = control.usersPoints?.find(data => data.name === User.username)

            data?.name
                ? data.points++
                : control.usersPoints.push({ name: User.username, points: 1 })

            // Liberar pontuação quando tiver animes suficientes no banco de dados
            // Database.addGamingPoint(User.id, 'AnimeThemeCount', 1)

            if (justAdd) return

            let ranking = control.usersPoints
                .sort((a, b) => b.points - a.points)
                .slice(0, 5)
                .map((d, i) => `${emoji(i)} ${d.name} - ${d.points} pontos`)
                .join('\n')

            if (control.embed?.fields?.length === 1)
                control.embed.fields[0] = { name: '🏆 Pontuação', value: `${ranking || `${e.Deny} RANKING BAD FORMATED`}` }
            else control.embed.fields = [{
                name: '🏆 Pontuação',
                value: `${ranking || `${e.Deny} RANKING BAD FORMATED`}${control.usersPoints.length > 5 ? `\n+${control.usersPoints.length - 5} players` : ''}`
            }]

            return
        }

        function collectorFilter(m) {

            let content = m.content?.toLowerCase(),
                nameArray = control.atualCharacter?.name.toLowerCase().split(/ +/g)

            return content === control.atualCharacter?.name.toLowerCase()
                || nameArray[0] === content
                || nameArray[1] === content
                || nameArray[2] === content
        }

    }

    async showCharacter(character) {

        let allData = Database.Characters.get('Characters') || []

        let data = allData?.find(p => p.name.toLowerCase() === character
            || p.name.toLowerCase().includes(character)
            || p.image === character
            || p.name.toLowerCase().split(/ +/g)[0] === character
            || p.name.toLowerCase().split(/ +/g)[1] === character
            || p.name.toLowerCase().split(/ +/g)[2] === character
        ) || null

        if (!data || !data?.image)
            return await this.interaction.reply({
                content: `${e.Deny} | Os moderadores do *Quiz Anime Theme* ainda não adicionaram esse personagem.`,
                ephemeral: true
            })

        return await this.interaction.reply({
            embeds: [{
                color: this.client.blue,
                title: `${e.Database} ${this.client.user.username} Quiz Anime Theme | Show Character`,
                description: `**\`${formatString(data.name) || '\`NAME NOT FOUND\`'}\`** from \`${data.anime || 'ANIME NOT FOUND'}\``,
                image: { url: data.image || null },
                footer: { text: 'Se nenhuma imagem apareceu, o link é inválido ou a imagem foi deletada.' }
            }]
        })
    }

    async resetQuizChannels() {

        if (!this.admins.includes(this.author.id))
            return await this.interaction.reply({
                content: `${e.Admin} | Este é um comando privado da classe Saphire's Team Administrators.`,
                ephemeral: true
            })

        Database.Cache.set('Quiz', [])

        return await this.interaction.reply({
            content: `${e.Check} | Todos os canais registrados no quiz foram deletados da minha database.`
        })
    }

    async listCharacters() {

        const { client, control, interaction, author, clientData, admins } = this
        let characters = Database.Characters.get('Characters') || []

        if (!characters || characters.length === 0)
            return await interaction.reply({
                content: `${e.Deny} | Não há nenhum personagem no meu banco de dados.`,
                ephemeral: true
            })

        let selectMenuObject = [],
            embeds = EmbedGenerator(characters)
        control.embedTradeControl = 0

        let msg = await interaction.reply({
            embeds: [embeds[control.embedTradeControl]],
            components: [buttons(embeds), selectMenuObject[control.embedTradeControl]],
            fetchReply: true
        })

        let collector = msg.createMessageComponentCollector({
            filter: int => int.user.id === author.id,
            idle: 60000,
            errors: ['idle']
        })
            .on('collect', async int => {
                int.deferUpdate().catch(() => { })

                let customId = int.isButton()
                    ? int.customId
                    : int?.values[0]

                if (customId === 'right') {

                    if (control.atualPage === 'animeList') {
                        control.embedTradeControl++
                        if (control.embedTradeControl >= embeds.length) control.embedTradeControl = 0
                        return msg.edit({
                            content: null,
                            embeds: [embeds[control.embedTradeControl]],
                            components: [buttons(embeds), selectMenuForEmbedsTrading[control.embedTradeControl]]
                        }).catch(() => { })
                    }

                    if (control.atualPage === 'charactersList') {
                        control.embedsTradingControl++
                        if (control.embedsTradingControl >= control.embedsTrading.length) control.embedsTradingControl = 0
                        return msg.edit({
                            content: null,
                            embeds: [control.embedsTrading[control.embedsTradingControl]],
                            components: [buttons(control.embedsTrading), control.selectMenuForEmbedsTrading[control.embedsTradingControl]]
                        }).catch(() => { })
                    }

                }

                if (customId === 'left') {

                    if (control.atualPage === 'animeList') {
                        control.embedTradeControl--
                        if (control.embedTradeControl < 0) control.embedTradeControl = embeds.length - 1
                        return msg.edit({
                            content: null,
                            embeds: [embeds[control.embedTradeControl]],
                            components: [buttons(embeds), selectMenuForEmbedsTrading[control.embedTradeControl]]
                        }).catch(() => { })
                    }

                    if (control.atualPage === 'charactersList') {
                        control.embedsTradingControl--
                        if (control.embedsTradingControl < 0) control.embedsTradingControl = control.embedsTrading.length - 1
                        return msg.edit({
                            content: null,
                            embeds: [control.embedsTrading[control.embedsTradingControl]],
                            components: [buttons(control.embedsTrading), control.selectMenuForEmbedsTrading[control.embedsTradingControl]]
                        }).catch(() => { })
                    }

                }

                if (customId === 'delete') {
                    return msg.edit({ embeds: [{ color: client.red, title: `${e.Info} | Esta funciona está em desenvolvimento.` }] }).catch(() => { })
                }

                if (customId === 'cancel') return collector.stop()
                if (customId === 'animeList') {
                    control.embedTradeControl = 0
                    control.atualPage = 'animeList'
                    return msg.edit({ content: null, embeds: [embeds[0]], components: [buttons(embeds), selectMenuObject[0]] }).catch(() => { })
                }

                if (customId === 'charactersList') {
                    control.embedsTradingControl = 0
                    control.atualPage = 'charactersList'
                    return msg.edit({ content: null, embeds: [control.embedsTrading[0]], components: [buttons(control.embedsTrading), control.selectMenuForEmbedsTrading[0]] })
                }

                let animeInteractionData = control.animePaginationList.find(data => data.id === customId)
                let animeData = characters.filter(data => data.anime === animeInteractionData?.name) || []

                if (animeData) await EmbedGenerator()

                control.embedsTradingControl = 0

                msg.edit({
                    content: null,
                    embeds: [control.embedsTrading[0]],
                    components: [buttons(control.embedsTrading), control.selectMenuForEmbedsTrading[0]]
                }).catch(() => { })

                let character = characters.find(data => data.name == customId)

                if (!character) return

                return msg.edit({
                    content: null,
                    embeds: [{
                        color: client.blue,
                        title: `👤 Quiz Anime Theme Showing Mode`,
                        description: `Character: **\`${formatString(customId)}\`**\nFrom: **\`${character.anime}\`**`,
                        image: { url: character.image || null },
                        footer: { text: 'Se a imagem não aparecer, o link está corrompido.' }
                    }],
                    components: [buttons([], true), {
                        type: 1,
                        components: [{
                            type: 3,
                            custom_id: 'menu',
                            placeholder: 'Voltar',
                            options: [
                                {
                                    label: 'Lista de animes',
                                    emoji: '📝',
                                    description: 'Lista de todos os animes no banco de dados',
                                    value: 'animeList'
                                },
                                {
                                    label: `Personagens`,
                                    emoji: '📝',
                                    description: `Lista de personagens do anime ${character.anime || 'ANIME NOT FOUND'}`,
                                    value: 'charactersList'
                                },
                                {
                                    label: 'Cancelar',
                                    emoji: '❌',
                                    description: 'Cancelar comando',
                                    value: 'cancel'
                                }
                            ]
                        }]
                    }]
                })

                function EmbedGenerator(array = animeData || []) {

                    if (array.length === 0) return
                    control.selectMenuForEmbedsTrading = []
                    control.atualPage = 'charactersList'

                    let amount = 10,
                        page = 1,
                        embeds = [],
                        length = array.length / 10 <= 1 ? 1 : parseInt((array.length / 10) + 1),
                        options = []

                    for (let i = 0; i < array.length; i += 10) {

                        let current = array.slice(i, amount),
                            description = current.map((data, i) => {

                                options.push({
                                    label: `${formatNumberCaracters(i + 1)} - ${data.name ? formatString(data.name) : 'NAME NOT FOUND'}`,
                                    description: `from: ${data.anime || 'ANIME NOT FOUND'}`,
                                    emoji: '👤',
                                    value: data.name
                                })

                                return `\`${data.name || 'NAME NOT FOUND'}\``
                            }).join('\n'),
                            pageCount = length > 1 ? ` - ${page}/${length}` : ''

                        embeds.push({
                            color: client.blue,
                            title: `👤 Lista de Personagens${pageCount}`,
                            description: `Anime: **\`${animeData[0]?.anime || '\`ANIME NOT FOUND\`'}\`**\n \n${description || 'MAP BAD FORMATED'}`
                        })

                        control.selectMenuForEmbedsTrading.push({
                            type: 1,
                            components: [{
                                type: 3,
                                custom_id: 'menu',
                                placeholder: 'Ver um personagem',
                                options: [
                                    {
                                        label: 'Lista de animes',
                                        emoji: '📝',
                                        description: 'Lista de todos os animes no banco de dados',
                                        value: 'animeList'
                                    },
                                    {
                                        label: `Personagens`,
                                        emoji: '📝',
                                        description: `Lista de personagens do anime ${animeData[0]?.anime || 'ANIME NOT FOUND'}`,
                                        value: 'charactersList'
                                    },
                                    options,
                                    {
                                        label: 'Cancelar',
                                        emoji: '❌',
                                        description: 'Cancelar comando',
                                        value: 'cancel'
                                    }
                                ]
                            }]
                        })

                        options = []
                        page++
                        amount += 10

                    }

                    control.embedsTrading = [...embeds]
                    return
                }

            })
            .on('end', () => {
                let embed = msg.embeds[0]
                if (!embed) return
                embed.color = client.red
                embed.footer = { text: `${embed?.footer?.text ? `${embed?.footer?.text} | ` : ''}Comando cancelado` }
                return msg.edit({ content: `${e.Deny} | Comando cancelado.`, embeds: [embed], components: [] }).catch(() => { })
            })
        return

        function buttons(embeds = [], admin) {

            let buttons = {
                type: 1,
                components: [
                    {
                        type: 2,
                        emoji: '⬅️',
                        custom_id: 'left',
                        style: 'PRIMARY',
                        disabled: false
                    },
                    {
                        type: 2,
                        emoji: '➡️',
                        custom_id: 'right',
                        style: 'PRIMARY',
                        disabled: false
                    }
                ]
            }

            if (admin && admins.includes(author.id))
                buttons.components.push({
                    type: 2,
                    emoji: '🗑️',
                    custom_id: 'delete',
                    style: 'DANGER',
                    disabled: false
                })

            if (embeds.length <= 1) {
                buttons.components[0].disabled = true
                buttons.components[1].disabled = true
            }
            return buttons
        }

        function EmbedGenerator(arrayCharacters) {

            let array = [...new Set(arrayCharacters?.map(c => c.anime?.toLowerCase()))].sort()

            let amount = 15,
                page = 1,
                embeds = [],
                length = array.length / 15 <= 1 ? 1 : parseInt((array.length / 15) + 1),
                options = []

            for (let i = 0; i < array.length; i += 15) {

                let current = array.slice(i, amount),
                    description = current.map((data, i) => {

                        let anime = characters.filter(d => d.anime?.toLowerCase() === data) || [],
                            animeName = anime[0]?.anime || `${anime[0]?.name} - ANIME NOT FOUND`

                        options.push({
                            label: `${formatNumberCaracters(i + 1)} - ${animeName}`,
                            description: `${anime.length || 0} Personagens`,
                            emoji: '🎞️',
                            value: `${formatNumberCaracters(i + 1)}` || `ANIME NOT FOUND ${formatNumberCaracters(i + 1)}`
                        })

                        control.animePaginationList.push({ id: formatNumberCaracters(i + 1), name: animeName })

                        return `\`${formatNumberCaracters(i + 1)}\` - \`${animeName}\``
                    }).join('\n'),
                    pageCount = length > 1 ? ` - ${page}/${length}` : ''

                embeds.push({
                    color: client.blue,
                    title: `${e.Database} Database Quiz Anime Theme${pageCount}`,
                    description: description || 'MAP FUNCTION IS NOT WORKING'
                })

                selectMenuObject.push({
                    type: 1,
                    components: [{
                        type: 3,
                        custom_id: 'menu',
                        placeholder: 'Selecionar um anime',
                        options: [
                            {
                                label: 'Lista de animes',
                                emoji: '📝',
                                description: 'Lista de todos os animes no banco de dados',
                                value: 'animeList'
                            },
                            options,
                            {
                                label: 'Cancelar',
                                emoji: '❌',
                                description: 'Cancelar comando',
                                value: 'cancel'
                            }
                        ]
                    }]
                })

                options = []
                page++
                amount += 15
            }

            return embeds
        }
    }

    async getAndShowUserStatus() {

        let user = this.options.getUser('user') || getUser(this.options.getString('search')) || this.author
        let data = await Database.User.findOne({ id: user.id }, 'QuizCount GamingCount')
        let quizCount = data?.QuizCount || 0
        let flagCount = data?.GamingCount?.FlagCount || 0
        let animeThemeCount = data?.GamingCount?.AnimeThemeCount || 0

        return await this.interaction.reply({
            embeds: [{
                color: this.client.blue,
                title: `📑 ${this.client.user.username}'s Quiz Status | ${user.tag}`,
                fields: [
                    {
                        name: '❔ Normal Mode',
                        value: `${quizCount} acertos`
                    },
                    {
                        name: '🎌 Flag Mode',
                        value: `${flagCount} acertos`
                    },
                    {
                        name: '📺 Anime Mode',
                        value: `${animeThemeCount} acertos`
                    }
                ]
            }]
        })

    }

    async quizInfo() {

        let characters = Database.Characters.get('Characters') || []

        let embeds = [{
            color: this.client.blue,
            title: `${e.QuestionMark} ${this.client.user.username} Quiz`,
            fields: [
                {
                    name: `${e.On} Inicie um Quiz`,
                    value: `\`/quiz game game_mode:\``
                },
                {
                    name: '⏩ Pule perguntas',
                    value: 'Quando o quiz estiver ativado, fale "**skip**"'
                },
                {
                    name: '⚡ Speed Mode',
                    value: `\`/quiz game game_mode: Speed Mode\``
                },
                {
                    name: `${e.Hmmm} Anime Theme`,
                    value: `Você consegue acertar os ${characters.length || 0} personagens de animes?\n\`/quiz game game_mode: Anime Theme\``
                },
                {
                    name: `${e.Info} Confira os acertos`,
                    value: `\`/quiz status\` ou \`/quiz status user:\``
                },
                {
                    name: `${e.CoroaDourada} Aceita um ranking?`,
                    value: `\`/rank category: quiz\` ou \`/rank category: flaggaming\``
                },
                {
                    name: `${e.Info} Informações adicionais`,
                    value: `O tempo normal das perguntas são de 30 segundos, já o speed mode são apenas 5.\n⚙️ Quiz Administration Commands`
                }
            ],
            footer: { text: `${quizData?.length || 0} perguntas disponíveis` }
        },
        {
            color: this.client.blue,
            title: `${e.QuestionMark} ${this.client.user.username} Quiz | Administration Commands`,
            fields: [
                {
                    name: `Anime Theme`,
                    value: `\`${this.prefix}quiz new <linkDaImagem> <Nome do Personagem>\` - Adicione um novo personagem\n\`${this.prefix}quiz delete <LinkDaImagem> ou <Nome do Personagem>\` - Delete um personagem\n\`${this.prefix}quiz list\` - Lista de todos os personagens\n\`${this.prefix}quiz personagem <Nome Do personagem>\` - Veja um personagem especifico\n\`${this.prefix}quiz edit name <Nome Do Personagem> ou <Link da Imagem>\` - Edite o nome de um personagem\n\`${this.prefix}quiz edit link <Nome do Personagem> ou <Link da Imagem>\` - Edite a imagem de um personagem\n\`${this.prefix}quiz edit anime <Nome do Personagem> ou Link da Imagem>\` - Edite o anime do personagem\n\`${this.prefix}quiz reboot\` - Retira todos os canais registrados do banco de dados`
                }
            ],
            footer: { text: `${characters.length || 0} personagens disponíveis` }
        }]

        let msg = await this.interaction.reply({
            embeds: [embeds[0]],
            fetchReply: true
        })

        let embedTrade = 0
        msg.react('⚙️').catch(() => { })

        return msg.createReactionCollector({
            filter: (reaction, user) => reaction.emoji.name === '⚙️' && user.id === this.author.id,
            idle: 30000,
            max: 5,
            errors: ['idle', 'time']
        })
            .on('collect', (r) => {

                if (r.emoji.name === '⚙️' && embedTrade === 0) {
                    embedTrade = 1
                    return msg.edit({ embeds: [embeds[1]] }).catch(() => { })
                }

                embedTrade = 0
                return msg.edit({ embeds: [embeds[0]] }).catch(() => { })
            })
            .on('end', () => {

                let embed = embeds[embedTrade]
                embed.color = this.client.red
                embed.footer.text += ' | Comando cancelado'

                return msg.edit({ embeds: [embed] }).catch(() => { })
            })

    }

    pullChannel = () => Database.Cache.pull('Quiz', this.channel.id)
    pushChannel = () => Database.Cache.push('Quiz', this.channel.id)
}

module.exports = QuizManager