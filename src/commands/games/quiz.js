const { e } = require('../../../JSON/emojis.json'),
    quizData = require('../../../JSON/quiz.json'),
    { formatString, registerChannelControl, emoji } = require('./plugins/gamePlugins')

module.exports = {
    name: 'quiz',
    aliases: ['q'],
    category: 'games',
    emoji: `${e.QuestionMark}`,
    usage: 'quiz <info>',
    description: 'Quiz é bem legal, garanto.',

    execute: async (client, message, args, prefix, MessageEmbed, Database) => {

        let rankingControl = [],
            timesSkiped = 0,
            control = { embed: new MessageEmbed(), usersPoints: [] },
            characters = Database.Characters,
            fastMode = 25000

        if (['status', 'stats', 'st'].includes(args[0]?.toLowerCase())) return quizStatus()
        if (['info', 'help', 'ajuda'].includes(args[0]?.toLowerCase())) return quizInfo()
        if (['reset', 'reboot', 'r'].includes(args[0]?.toLowerCase())) return resetQuizChannels()
        if (['add', 'adicionar', 'new', '+'].includes(args[0]?.toLowerCase())) return addCharacter()
        if (['del', 'deletar', 'remove', '+', 'excluir'].includes(args[0]?.toLowerCase())) return deleteCharacter()
        if (['personagem', 'p', 'character', 'image'].includes(args[0]?.toLowerCase())) return showCharacter()
        if (['edit', 'editar'].includes(args[0]?.toLowerCase())) return editCharacter()
        if (['list', 'lista', 'all', 'full'].includes(args[0]?.toLowerCase())) return listCharacters()
        return chooseMode()

        async function quizStatus() {

            let user = message.mentions.users.first() || message.mentions.repliedUser || client.users.cache.find(data => data.username?.toLowerCase() === args.join(' ')?.toLowerCase() || data.tag?.toLowerCase() === args[0]?.toLowerCase() || data.discriminator === args[0] || data.id === args[0]) || message.author

            let data = await Database.User.findOne({ id: user.id }, 'QuizCount'),
                acertos = data.QuizCount || 0

            return message.reply(`${e.QuestionMark} | ${user.id === message.author.id ? 'Você' : user.username} acertou **${acertos}** perguntas no quiz.`)

        }

        async function quizInfo(msg = false) {

            let characters = Database.Characters.get('Characters') || []

            let embeds = [{
                color: client.blue,
                title: `${e.QuestionMark} ${client.user.username} Quiz`,
                fields: [
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
                        name: `${e.Hmmm} Anime Theme`,
                        value: `Você consegue acertar os ${characters.length || 0} personagens de animes?`
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
                        value: `O tempo normal das perguntas é de 30 segundos, já o speed mode é apenas 5.\n⚙️ Quiz Administration Commands`
                    }
                ],
                footer: { text: `${quizData?.length || 0} perguntas disponíveis` }
            },
            {
                color: client.blue,
                title: `${e.QuestionMark} ${client.user.username} Quiz | Administration Commands`,
                fields: [
                    {
                        name: `Anime Theme`,
                        value: `\`${prefix}quiz new <linkDaImagem> <Nome do Personagem>\` - Adicione um novo personagem\n\`${prefix}quiz delete <LinkDaImagem> ou <Nome do Personagem>\` - Delete um personagem\n\`${prefix}quiz list\` - Lista de todos os personagens\n\`${prefix}quiz personagem <Nome Do personagem>\` - Veja um personagem especifico\n\`${prefix}quiz edit name <Nome Do Personagem> ou <Link da Imagem>\` - Edite o nome de um personagem\n\`${prefix}quiz edit link <Nome do Personagem> ou <Link da Imagem>\` - Edite a imagem de um personagem\n\`${prefix}quiz edit anime <Nome do Personagem> ou Link da Imagem>\` - Edite o anime do personagem\n\`${prefix}quiz reboot\` - Retira todos os canais registrados do banco de dados`
                    }
                ],
                footer: { text: `${characters.length || 0} personagens disponíveis` }
            }]

            msg
                ? msg.edit({ content: null, embeds: [embeds[0]] })
                : msg = await message.reply({ content: null, embeds: [embeds[0]] })

            control.embedTrade = 0
            msg.react('⚙️').catch(() => { })

            return msg.createReactionCollector({
                filter: (reaction, user) => reaction.emoji.name === '⚙️' && user.id === message.author.id,
                idle: 30000,
                max: 5,
                errors: ['idle', 'time']
            })
                .on('collect', (r) => {

                    if (r.emoji.name === '⚙️' && control.embedTrade === 0) {
                        control.embedTrade = 1
                        return msg.edit({ embeds: [embeds[1]] }).catch(() => { })
                    }

                    control.embedTrade = 0
                    return msg.edit({ embeds: [embeds[0]] }).catch(() => { })
                })
                .on('end', () => {

                    let embed = embeds[control.embedTrade]
                    embed.color = client.red
                    embed.footer.text += ' | Comando cancelado'

                    return msg.edit({ content: null, embeds: [embed] }).catch(() => { })
                })

        }

        async function init(isJumped) {

            let query = quizData[Math.floor(Math.random() * quizData.length)],
                question = query.question,
                answer = query.answers

            control.accept = false

            if (isJumped) return start(question, answer)

            let clientData = await Database.Client.findOne({ id: client.user.id }, 'GameChannels.Quiz'),
                channelsBlockToInit = clientData?.GameChannels?.Quiz || []

            if (!channelsBlockToInit || channelsBlockToInit.includes(message.channel.id))
                return message.reply(`${e.Deny} | Já tem um quiz rolando nesse chat.`).then(m => setTimeout(() => m.delete().catch(() => { }), 2500))

            if (control.fast) fastMode = 5000

            let msg = await message.channel.send(`${e.Loading} | ${fastMode === 5000 ? '⚡ **Speed Mode** | ' : ''}Inicializando Quiz... Prepare-se!`)

            return setTimeout(() => start(question, answer, msg), 3000)

        }

        function showCharacter() {

            let allData = Database.Characters.get('Characters')

            let data = allData?.find(p => p.name.toLowerCase() === args.join(' ')?.toLowerCase()
                || p.name.toLowerCase().includes(args[1]?.toLowerCase())
                || p.image === args[0]) || null

            if (!data.image)
                return message.reply(`${e.Deny} | Os moderadores do *Quiz Anime Theme* ainda não adicionaram esse personagem.`)

            return message.reply({
                embeds: [{
                    color: client.blue,
                    title: `${e.Database} ${client.user.username} Quiz Anime Theme | Show Character`,
                    description: `**\`${formatString(data.name) || '\`NAME NOT FOUND\`'}\`** from \`${data.anime || 'ANIME NOT FOUND'}\``,
                    image: { url: data.image || null },
                    footer: { text: 'Se nenhuma imagem apareceu, o link é inválido ou a imagem foi deletada.' }
                }]
            })
        }

        async function chooseMode() {

            let selectMenuObject = [{
                type: 1,
                components: [{
                    type: 3,
                    custom_id: 'menu',
                    placeholder: 'Escolher um modo de jogo',
                    options: [
                        {
                            label: 'Informações',
                            emoji: e.Info,
                            description: 'Painel de informações do comando',
                            value: 'quizInfo'
                        },
                        {
                            label: 'Padrão',
                            emoji: e.QuestionMark,
                            description: 'Modo de jogo clásico',
                            value: 'normalMode'
                        },
                        {
                            label: 'Padrão Fast',
                            emoji: '⚡',
                            description: 'Modo de jogo clásico, porém mais rápido',
                            value: 'fastMode'
                        },
                        {
                            label: 'Anime Theme (Construindo)',
                            emoji: e.Hmmm,
                            description: 'Você conhece personagens de animes?',
                            value: 'animeMode',
                            disabled: true
                        },
                        {
                            label: 'Cancelar',
                            emoji: '❌',
                            description: 'Cancele este comando.',
                            value: 'cancel'
                        }
                    ]
                }]
            }]

            let msg = await message.reply({
                content: `${e.QuestionMark} | Escolha seu modo de jogo...`,
                components: selectMenuObject
            })

            let collector = msg.createMessageComponentCollector({
                filter: int => int.user.id === message.author.id,
                time: 60000,
                erros: ['time', 'max']
            })
                .on('collect', async interaction => {
                    interaction.deferUpdate().catch(() => { })

                    let customId = interaction.values[0]
                    if (customId === 'cancel') return collector.stop()
                    if (customId === 'quizInfo') return quizInfo(msg)

                    let clientData = await Database.Client.findOne({ id: client.user.id }, 'GameChannels.Quiz'),
                        channelsBlockToInit = clientData?.GameChannels?.Quiz || []

                    if (!channelsBlockToInit || channelsBlockToInit.includes(message.channel.id))
                        return message.channel.send(`${e.Deny} | ${message.author}, já tem um quiz rolando nesse chat.`).then(m => setTimeout(() => m.delete().catch(() => { }), 2500))

                    await registerChannelControl('push', 'Quiz', message.channel.id)
                    if (customId === 'animeMode') {

                        let _characters = characters.get('Characters')
                        if (_characters.length <= 3) {
                            registerChannelControl('pull', 'Quiz', message.channel.id)
                            return msg.edit({ content: `${e.Deny} | Não foi possível iniciar o *Quiz Anime Theme* por falta de personagens no banco de dados.`, embeds: [] })
                        }

                        msg.delete().catch(() => { })
                        return startAnimeThemeQuiz()
                    }
                    msg.delete().catch(() => { })
                    if (customId === 'normalMode') return init()
                    if (customId === 'fastMode') {
                        control.fast = true
                        return init()
                    }

                })
                .on('end', () => {

                    if (control.interactionReact) return
                    pullChannel(message.channel.id)
                    return msg.edit({ content: `${e.Deny} | Comando cancelado`, components: [] }).catch(() => { })
                })
        }

        async function start(question, answer, MessageToDelete) {
            MessageToDelete?.delete().catch(() => { })
            control.skipped = false

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
                        message.channel.send({ embeds: [embed] })
                    }

                    return collector.stop()
                })

                .on('end', async () => {

                    if (control.skipped) return

                    if (control.accept)
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
                control.skipped = true

                const data = await Database.User.findOne({ id: m.author.id }, 'Slot.Skip'),
                    skips = data?.Slot?.Skip || 0

                if (!data || !skips || skips <= 0) {
                    control.skipped = false
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

        async function listCharacters() {

            let data = await Database.Client.findOne({ id: client.user.id }, 'Moderadores Administradores')

            if (!data?.Administradores?.includes(message.author.id) && !data?.Moderadores?.includes(message.author.id))
                return message.reply(`${e.Admin} | Apenas moderadores e administradores da Saphire's Team possue o acesso a lista de personagem do *Quiz Anime Theme*.`)

            let jsonCharacters = Database.Characters,
                characters = jsonCharacters.get('Characters')

            if (!characters || characters.length === 0)
                return message.reply(`${e.Deny} | Não há nenhum personagem no meu banco de dados.`)

            let embeds = EmbedGenerator(),
                control = 0

            let msg = await message.reply({ embeds: [embeds[0]] })
            if (embeds.length === 1) return
            let emojis = ['⬅️', '➡️', '❌']

            for (let i of emojis) msg.react(i).catch(() => { })
            let collector = msg.createReactionCollector({
                filter: (reaction, user) => emojis.includes(reaction.emoji.name) && user.id === message.author.id,
                idle: 30000,
                errors: ['idle']
            })
                .on('collect', async (reaction) => {

                    if (reaction.emoji.name === emojis[2])
                        return collector.stop()

                    if (reaction.emoji.name === emojis[0]) {
                        control--
                        if (control < 0) control = embeds.length - 1
                        return msg.edit({ embeds: [embeds[control]] }).catch(() => { })
                    }

                    if (reaction.emoji.name === emojis[1]) {
                        control++
                        if (control >= embeds.length) control = 0
                        return msg.edit({ embeds: [embeds[control]] }).catch(() => { })
                    }

                    return
                })
                .on('end', () => {
                    let embed = embeds[control]
                    embed.color = client.red
                    embed.footer.text = `${embed.footer.text} | Comando cancelado`
                    return msg.edit({ embeds: [embed] }).catch(() => { })

                })

            function EmbedGenerator() {

                let amount = 15,
                    Page = 1,
                    embeds = [],
                    length = characters.length / 15 <= 1 ? 1 : parseInt((characters.length / 15) + 1)

                for (let i = 0; i < characters.length; i += 15) {

                    let current = characters.slice(i, amount),
                        description = current.map(p => `> \`${formatString(p.name)}\` from \`${p.anime || 'ANIME NOT FOUND'}\``).join("\n"),
                        pageCount = length > 1 ? ` - ${Page}/${length}` : ''

                    if (current.length > 0) {

                        embeds.push({
                            color: client.blue,
                            title: `${e.Database} Database Quiz Anime Theme${pageCount}`,
                            description: `${description}`,
                            footer: {
                                text: `${characters.length} personagens contabilizados`
                            }
                        })

                        Page++
                        amount += 15

                    }

                }

                return embeds
            }
        }

        async function addCharacter() {

            let { Rody, Gowther } = Database.Names

            if (![Rody, Gowther].includes(message.author.id))
                return message.reply(`${e.Admin} | Apenas os administradores do quiz *Anime Theme* tem o poder de adicionar novos personagens.`)

            let characters = Database.Characters.get('Characters') || [],
                image = args[1],
                name = args.slice(2).join(' ')?.toLowerCase()

            if (!image)
                return message.reply(`${e.Info} | \`${prefix}quiz add <imageLink> <Nome do Personagem>\``)

            if (!image || !name)
                return message.reply(`${e.Deny} | Formato inválido! \`${prefix}quiz add <imageLink> <Nome do Personagem>\``)

            if (!image.includes('https://media.discordapp.net/attachments') && !image.includes('https://cdn.discordapp.com/attachments/'))
                return message.reply(`${e.Deny} | Verique se o link da imagem segue um desses formatos: \`https://media.discordapp.net/attachments\` | \`https://cdn.discordapp.com/attachments/\``)

            let has = characters?.find(data => data.name === name || data.image == image)

            if (has)
                return message.reply(`${e.Deny} | Esse personagem já existe no banco de dados.`)

            let msg = await message.reply({
                content: `${e.QuestionMark} | Você confirma adicionar o personagem **\`${formatString(name)}\`** no banco de dados do **Quiz Anime Theme**?`,
                embeds: [{
                    color: client.blue,
                    image: { url: image || null },
                    description: 'Se a imagem do personagem não aparecer, quer dizer que o link não é compatível.'
                }]
            }),
                emojis = ['✅', '❌'], clicked = false

            for (let i of emojis) msg.react(i).catch(() => { })
            let collector = msg.createReactionCollector({
                filter: (reaction, user) => emojis.includes(reaction.emoji.name) && user.id === message.author.id,
                time: 60000,
                max: 1,
                erros: ['time', 'max']
            })
                .on('collect', (r) => {

                    if (r.emoji.name === emojis[1])
                        return collector.stop()

                    clicked = true

                    msg.edit({
                        content: `${e.Loading} | Tudo certo! Qual é o nome do anime que **\`${formatString(name)}\`** faz parte?`,
                        embeds: []
                    }).catch(() => { })

                    return message.channel.createMessageCollector({
                        filter: m => m.author.id === message.author.id,
                        max: 1,
                        time: 30000,
                        erros: ['time', 'max']
                    })
                        .on('collect', Message => {

                            control.validated = true
                            return pushNewCaracter(msg, { name: name, image: image, anime: Message.content })

                        })
                        .on('end', () => {
                            if (control.validated) return
                            return msg.edit({ content: `${e.Deny} | Adição de personagem cancelado.`, embeds: [] })
                        })

                })
                .on('end', () => {
                    if (clicked) return
                    return msg.edit({ content: `${e.Deny} | Comando cancelado.`, embeds: [] }).catch(() => { })
                })
        }

        async function editCharacter() {

            let { Rody, Gowther } = Database.Names

            if (![Rody, Gowther].includes(message.author.id))
                return message.reply(`${e.Admin} | Apenas os administradores do quiz *Anime Theme* tem o poder de editar personagens.`)

            let characters = Database.Characters.get('Characters') || []

            if (['nome', 'name'].includes(args[1]?.toLowerCase())) return editName()
            if (['link', 'image', 'imagem', 'foto', 'personagem', 'p'].includes(args[1]?.toLowerCase())) return editImage()
            if (args[1]?.toLowerCase() === 'anime') return editAnime()
            return message.reply(`${e.Deny} | Forneça o nome ou o link da imagem para que eu possa buscar um personagem no banco de dados. Logo após, forneça o conteúdo a ser editado.\n\`${prefix}quiz edit <name/image/anime> <Nome/Link>\`\n\`<comando> <editar> <oq editar> <quem editar>\``)

            async function editName() {

                let request = args.slice(2).join(' ')

                if (!request)
                    return message.reply(`${e.Deny} | Forneça o nome ou o link da imagem do personagem que você quer editar o nome.\n\`${prefix}quiz edit name <Nome do Personagem> ou <Link Do Personagem>\``)

                let has = characters?.find(p => p.name.toLowerCase() === request?.toLowerCase()
                    || p.name.toLowerCase().includes(request?.toLowerCase())
                    || p.image === request) || null

                if (!has)
                    return message.reply(`${e.Deny} | Nenhum personagem foi encontrado com o requisito: \`${request}\``)

                let embed = {
                    color: client.blue,
                    title: `${e.Database} Database's Edit Information System`,
                    description: `Personagem selecionado: **\`${formatString(has.name)}\`**\nInformação para edição: **\`Character's Name\`**`,
                    image: { url: has.image || null },
                    footer: { text: 'Quiz Anime Theme Selection' }
                }

                let msg = await message.reply({
                    content: `${e.Loading} | Diga no chat o novo nome do personagem. Para cancelar, digite \`CANCEL\``,
                    embeds: [embed]
                })

                let collector = msg.channel.createMessageCollector({
                    filter: m => m.author.id === message.author.id,
                    time: 60000,
                    erros: ['time']
                })
                    .on('collect', Message => {

                        if (Message.content === 'CANCEL') return collector.stop()

                        let alreadyHas = characters?.find(p => p.name.toLowerCase() === Message.content?.toLowerCase()
                            || p.image === Message.content) || null

                        if (alreadyHas && alreadyHas.name.toLowerCase() === Message.content.toLowerCase())
                            return Message.reply(`${e.Deny} | Este nome já pertence a este personagem`)

                        if (alreadyHas)
                            return Message.reply(`${e.Deny} | Este nome já pertence a um personagem no banco de dados.`)

                        control.collected = true

                        embed.description = `Personagem selecionado: **\`${formatString(has.name)}\`**\nInformação para edição: **\`Character's Name\`**\nNew Name: \`${formatString(Message.content)}\``

                        msg.edit({
                            content: `${e.Loading} | Confirme as informações abaixo caso tudo esteja correto.`,
                            embeds: [embed]
                        }).catch(() => { })

                        let emojis = ['✅', '❌']

                        for (let i of emojis) msg.react(i).catch(() => { })

                        return msg.createReactionCollector({
                            filter: (reaction, user) => emojis.includes(reaction.emoji.name) && user.id === message.author.id,
                            time: 60000,
                            max: 1,
                            erros: ['time', 'max']
                        })
                            .on('collect', (reaction) => {

                                if (reaction.emoji.name === emojis[1]) return

                                control.collectedReaction = true

                                let newSet = characters.filter(data => data.name !== has.name)

                                Database.Characters.set('Characters', [{ name: Message.content, image: has.image }, ...newSet])

                                embed.color = client.green
                                embed.description = `Personagem selecionado: **\`${formatString(has.name)}\`**\nInformação para edição: **\`Character's Name\`**\nNew Name: \`${formatString(Message.content)}\``

                                return msg.edit({
                                    content: `${e.Check} | O nome do personagem **\`${formatString(has.name)}\`** foi alterado para **\`${formatString(Message.content)}\`**`,
                                    embeds: [embed]
                                }).catch(() => { })

                            })
                            .on('end', () => {
                                if (control.collectedReaction) return
                                return msg.edit({
                                    content: `${e.Deny} | Comando cancelado.`,
                                    embeds: []
                                }).catch(() => { })
                            })
                    })
                    .on('end', () => {
                        if (control.collected) return
                        return msg.edit({
                            content: `${e.Deny} | Comando cancelado.`,
                            embeds: []
                        }).catch(() => { })
                    })
            }

            async function editImage() {

                let request = args.slice(2).join(' ')

                if (!request)
                    return message.reply(`${e.Deny} | Forneça o nome ou o link da imagem do personagem que você quer editar a imagem.\n\`${prefix}quiz edit image <Nome do Personagem> ou <Link Do Personagem>\``)

                let has = characters?.find(p => p.name.toLowerCase() === request?.toLowerCase()
                    || p.name.toLowerCase().includes(request?.toLowerCase())
                    || p.image === request) || null

                if (!has)
                    return message.reply(`${e.Deny} | Nenhum personagem foi encontrado com o requisito: \`${request}\``)

                let embed = {
                    color: client.blue,
                    title: `${e.Database} Database's Edit Information System`,
                    description: `Personagem selecionado: **\`${formatString(has.name)}\`**\nInformação para edição: **\`Character's Image\`**`,
                    image: { url: has.image || null },
                    footer: { text: 'Quiz Anime Theme Selection' }
                }

                let msg = await message.reply({
                    content: `${e.Loading} | Diga no chat o novo link da imagem do personagem. Para cancelar, digite \`CANCEL\``,
                    embeds: [embed]
                })

                let collector = msg.channel.createMessageCollector({
                    filter: m => m.author.id === message.author.id,
                    time: 60000,
                    erros: ['time']
                })
                    .on('collect', Message => {

                        if (Message.content === 'CANCEL') return collector.stop()

                        if (!Message.content.includes('https://media.discordapp.net/attachments') && !Message.content.includes('https://cdn.discordapp.com/attachments/'))
                            return Message.reply(`${e.Deny} | Verique se o link da imagem segue um desses formatos: \`https://media.discordapp.net/attachments\` | \`https://cdn.discordapp.com/attachments/\``)

                        let alreadyHas = characters?.find(p => p.image === Message.content) || null

                        if (alreadyHas && alreadyHas.image === Message.content)
                            return Message.reply(`${e.Deny} | Esta imagem já pertence a este personagem`)

                        if (alreadyHas)
                            return Message.reply(`${e.Deny} | Esta imagem já pertence ao personagem **\`${formatString(alreadyHas.name) || 'NAME NOT FOUND'}\`**.`)

                        control.collected = true

                        embed.description = `Personagem selecionado: **\`${formatString(has.name)}\`**\nInformação para edição: **\`Character's Image\`**\nNew Image:`
                        embed.image.url = Message.content

                        msg.edit({
                            content: `${e.Loading} | Confirme as informações abaixo caso tudo esteja correto.\n${e.Info} | Se a imagem não apareceu, o link não é válido ou a imagem no canal package foi deletada.`,
                            embeds: [embed]
                        }).catch(() => { })

                        let emojis = ['✅', '❌']

                        for (let i of emojis) msg.react(i).catch(() => { })

                        return msg.createReactionCollector({
                            filter: (reaction, user) => emojis.includes(reaction.emoji.name) && user.id === message.author.id,
                            time: 60000,
                            max: 1,
                            erros: ['time', 'max']
                        })
                            .on('collect', (reaction) => {

                                if (reaction.emoji.name === emojis[1]) return

                                control.collectedReaction = true

                                let newSet = characters.filter(data => data.name !== has.name)

                                Database.Characters.set('Characters', [{ name: has.name, image: Message.content }, ...newSet])

                                embed.color = client.green
                                embed.description = `Personagem selecionado: **\`${formatString(has.name)}\`**\nInformação para edição: **\`Character's Image\`**`
                                embed.image.url = null

                                return msg.edit({
                                    content: `${e.Check} | A imagem do personagem **\`${formatString(has.name)}\`** foi alterada com sucesso.`,
                                    embeds: [
                                        embed,
                                        {
                                            color: client.blue,
                                            title: `New Image`,
                                            image: { url: Message.content }
                                        },
                                        {
                                            color: client.blue,
                                            title: `Old Image`,
                                            image: { url: has.image }
                                        }
                                    ]
                                }).catch(() => { })

                            })
                            .on('end', () => {
                                if (control.collectedReaction) return
                                return msg.edit({
                                    content: `${e.Deny} | Comando cancelado.`,
                                    embeds: []
                                }).catch(() => { })
                            })
                    })
                    .on('end', () => {
                        if (control.collected) return
                        return msg.edit({
                            content: `${e.Deny} | Comando cancelado.`,
                            embeds: []
                        }).catch(() => { })
                    })
            }

            async function editAnime() {

                let request = args.slice(2).join(' ')

                if (!request)
                    return message.reply(`${e.Deny} | Forneça o nome ou o link do personagem que você quer editar o anime.\n\`${prefix}quiz edit anime <Nome do Personagem> ou <Link Do Personagem>\``)

                let has = characters?.find(p => p.name.toLowerCase() === request?.toLowerCase()
                    || p.name.toLowerCase().includes(request?.toLowerCase())
                    || p.image === request) || null

                if (!has)
                    return message.reply(`${e.Deny} | Nenhum personagem foi encontrado com o requisito: \`${request}\``)

                let embed = {
                    color: client.blue,
                    title: `${e.Database} Database's Edit Information System`,
                    description: `Personagem selecionado: **\`${formatString(has.name)}\`**\nInformação para edição: **\`Character's Anime\`**`,
                    image: { url: has.image || null },
                    footer: { text: 'Quiz Anime Theme Selection' }
                }

                let msg = await message.reply({
                    content: `${e.Loading} | Diga no chat o novo anime do personagem. Para cancelar, digite \`CANCEL\``,
                    embeds: [embed]
                })

                let collector = msg.channel.createMessageCollector({
                    filter: m => m.author.id === message.author.id,
                    time: 60000,
                    erros: ['time']
                })
                    .on('collect', Message => {

                        if (Message.content === 'CANCEL') return collector.stop()

                        if (has.anime === Message.content)
                            return Message.reply(`${e.Deny} | Este anime já foi configurado com este personagem`)

                        control.collected = true
                        embed.description = `Personagem selecionado: **\`${formatString(has.name)}\`**\nInformação para edição: **\`Character's Anime\`**\nNew Anime Data: \`${Message.content}\``

                        msg.edit({
                            content: `${e.Loading} | Confirme as informações abaixo caso tudo esteja correto.`,
                            embeds: [embed]
                        }).catch(() => { })

                        let emojis = ['✅', '❌']

                        for (let i of emojis) msg.react(i).catch(() => { })

                        return msg.createReactionCollector({
                            filter: (reaction, user) => emojis.includes(reaction.emoji.name) && user.id === message.author.id,
                            time: 60000,
                            max: 1,
                            erros: ['time', 'max']
                        })
                            .on('collect', (reaction) => {

                                if (reaction.emoji.name === emojis[1]) return

                                control.collectedReaction = true

                                let newSet = characters.filter(data => data.name !== has.name)

                                Database.Characters.set('Characters', [{ name: has.name, image: has.image, anime: Message.content }, ...newSet])

                                embed.color = client.green
                                embed.description = `Personagem selecionado: **\`${formatString(has.name)}\`**\nInformação para edição: **\`Character's Anime\`**\nNew Anime Data: \`${Message.content}\``
                                embed.image.url = null

                                return msg.edit({
                                    content: `${e.Check} | O anime do personagem **\`${formatString(has.name)}\`** foi alterada com sucesso para **\`${Message.content}\`**.`,
                                    embeds: [embed]
                                }).catch(() => { })

                            })
                            .on('end', () => {
                                if (control.collectedReaction) return
                                return msg.edit({
                                    content: `${e.Deny} | Comando cancelado.`,
                                    embeds: []
                                }).catch(() => { })
                            })
                    })
                    .on('end', () => {
                        if (control.collected) return
                        return msg.edit({
                            content: `${e.Deny} | Comando cancelado.`,
                            embeds: []
                        }).catch(() => { })
                    })
            }

        }

        async function deleteCharacter() {

            let { Rody, Gowther } = Database.Names

            if (![Rody, Gowther].includes(message.author.id))
                return message.reply(`${e.Admin} | Apenas os administradores do quiz *Anime Theme* tem o poder de deletar personagens.`)

            let characters = Database.Characters.get('Characters') || [],
                image = args[1],
                name = args.slice(1).join(' ')?.toLowerCase()

            if (!image)
                return message.reply(`${e.Deny} | \`${prefix}quiz del <imageLink> <Nome do Personagem>\``)

            let has = characters?.find(p => p.name.toLowerCase() === args.join(' ')?.toLowerCase()
                || p.name.toLowerCase().includes(args[1]?.toLowerCase())
                || p.image === args[0]) || null

            if (!has)
                return message.reply(`${e.Deny} | Esse personagem não existe no banco de dados.`)

            let msg = await message.reply({
                content: `${e.QuestionMark} | Você confirma deletar o personagem **\`${formatString(has.name)}\`** do banco de dados do **Quiz Anime Theme**?`,
                embeds: [{
                    color: client.blue,
                    image: { url: has.image || null },
                    description: 'Se a imagem do personagem não aparecer, quer dizer que o link não é compatível.'
                }]
            }),
                emojis = ['✅', '❌'], clicked = false

            for (let i of emojis) msg.react(i).catch(() => { })
            let collector = msg.createReactionCollector({
                filter: (reaction, user) => emojis.includes(reaction.emoji.name) && user.id === message.author.id,
                time: 60000,
                max: 1,
                erros: ['time', 'max']
            })
                .on('collect', (r) => {

                    if (r.emoji.name === emojis[1])
                        return collector.stop()

                    clicked = true
                    let newSet = characters.filter(data => data.name !== has.name)

                    Database.Characters.set('Characters', [...newSet])
                    return msg.edit({
                        content: `${e.Check} | O personagem **\`${formatString(has.name)}\`** foi deletado com sucesso!`,
                        embeds: [{
                            color: client.blue,
                            image: { url: has.image || null },
                            description: null
                        }]
                    }).catch(() => { })
                })
                .on('end', () => {
                    if (clicked) return
                    return msg.edit({ content: `${e.Deny} | Comando cancelado.`, embeds: [] }).catch(() => { })
                })
        }

        async function pullChannel(channelId) {
            await Database.Client.updateOne(
                { id: client.user.id },
                { $pull: { ['GameChannels.Quiz']: channelId } }
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
                { $unset: { ['GameChannels.Quiz']: 1 } }
            )

            return message.reply(`${e.Check} | Todos os canais registrados no quiz foram deletados da minha database.`)
        }

        function pushNewCaracter(msg, { name: name, image: image, anime: anime }) {

            Database.Characters.push('Characters', { name: name, image: image, anime: anime })
            return msg.edit({
                content: `${e.Check} | Personagem adicionado com sucesso!`,
                embeds: [{
                    color: client.blue,
                    image: { url: image || null },
                    description: `Nome: **\`${formatString(name)}\`**\nAnime: **\`${anime || '\`ANIME NOT FOUND\`'}\`**`
                }]
            }).catch(() => { })

        }

        async function startAnimeThemeQuiz() {

            control.embed
                .setColor(client.blue)
                .setTitle(`${e.Hmmm} ${client.user.username}'s Quiz Anime Theme`)
                .setDescription(`${e.Loading} | Obtendo personagens... Prepare-se!`)

            randomizeCharacters(0)
            let msg = await message.channel.send({ embeds: [control.embed] })

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
                Msg?.delete().catch(() => registerChannelControl('pull', 'Quiz', message.channel.id))

            control.embed
                .setDescription(`${e.Loading} | Qual o nome deste personagem?`)
                .setImage(control.atualCharacter.image || null)
                .setFooter({ text: `Round: ${control.rounds || 0}` })

            let msg = await message.channel.send({ embeds: [control.embed] }).catch(() => registerChannelControl('pull', 'Quiz', message.channel.id))

            return msg.channel.createMessageCollector({
                filter: m => collectorFilter(m),
                idle: 15000,
                max: 1,
                errors: ['idle', 'max']
            })
                .on('collect', async Message => {

                    control.collectedMessage = true

                    control.embed
                        .setDescription(`${e.Check} | ${Message.author} acertou o personagem!\n👤 | Personagem: **\`${formatString(control.atualCharacter.name)}\`** from **\`${control.atualCharacter?.anime || 'ANIME NOT FOUND'}\`**\n \n${e.Loading} | Próximo personagem...`)
                        .setImage(null)

                    msg.delete().catch(() => registerChannelControl('push', 'Quiz', message.channel.id))
                    await randomizeCharacters(0)
                    let toDelMessage = await Message.reply({ embeds: [control.embed] }).catch(() => registerChannelControl('push', 'Quiz', message.channel.id))

                    await addPoint(Message.author)
                    return setTimeout(async () => {
                        await toDelMessage.delete().catch(() => { })
                        startCharactersGame()
                    }, 4000)

                })
                .on('end', () => {

                    if (control.collectedMessage) return control.collected = false

                    registerChannelControl('pull', 'Quiz', message.channel.id)
                    control.embed
                        .setColor(client.red)
                        .setDescription(`${e.Deny} | Ninguém acertou.\n👤 | Personagem: **\`${formatString(control.atualCharacter.name)}\`** from **\`${control.atualCharacter?.anime}\`**\n🔄 | ${control.rounds || 0} Rounds`)
                        .setFooter({ text: `Quiz Anime Theme Endded` })
                    msg.delete().catch(() => { })

                    return message.channel.send({ embeds: [control.embed] }).catch(() => { })
                })
        }

        function addPoint(User, justAdd = false) {

            let data = control.usersPoints.find(data => data.name === User.username)

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

            if (control.embed.fields.length === 1)
                control.embed.spliceFields(0, 1, [{ name: '🏆 Pontuação', value: `${ranking || `${e.Deny} RANKING BAD FORMATED`}` }])
            else control.embed.addField('🏆 Pontuação', `${ranking || `${e.Deny} RANKING BAD FORMATED`}${control.usersPoints.length > 5 ? `\n+${control.usersPoints.length - 5} players` : ''}`)

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
}