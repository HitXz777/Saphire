const { e } = require('../../../../JSON/emojis.json'),
    IsUrl = require('../../../../modules/functions/plugins/isurl'),
    { formatString, emoji } = require('../plugins/gamePlugins')

class flagGame {

    async init(client, message, args, prefix, MessageEmbed, Database) {

        let flags = Database.Flags.get('Flags') || [],
            control = { atualFlag: {}, usersPoints: [], rounds: 0, collected: false, winners: [], alreadyAnswer: [], wrongAnswers: [] },
            embed = new MessageEmbed()

        if (['add', 'adicionar', '+', 'new'].includes(args[0]?.toLowerCase())) return addFlag()
        if (['remove', 'del', '-'].includes(args[0]?.toLowerCase())) return removeFlag()
        if (['editar', 'edit'].includes(args[0]?.toLowerCase())) return editFlag()
        if (['list', 'lista', 'all', 'full'].includes(args[0]?.toLowerCase())) return listFlags()
        if (['start', 'começar', 's', 'init'].includes(args[0]?.toLowerCase())) return chooseGameMode()
        if (['info', 'help', 'ajuda'].includes(args[0]?.toLowerCase())) return flagInfo()
        if (['points', 'pontos', 'p'].includes(args[0]?.toLowerCase())) return flagPoints()
        if (['noimage', 'semimagem', 'noflag'].includes(args[0]?.toLowerCase())) return flagWithoutImage()

        let has = flags?.find(data => data.flag == args[0] || data.country == args.join(' ')?.toLowerCase() || data.image === args[0]) || null
        if (args[0] && has) return showCoutry(has)

        if (args[0]) return message.reply(`${e.Deny} | Sub-comando ou nome do país inválido. Use \`${prefix}flag info\` para mais informações.`)
        return message.reply(`${e.Info} | Não sabe jogar o *Flag Game*? Use \`${prefix}flag info\`.`)

        async function addFlag() {

            let data = await Database.Client.findOne({ id: client.user.id }, 'Moderadores Administradores')

            if (![...data?.Administradores, Database.Names.Lereo, ...data?.Moderadores]?.includes(message.author.id))
                return message.reply(`${e.Admin} | Apenas moderadores e administradores do *Flag Gaming* podem adicionar novas bandeiras.`)

            let flag = args[1],
                image = args[2],
                countryName = args.slice(3).join(' ')?.toLowerCase()

            if (!flag)
                return message.reply(`${e.Info} | \`${prefix}flag add <emojiBandeira> <imageLinkBandeira> <Nome do país>\``)

            if (!image || !countryName)
                return message.reply(`${e.Deny} | Formato inválido! \`${prefix}flag add <emojiBandeira> <imageLinkBandeira> <Nome do país>\``)

            if (!image.includes('https://media.discordapp.net/attachments'))
                return message.reply(`${e.Deny} | Verique se o link da imagem segue com esse formato: \`https://media.discordapp.net/attachments\``)

            let has = flags?.find(data => data.flag == flag || data.country == countryName || data.image === image)

            if (has)
                return message.reply(`${e.Deny} | Esse país já existe no banco de dados.`)

            let msg = await message.reply(`${e.QuestionMark} | Você confirma adicionar esse país no banco de dados do Flag Game?\n"**${flag} - ${countryName}**"\n${image}`),
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
                    Database.Flags.push('Flags', { flag: flag, country: countryName, image: image })
                    return msg.edit(`${e.Check} | A bandeira "**${flag} - ${countryName}**" foi adicionada com sucesso!\n${image}`).catch(() => { })
                })
                .on('end', () => {
                    if (clicked) return
                    return msg.edit({ content: `${e.Deny} | Comando cancelado.` }).catch(() => { })
                })
        }

        async function editFlag() {

            let data = await Database.Client.findOne({ id: client.user.id }, 'Moderadores Administradores')

            if (![...data?.Administradores, Database.Names.Lereo, ...data?.Moderadores]?.includes(message.author.id))
                return message.reply(`${e.Admin} | Apenas moderadores e administradores do *Flag Gaming* podem editar bandeiras.`)

            if (['image', 'imagem'].includes(args[1]?.toLowerCase())) return editImage()
            if (['emoji'].includes(args[1]?.toLowerCase())) return editEmoji()
            if (['name', 'nome'].includes(args[1]?.toLowerCase())) return editName()
            return message.reply(`${e.Info} | Opções válidas: \`image | emoji | name\``)

            async function editImage() {

                let link = args[2],
                    country = args.slice(3).join(' ')?.toLowerCase()

                if (!link || !country)
                    return message.reply(`${e.Info} | \`${prefix}flag edit image <new link> <emoji ou nome do país>\``)

                if (!IsUrl(link) || !link?.includes('https://media.discordapp.net/attachments'))
                    return message.reply(`${e.Deny} | O link da imagem não é um link válido. Verique se o formato dele é compátivel com \`https://media.discordapp.net/attachments\``)

                let has = flags?.find(data => data.flag == country || data.country == country)

                if (!has)
                    return message.reply(`${e.Deny} | Esse país não existe no meu banco de dados.`)

                if (link === has.image)
                    return message.reply(`${e.Deny} | Este já é o link da imagem atual deste país.`)

                let alreadyExist = flags.find(data => data.image === link)

                if (alreadyExist)
                    return message.reply(`${e.Deny} | Está imagem já foi configurada no país **${alreadyExist.flag || '\`EMOJI NOT FOUND\`'} - ${formatString(alreadyExist.country) || '\`NAME NOT FOUND\`'}**`)

                let msg = await message.reply(`${e.QuestionMark} | Você confirma editar a imagem do país "**${has.flag || '\`EMOJI NOT FOUND\`'} - ${formatString(has.country) || '\`NAME NOT FOUND\`'}**" no banco de dados do Flag Game?\nAtual Image: ${has.image || '\`IMAGE NOT FOUND\`'}\nNew Image: ${link}`),
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
                        let flagIndex = flags.findIndex(data => data.flag == country || data.country == country)

                        flags.splice(flagIndex, 1)
                        Database.Flags.set('Flags', [{ flag: has.flag, country: has.country, image: link }, ...flags])
                        return msg.edit(`${e.Check} | A bandeira "**${has.flag || '\`EMOJI NOT FOUND\`'} - ${formatString(has.country) || '\`NAME NOT FOUND\`'}**" foi editada com sucesso!\nNew Flag: ${link}`).catch(() => { })
                    })
                    .on('end', () => {
                        if (clicked) return
                        return msg.edit({ content: `${e.Deny} | Comando cancelado.` }).catch(() => { })
                    })

            }

            async function editName() {

                let name = args[2],
                    country = args.slice(3).join(' ')?.toLowerCase()

                if (!name || !country)
                    return message.reply(`${e.Info} | \`${prefix}flag edit name <emoji> ou <nome> ou <link da imagem>\``)

                if (name.length > 40 && (!IsUrl(name) || !name?.includes('https://media.discordapp.net/attachments')))
                    return message.reply(`${e.Deny} | O link da imagem não é um link válido. Verique se o formato dele é compátivel com \`https://media.discordapp.net/attachments\``)

                let has = flags?.find(data => data.flag == name || data.image == name || data.country == name)

                if (!has)
                    return message.reply(`${e.Deny} | Esse país não existe no meu banco de dados.`)

                if (country === has.country)
                    return message.reply(`${e.Deny} | Este já é o nome atual deste país.`)

                let alreadyExist = flags.find(data => data.country === country)

                if (alreadyExist)
                    return message.reply(`${e.Deny} | Este nome já foi configurado no país **${alreadyExist.flag || '\`EMOJI NOT FOUND\`'} - ${formatString(alreadyExist.country) || '\`NAME NOT FOUND\`'}**`)

                let msg = await message.reply(`${e.QuestionMark} | Você confirma editar o nome do país "**${has.flag || '\`EMOJI NOT FOUND\`'} - ${formatString(has.country) || '\`NAME NOT FOUND\`'}**" no banco de dados do Flag Game?\nAtual Name: ${formatString(has.country) || '\`NAME NOT FOUND\`'}\nNew Name: ${country}`),
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
                        let flagIndex = flags.findIndex(data => data.flag == name || data.image == name || data.country == name)

                        flags.splice(flagIndex, 1)
                        Database.Flags.set('Flags', [{ flag: has.flag, country: country, image: has.image }, ...flags])
                        return msg.edit(`${e.Check} | A bandeira "**${has.flag || '\`EMOJI NOT FOUND\`'} - ${formatString(has.country) || '\`NAME NOT FOUND\`'}**" foi editada com sucesso!\nNew Name: ${formatString(country)}`).catch(() => { })
                    })
                    .on('end', () => {
                        if (clicked) return
                        return msg.edit({ content: `${e.Deny} | Comando cancelado.` }).catch(() => { })
                    })

            }

            async function editEmoji() {

                let emoji = args[2],
                    country = args.slice(3).join(' ')?.toLowerCase()

                if (!emoji || !country)
                    return message.reply(`${e.Info} | \`${prefix}flag edit emoji <nome do país> ou <link da imagem>\``)

                if (emoji.length > 10 && !IsUrl(country) || !country?.includes('https://media.discordapp.net/attachments'))
                    return message.reply(`${e.Deny} | O link da imagem não é um link válido. Verique se o formato dele é compátivel com \`https://media.discordapp.net/attachments\``)

                let has = flags?.find(data => data.country == country || data.image == country)

                if (!has)
                    return message.reply(`${e.Deny} | Esse país não existe no meu banco de dados.`)

                if (emoji === has.flag)
                    return message.reply(`${e.Deny} | Este já é o emoji atual deste país.`)

                let alreadyExist = flags.find(data => data.flag === emoji)

                if (alreadyExist)
                    return message.reply(`${e.Deny} | Este emojis já foi configurado no país **${alreadyExist.flag || '\`EMOJI NOT FOUND\`'} - ${formatString(alreadyExist.country) || '\`NAME NOT FOUND\`'}**`)

                let msg = await message.reply(`${e.QuestionMark} | Você confirma editar o emoji do país "**${has.flag || '\`EMOJI NOT FOUND\`'} - ${formatString(has.country) || '\`NAME NOT FOUND\`'}**" no banco de dados do Flag Game?\nAtual Emoji: ${has.flag || '\`NAME NOT FOUND\`'}\nNew Emoji: ${emoji}`),
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
                        let flagIndex = flags.findIndex(data => data.country == country || data.image == country)

                        flags.splice(flagIndex, 1)
                        Database.Flags.set('Flags', [{ flag: emoji, country: has.country, image: has.image }, ...flags])
                        return msg.edit(`${e.Check} | A bandeira "**${has.flag || '\`EMOJI NOT FOUND\`'} - ${formatString(has.country) || '\`NAME NOT FOUND\`'}**" foi editada com sucesso!\nNew Emoji: ${emoji}`).catch(() => { })
                    })
                    .on('end', () => {
                        if (clicked) return
                        return msg.edit({ content: `${e.Deny} | Comando cancelado.` }).catch(() => { })
                    })

            }

        }

        async function removeFlag() {

            let data = await Database.Client.findOne({ id: client.user.id }, 'Moderadores Administradores')

            if (![...data?.Administradores, Database.Names.Lereo, ...data?.Moderadores]?.includes(message.author.id))
                return message.reply(`${e.Admin} | Apenas moderadores e administradores do *Flag Gaming* podem remover bandeiras.`)

            let args1 = args.slice(1).join(' ')

            if (!args1)
                return message.reply(`${e.Info} | \`${prefix}flag del <emojiBandeira> ou <imageLink> ou <Nome do país>\``)

            if (!args1.includes('https://media.discordapp.net/attachments'))
                args1 = args1.toLowerCase()

            let has = flags?.find(data => data.flag == args1 || data.country == args1 || data.image == args1)

            if (!has)
                return message.reply(`${e.Deny} | Esse país não existe no meu banco de dados.`)

            let msg = await message.reply(`${e.QuestionMark} | Você confirma remover o país "**${has.flag || '\`EMOJI NOT FOUND\`'} - ${formatString(has.country) || '\`NAME NOT FOUND\`'}**" do banco de dados do Flag Game?\n${has.image || '\`IMAGE NOT FOUND\`'}`),
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
                    let newSet = flags.filter(data => data.country !== has.country)

                    Database.Flags.set('Flags', [...newSet])
                    return msg.edit(`${e.Check} | A bandeira "**${has.flag || '\`EMOJI NOT FOUND\`'} - ${formatString(has.country) || '\`NAME NOT FOUND\`'}**" foi removida com sucesso!\n${has.image || '\`IMAGE NOT FOUND\`'}`).catch(() => { })
                })
                .on('end', () => {
                    if (clicked) return
                    return msg.edit({ content: `${e.Deny} | Comando cancelado.` }).catch(() => { })
                })
        }

        async function listFlags() {

            let data = await Database.Client.findOne({ id: client.user.id }, 'Moderadores Administradores')

            if (![...data?.Administradores, Database.Names.Lereo, ...data?.Moderadores]?.includes(message.author.id))
                return message.reply(`${e.Admin} | Apenas moderadores e administradores da Saphire's Team possue o acesso a lista de Bandeiras.`)

            if (!flags || flags.length === 0)
                return message.reply(`${e.Deny} | Não há nenhuma bandeira no meu banco de dados.`)

            let embeds = EmbedGenerator(),
                control = 0

            let msg = await message.reply({ embeds: [embeds[0]] })
            if (embeds.length === 1) return
            let emojis = ['⏪', '⬅️', '➡️', '⏩', '❌']

            for (let i of emojis) msg.react(i).catch(() => { })
            let collector = msg.createReactionCollector({
                filter: (reaction, user) => emojis.includes(reaction.emoji.name) && user.id === message.author.id,
                idle: 30000,
                errors: ['idle']
            })
                .on('collect', async (reaction) => {

                    if (reaction.emoji.name === emojis[4])
                        return collector.stop()

                    if (reaction.emoji.name === emojis[0])
                        control = 0

                    if (reaction.emoji.name === emojis[3])
                        control = embeds.length - 1

                    if (reaction.emoji.name === emojis[1]) {
                        control--
                        if (control < 0) control = embeds.length - 1
                    }

                    if (reaction.emoji.name === emojis[2]) {
                        control++
                        if (control >= embeds.length) control = 0
                    }

                    return msg.edit({ embeds: [embeds[control]] }).catch(() => { })
                })
                .on('end', () => {
                    let embed = msg.embeds[0]
                    embed.color = client.red
                    embed.footer.text = `${embed.footer.text} | Comando cancelado`
                    return msg.edit({ embeds: [embed] }).catch(() => { })

                })

            function EmbedGenerator() {

                let array = [...new Set(flags.map(x => x.country?.toLowerCase()))].sort()

                let amount = 15,
                    Page = 1,
                    embeds = [],
                    length = array.length / 15 <= 1 ? 1 : parseInt((array.length / 15) + 1)

                for (let i = 0; i < array.length; i += 15) {

                    let current = array.slice(i, amount),
                        description = current.map(data => {

                            let f = flags.find(d => d.country?.toLowerCase() === data)

                            return `> ${f.flag} **${formatString(f.country)}**`
                        }).join("\n")

                    if (current.length > 0) {

                        embeds.push({
                            color: client.blue,
                            title: `${e.Database} Database Flag Game List - ${Page}/${length}`,
                            description: `${description}`,
                            footer: {
                                text: `${array.length} Flags contabilizadas`
                            }
                        })

                        Page++
                        amount += 15

                    }

                }

                return embeds;
            }
        }

        async function chooseGameMode() {

            let channels = Database.Cache.get('Flags') || []

            if (channels.includes(message.channel?.id))
                return message.reply(`${e.Deny} | Já tem um flag game rolando nesse canal. Espere ele terminar para poder iniciar outro, ok?`)

            Database.registerChannelControl('push', 'Flag', message.channel.id)

            const buttons = [
                {
                    type: 1,
                    components: [
                        {
                            type: 2,
                            label: 'Sem opções',
                            custom_id: 'noOptions',
                            style: 'PRIMARY'
                        },
                        {
                            type: 2,
                            label: 'Com opções',
                            custom_id: 'withOptions',
                            style: 'PRIMARY'
                        },
                        {
                            type: 2,
                            label: 'Cancelar',
                            custom_id: 'cancel',
                            style: 'DANGER'
                        }
                    ]
                }
            ]

            let msg = await message.reply({
                content: `${e.QuestionMark} | Qual modo de jogo você quer iniciar?`,
                components: buttons
            })

            let collector = msg.createMessageComponentCollector({
                filter: int => int.user.id === message.author.id,
                time: 15000,
                max: 1,
                erros: ['time', 'max']
            })
                .on('collect', async interaction => {

                    let customId = interaction.customId

                    if (customId === 'cancel')
                        return collector.stop()

                    control.initied = true

                    if (customId === 'noOptions')
                        return startFlagGame()

                    if (customId === 'withOptions')
                        return startGameWithOptions()
                })
                .on('end', () => {
                    msg.delete(() => { })
                    if (control.initied) return
                    return Database.registerChannelControl('pull', 'Flag', message.channel?.id)
                })
        }

        async function startGameWithOptions() {

            embed
                .setColor(client.blue)
                .setTitle(`🎌 ${client.user.username} Flag Game Options Mode`)
                .setDescription(`${e.Loading} | Carregando bandeiras e opções... Prepare-se!`)

            let Msg = await message.channel.send({ embeds: [embed] })

            return setTimeout(() => startGameWithButtons(Msg), 4000)
        }

        async function startFlagGame() {

            embed
                .setColor(client.blue)
                .setTitle(`🎌 ${client.user.username} Flag Game`)
                .setDescription(`${e.Loading} | Carregando bandeira... Prepare-se!`)

            randomizeFlags(0)
            let Msg = await message.channel.send({ embeds: [embed] })

            setTimeout(() => start(Msg), 4000)
            return
        }

        function showCoutry(data) {

            if (!data.image)
                return message.reply(`${e.Deny} | Os moderadores da Saphire's Team ainda não adicionaram uma bandeira para este país.`)

            return message.reply({
                embeds: [
                    embed
                        .setColor(client.blue)
                        .setTitle(`${e.Database} ${client.user.username} Flag Info Database`)
                        .setDescription(`**${data.flag || '\`EMOJI NOT FOUND\`'} - ${formatString(data.country) || '\`NAME NOT FOUND\`'}**`)
                        .setImage(data.image || null)
                        .setFooter({ text: 'Se não apareceu a imagem da bandeira, este país não possui bandeira ou o link é inválido.' })
                ]
            })
        }

        async function flagWithoutImage() {

            let data = await Database.Client.findOne({ id: client.user.id }, 'Moderadores Administradores')

            if (![...data?.Administradores, Database.Names.Lereo, ...data?.Moderadores]?.includes(message.author.id))
                return message.reply(`${e.Admin} | Apenas moderadores e administradores do *Flag Gaming* podem visualizar bandeiras indisponíveis.`)

            let arr = []

            for (let f of flags)
                if (!f.image) arr.push(f)

            if (arr.length === 0)
                return message.reply(`${e.Check} | Todos os países estão com bandeiras no meu banco de dados.`)

            let format = arr.map(flag => `${flag.flag} \`${formatString(flag.country)}\``).join(', ')

            return message.reply(`${e.Warn} | Estes são os países que estão sem bandeiras.\n> ${format}`).catch(() => {

                let newFormat = format.slice(0, 1500)
                return message.reply(`${e.Warn} | Estes são os países que estão sem bandeiras.\n> ${newFormat}...`)
            })
        }

        async function startGameWithButtons(Msg) {

            control.rounds++
            await generateButtons()

            if (Msg)
                Msg?.delete().catch(() => Database.registerChannelControl('pull', 'Flag', message.channel?.id))

            embed
                .setDescription(`${e.Loading} | Qual é a bandeira?\n${control.atualFlag.flag} - ???`)
                .setImage(control.atualFlag.image || null)
                .setFooter({ text: `Round: ${control.rounds}` })

            let msg = await message.channel.send({
                embeds: [embed],
                components: control.buttons
            }).catch(() => Database.registerChannelControl('pull', 'Flag', message.channel?.id))

            msg.createMessageComponentCollector({
                filter: int => true,
                time: 10000,
                errors: ['time']
            })
                .on('collect', int => {
                    int.deferUpdate().catch(() => { })

                    if (control.alreadyAnswer?.includes(int.user.id)) return
                    control.alreadyAnswer.push(int.user.id)

                    if (control.atualFlag.country === int.customId)
                        control.winners.push({ username: int.user.username, id: int.user.id })

                    return
                })
                .on('end', async () => {

                    let winners = control.winners

                    if (winners.length === 0) {

                        Database.registerChannelControl('pull', 'Flag', message.channel?.id)
                        embed
                            .setColor(client.red)
                            .setDescription(`${e.Deny} | Ninguém acertou o país.\n${control.atualFlag.flag} - ${formatString(control.atualFlag?.country)}\n🔄 ${control.rounds} Rounds`)
                            .setFooter({ text: `Flag Game encerrado.` })
                        msg.delete().catch(() => { })

                        return message.channel.send({ embeds: [embed] }).catch(() => { })
                    }

                    embed
                        .setDescription(`${e.Check} | ${winners.length > 1 ? `${winners.slice(0, 4)?.map(u => u.username).join(', ')}${winners.length - 4 > 0 ? ` e mais ${winners.length - 4} jogadores` : ''} acertaram` : `${winners[0].username} acertou`} o país!\n${control.atualFlag.flag} - ${formatString(control.atualFlag?.country)}\n \n${e.Loading} Próxima bandeira...`)
                        .setImage(null)

                    msg.delete().catch(() => Database.registerChannelControl('pull', 'Flag', message.channel?.id))
                    let toDelMessage = await message.channel.send({ embeds: [embed], components: [] }).catch(() => Database.registerChannelControl('pull', 'Flag', message.channel?.id))

                    for (let u of winners)
                        addPoint({ username: u.username, id: u.id }, true)

                    control.winners = []
                    control.alreadyAnswer = []
                    control.wrongAnswers = []
                    refreshField()
                    return setTimeout(async () => {
                        await toDelMessage.delete().catch(() => { })
                        startGameWithButtons()
                    }, 5000)
                })

        }

        function generateButtons() {

            for (let i = 0; i < 5; i++)
                randomizeFlags(i)

            let answersArray = [...control.wrongAnswers, control.atualFlag],
                buttons = [{ type: 1, components: [] }]

            answersArray.sort(() => Math.random() - Math.random())

            for (let flag of answersArray) {
                buttons[0].components.push({
                    type: 2,
                    label: formatString(flag.country),
                    custom_id: flag.country,
                    style: 'PRIMARY'
                })
            }

            control.buttons = buttons
            return
        }

        function flagInfo() {
            return message.reply({
                embeds: [
                    embed
                        .setColor(client.blue)
                        .setTitle(`🎌 ${client.user.username} Flag Gaming`)
                        .setDescription(`Neste jogo você irá encontrar **${flags.length || 0} bandeiras** para adivinhar o nome e testar seus conhecimentos. E claro, competitir com os membros do servidor para mostrar quem conhece mais bandeiras.`)
                        .setImage(flags[Math.floor(Math.random() * flags.length)]?.image || null)
                        .addFields(
                            {
                                name: `${e.FirePo} Comece uma partida`,
                                value: `\`${prefix}flag start\``
                            },
                            {
                                name: '🔍 Olhe a bandeira do país',
                                value: `\`${prefix}flag <NomeDoPaís> ou <EmojiDoPaís>\``
                            },
                            {
                                name: '✍️ Veja os acertos',
                                value: `\`${prefix}flag <points> [@user]\``
                            },
                            {
                                name: `${e.Admin} Saphire's Team Administration`,
                                value: `\`${prefix}flag new\` - Adicione uma nova bandeira\n\`${prefix}flag remove\` - Remova uma bandeira\n\`${prefix}flag edit <emoji/name/image>\` - Edite uma bandeira\n\`${prefix}flag list\` - Lista de todos as bandeiras\n\`${prefix}flag noflag\` - Países sem bandeira no banco de dados`
                            },
                            {
                                name: '📝 Créditos',
                                value: `${e.Gear} Código fonte e automatização: ${client.users.cache.get(Database.Names.Rody)?.tag || '\`NOT FOUND\`'}\n${e.bigbrain} Emojis, Países, Bandeiras, Recursos: ${client.users.cache.get(Database.Names.Lereo)?.tag || '\`NAME NOT FOUND\`'} & ${client.users.cache.get(Database.Names.Moana)?.tag || '\`NOT FOUND\`'}\n${e.Stonks} Dicas de funcionalidades: ${client.users.cache.get(Database.Names.Dspofu)?.tag || '\`NOT FOUND\`'}`
                            }
                        )
                        .setFooter({ text: '<> obrigatório | [] opicional' })
                ]
            })
        }

        function randomizeFlags(wrongAnswer = 0) {

            if (wrongAnswer > 0) {
                let flag = flags[Math.floor(Math.random() * flags.length)]

                if (flag.country === control.atualFlag.country || control.wrongAnswers.some(f => f.country === flag.country)) return randomizeFlags(1)
                else control.wrongAnswers.push(flag)
                return
            }

            let flag = flags[Math.floor(Math.random() * flags.length)]
            if (flag.country === control.atualFlag.country) return randomizeFlags(0)
            control.atualFlag = flag
            return
        }

        async function start(Msg) {

            control.rounds++

            if (Msg)
                Msg?.delete().catch(() => Database.registerChannelControl('pull', 'Flag', message.channel?.id))

            embed
                .setDescription(`${e.Loading} | Qual é a bandeira?\n${control.atualFlag.flag} - ???`)
                .setImage(control.atualFlag.image || null)
                .setFooter({ text: `Round: ${control.rounds}` })

            let msg = await message.channel.send({ embeds: [embed] }).catch(() => Database.registerChannelControl('pull', 'Flag', message.channel?.id))

            return msg.channel.createMessageCollector({
                filter: m => m.content?.toLowerCase() == control.atualFlag?.country,
                idle: 15000,
                max: 1,
                errors: ['idle', 'max']
            })
                .on('collect', async Message => {

                    control.collected = true

                    await addPoint(Message.author)
                    embed
                        .setDescription(`${e.Check} | ${Message.author} acertou o país!\n${control.atualFlag.flag} - ${formatString(control.atualFlag?.country)}\n \n${e.Loading} Próxima bandeira...`)
                        .setImage(null)

                    msg.delete().catch(() => Database.registerChannelControl('pull', 'Flag', message.channel?.id))
                    await randomizeFlags(0)
                    let toDelMessage = await Message.reply({ embeds: [embed] }).catch(() => Database.registerChannelControl('pull', 'Flag', message.channel?.id))

                    return setTimeout(async () => {
                        await toDelMessage.delete().catch(() => { })
                        start()
                    }, 4000)

                })
                .on('end', () => {

                    if (control.collected) return control.collected = false

                    Database.registerChannelControl('pull', 'Flag', message.channel?.id)
                    embed
                        .setColor(client.red)
                        .setDescription(`${e.Deny} | Ninguém acertou o país.\n${control.atualFlag.flag} - ${formatString(control.atualFlag?.country)}\n🔄 ${control.rounds} Rounds`)
                        .setFooter({ text: `Flag Game encerrado.` })
                    msg.delete().catch(() => { })

                    return message.channel.send({ embeds: [embed] }).catch(() => { })
                })
        }

        function addPoint(User, justAdd = false) {

            let data = control.usersPoints.find(data => data.name === User.username)

            data?.name
                ? data.points++
                : control.usersPoints.push({ name: User.username, points: 1 })

            if (justAdd)
                Database.addGamingPoint(User.id, 'FlagCount', 1)

            if (justAdd) return

            let ranking = control.usersPoints
                .sort((a, b) => b.points - a.points)
                .slice(0, 5)
                .map((d, i) => `${emoji(i)} ${d.name} - ${d.points} pontos`)
                .join('\n')

            if (embed.fields.length === 1)
                embed.spliceFields(0, 1, [{ name: '🏆 Pontuação', value: `${ranking || `${e.Deny} RANKING BAD FORMATED`}` }])
            else embed.addField('🏆 Pontuação', `${ranking || `${e.Deny} RANKING BAD FORMATED`}${control.usersPoints.length > 5 ? `\n+${control.usersPoints.length - 5} players` : ''}`)

            Database.addGamingPoint(User.id, 'FlagCount', 1)
            return
        }

        function refreshField() {
            let ranking = control.usersPoints
                .sort((a, b) => b.points - a.points)
                .slice(0, 5)
                .map((d, i) => `${emoji(i)} ${d.name} - ${d.points} pontos`)
                .join('\n')

            if (embed.fields.length === 1)
                embed.spliceFields(0, 1, [{ name: '🏆 Pontuação', value: `${ranking || `${e.Deny} RANKING BAD FORMATED`}` }])
            else embed.addField('🏆 Pontuação', `${ranking || `${e.Deny} RANKING BAD FORMATED`}${control.usersPoints.length > 5 ? `\n+${control.usersPoints.length - 5} players` : ''}`)

        }

        async function flagPoints() {

            let user = client.getUser(client, message, args, 'user') || message.author

            if (!user?.id) return message.reply(`${e.Deny} | Nenhum usuário encontrado.`)

            let data = await Database.User.findOne({ id: user.id }, 'GamingCount.FlagCount'),
                points = data?.GamingCount?.FlagCount || 0,
                format = user.id === message.author.id ? 'Você' : user.username

            return message.reply(`${e.Info} | ${format} acertou ${points} bandeiras no Flag Gaming.`)
        }

    }

}

module.exports = flagGame