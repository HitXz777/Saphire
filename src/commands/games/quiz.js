const { e } = require('../../../JSON/emojis.json'),
    quizData = require('../../../JSON/quiz.json'),
    { formatString } = require('./plugins/gamePlugins')

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
            control = {},
            fastMode = 25000

        if (['status', 'stats', 'st'].includes(args[0]?.toLowerCase())) return quizStatus()
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

        function quizInfo(msg) {
            return msg.edit(
                {
                    content: null,
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
            ).catch(() => { })
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

            if (['fast', 'rapido', 'rápido', 'speed'].includes(args[1]?.toLowerCase())) fastMode = 5000

            let msg = await message.channel.send(`${e.Loading} | ${fastMode === 5000 ? '⚡ **Speed Mode** | ' : ''}Inicializando Quiz... Prepare-se!`)

            registerChannel(message.channel.id)
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
                    description: `**${formatString(data.name) || '\`NAME NOT FOUND\`'}**`,
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
                .on('collect', interaction => {
                    interaction.deferUpdate().catch(() => { })

                    let customId = interaction.values[0]
                    if (customId === 'animeMode') return msg.edit(`${e.Warn} | Este comando está em construção.`)
                    if (customId === 'cancel') return collector.stop()
                    if (customId === 'quizInfo') return quizInfo(msg)

                    msg.delete().catch(() => { })
                    if (customId === 'normalMode') return init()
                    if (customId === 'fastMode') {
                        args[1] = 'fast'
                        return init()
                    }

                })
                .on('end', () => msg.edit({ content: `${e.Deny} | Comando cancelado`, components: [] }))
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

        async function registerChannel(channelId) {
            await Database.Client.updateOne(
                { id: client.user.id },
                { $push: { ['GameChannels.Quiz']: channelId } }
            )
            return
        }

        async function listCharacters() {

            let data = await Database.Client.findOne({ id: client.user.id }, 'Moderadores Administradores')

            if (!data?.Administradores?.includes(message.author.id) && !data?.Moderadores?.includes(message.author.id))
                return message.reply(`${e.Admin} | Apenas moderadores e administradores da Saphire's Team possue o acesso a lista de perrsonagem do *Quiz Anime Theme*.`)

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
                        description = current.map(p => `> \`${formatString(p.name)}\``).join("\n"),
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

            if (!image.includes('https://media.discordapp.net/attachments'))
                return message.reply(`${e.Deny} | Verique se o link da imagem segue com esse formato: \`https://media.discordapp.net/attachments\``)

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
                    Database.Characters.push('Characters', { name: name, image: image })
                    return msg.edit({
                        content: `${e.Check} | O personagem **\`${name}\`** foi adicionado com sucesso!`,
                        embeds: [{
                            color: client.blue,
                            image: { url: image || null },
                            description: null
                        }]
                    }).catch(() => { })
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
            return message.reply(`${e.Deny} | Forneça o nome ou o link da imagem para que eu possa buscar um personagem no banco de dados. Logo após, forneça o conteúdo a ser editado.\n\`${prefix}quiz edit <name/image> <Nome/Link>\`\n\`<comando> <editar> <oq editar> <quem editar>\``)

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
                    time: 30000,
                    erros: ['time']
                })
                    .on('collect', Message => {

                        if (Message.content === 'CANCEL') return collector.stop()

                        let alreadyHas = characters?.find(p => p.name.toLowerCase() === Message.content?.toLowerCase()
                            || p.name.toLowerCase().includes(Message.content?.toLowerCase())
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

    }
}