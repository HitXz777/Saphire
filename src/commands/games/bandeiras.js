const { e } = require('../../../JSON/emojis.json'),
    IsUrl = require('../../../modules/functions/plugins/isurl')

module.exports = {
    name: 'bandeiras',
    aliases: ['flag', 'flags', 'bandeira', 'band', 'bands'],
    category: 'games',
    emoji: '🎌',
    usage: '<bandeiras> <info>',
    description: 'Adivinhe o país das bandeiras',

    run: async (client, message, args, prefix, MessageEmbed, Database) => {

        let flags = Database.Flags.get('Flags') || [],
            control = { atualFlag: {}, usersPoints: [], rounds: 0, collected: false },
            embed = new MessageEmbed()

        if (['add', 'adicionar', '+', 'new'].includes(args[0]?.toLowerCase())) return addFlag()
        if (['remove', 'del', '-'].includes(args[0]?.toLowerCase())) return removeFlag()
        if (['editar', 'edit'].includes(args[0]?.toLowerCase())) return editFlag()
        if (['list', 'lista', 'all', 'full'].includes(args[0]?.toLowerCase())) return listFlags()
        if (['start', 'começar', 's', 'init'].includes(args[0]?.toLowerCase())) return startFlagGame()
        if (['info', 'help', 'ajuda'].includes(args[0]?.toLowerCase())) return flagInfo()
        if (['points', 'pontos', 'p'].includes(args[0]?.toLowerCase())) return flagPoints()

        let has = flags?.find(data => data.flag == args[0] || data.country == args[0]?.toLowerCase() || data.image === args[0]) || null
        if (args[0] && has) return showCoutry(has)

        if (args[0]) return message.reply(`${e.Deny} | Sub-comando ou nome do país inválido. Use \`${prefix}flag info\` para mais informações.`)
        return message.reply(`${e.Info} | Não sabe jogar o *Flag Game*? Use \`${prefix}flag info\`.`)

        async function addFlag() {

            let data = await Database.Client.findOne({ id: client.user.id }, 'Moderadores Administradores')

            if (!data?.Administradores?.includes(message.author.id) && !data?.Moderadores?.includes(message.author.id))
                return message.reply(`${e.Admin} | Apenas moderadores e administradores da Saphire's Team podem adicionar novas bandeiras no Flag Game.`)

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

            if (!data?.Administradores?.includes(message.author.id) && !data?.Moderadores?.includes(message.author.id))
                return message.reply(`${e.Admin} | Apenas moderadores e administradores da Saphire's Team podem remover bandeiras no Flag Game.`)

            if (['image', 'imagem'].includes(args[1]?.toLowerCase())) return editImage()
            if (['emoji'].includes(args[1]?.toLowerCase())) return editEmoji()
            if (['name', 'nome'].includes(args[1]?.toLowerCase())) return editName()
            return message.reply(`${e.Info} | Opções válidas: \`image | emoji | name\``)

            async function editImage() {

                let link = args[2],
                    country = args.slice(3).join(' ')?.toLowerCase()

                if (!link || !country)
                    return message.reply(`${e.Info} | \`${prefix}flag edit image <link> <emoji ou nome do país>\``)

                if (!IsUrl(link) || !link?.includes('https://media.discordapp.net/attachments'))
                    return message.reply(`${e.Deny} | O link da imagem não é um link válido. Verique se o formato dele é compátivel com \`https://media.discordapp.net/attachments\``)

                let has = flags?.find(data => data.flag == country || data.country == country)

                if (!has)
                    return message.reply(`${e.Deny} | Esse país não existe no meu banco de dados.`)

                if (link === has.image)
                    return message.reply(`${e.Deny} | Este já é o link da imagem atual deste país.`)

                let alreadyExist = flags.find(data => data.image === link)

                if (alreadyExist)
                    return message.reply(`${e.Deny} | Está imagem já foi configurada no país **${alreadyExist.flag || '\`EMOJI NOT FOUND\`'} - ${alreadyExist.country || '\`NAME NOT FOUND\`'}**`)

                let msg = await message.reply(`${e.QuestionMark} | Você confirma editar a imagem do país "**${has.flag || '\`EMOJI NOT FOUND\`'} - ${has.country || '\`NAME NOT FOUND\`'}**" no banco de dados do Flag Game?\nAtual Image: ${has.image || '\`IMAGE NOT FOUND\`'}\nNew Image: ${link}`),
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
                        return msg.edit(`${e.Check} | A bandeira "**${has.flag || '\`EMOJI NOT FOUND\`'} - ${has.country || '\`NAME NOT FOUND\`'}**" foi editada com sucesso!\nNew Flag: ${link}`).catch(() => { })
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
                    return message.reply(`${e.Info} | \`${prefix}flag edit name <emoji> ou <link da imagem>\``)

                if (name.length > 10 && !IsUrl(country) || !country?.includes('https://media.discordapp.net/attachments'))
                    return message.reply(`${e.Deny} | O link da imagem não é um link válido. Verique se o formato dele é compátivel com \`https://media.discordapp.net/attachments\``)

                let has = flags?.find(data => data.flag == country || data.image == country)

                if (!has)
                    return message.reply(`${e.Deny} | Esse país não existe no meu banco de dados.`)

                if (name === has.contry)
                    return message.reply(`${e.Deny} | Este já é o nome atual deste país.`)

                let alreadyExist = flags.find(data => data.country === name)

                if (alreadyExist)
                    return message.reply(`${e.Deny} | Este nome já foi configurado no país **${alreadyExist.flag || '\`EMOJI NOT FOUND\`'} - ${alreadyExist.country || '\`NAME NOT FOUND\`'}**`)

                let msg = await message.reply(`${e.QuestionMark} | Você confirma editar o nome do país "**${has.flag || '\`EMOJI NOT FOUND\`'} - ${has.country || '\`NAME NOT FOUND\`'}**" no banco de dados do Flag Game?\nAtual Name: ${has.country || '\`NAME NOT FOUND\`'}\nNew Name: ${name}`),
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
                        let flagIndex = flags.findIndex(data => data.flag == country || data.image == country)

                        flags.splice(flagIndex, 1)
                        Database.Flags.set('Flags', [{ flag: has.flag, country: name, image: has.image }, ...flags])
                        return msg.edit(`${e.Check} | A bandeira "**${has.flag || '\`EMOJI NOT FOUND\`'} - ${has.country || '\`NAME NOT FOUND\`'}**" foi editada com sucesso!\nNew Name: ${name}`).catch(() => { })
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
                    return message.reply(`${e.Deny} | Este emojis já foi configurado no país **${alreadyExist.flag || '\`EMOJI NOT FOUND\`'} - ${alreadyExist.country || '\`NAME NOT FOUND\`'}**`)

                let msg = await message.reply(`${e.QuestionMark} | Você confirma editar o emoji do país "**${has.flag || '\`EMOJI NOT FOUND\`'} - ${has.country || '\`NAME NOT FOUND\`'}**" no banco de dados do Flag Game?\nAtual Emoji: ${has.flag || '\`NAME NOT FOUND\`'}\nNew Emoji: ${emoji}`),
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
                        return msg.edit(`${e.Check} | A bandeira "**${has.flag || '\`EMOJI NOT FOUND\`'} - ${has.country || '\`NAME NOT FOUND\`'}**" foi editada com sucesso!\nNew Emoji: ${emoji}`).catch(() => { })
                    })
                    .on('end', () => {
                        if (clicked) return
                        return msg.edit({ content: `${e.Deny} | Comando cancelado.` }).catch(() => { })
                    })

            }

        }

        async function removeFlag() {

            let data = await Database.Client.findOne({ id: client.user.id }, 'Moderadores Administradores')

            if (!data?.Administradores?.includes(message.author.id) && !data?.Moderadores?.includes(message.author.id))
                return message.reply(`${e.Admin} | Apenas moderadores e administradores da Saphire's Team podem remover bandeiras no Flag Game.`)

            let args1 = args.slice(1).join(' ')

            if (!args1)
                return message.reply(`${e.Info} | \`${prefix}flag del <emojiBandeira> ou <imageLink> ou <Nome do país>\``)

            if (!args1.includes('https://media.discordapp.net/attachments'))
                args1 = args1.toLowerCase()

            let has = flags?.find(data => data.flag == args1 || data.country == args1 || data.image == args1)

            if (!has)
                return message.reply(`${e.Deny} | Esse país não existe no meu banco de dados.`)

            let msg = await message.reply(`${e.QuestionMark} | Você confirma remover o país "**${has.flag || '\`EMOJI NOT FOUND\`'} - ${has.country || '\`NAME NOT FOUND\`'}**" do banco de dados do Flag Game?\n${has.image || '\`IMAGE NOT FOUND\`'}`),
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
                    let flagIndex = flags.findIndex(data => data.flag == args1 || data.country == args1 || data.image == args1)

                    flags.splice(flagIndex, 1)
                    Database.Flags.set('Flags', flags)
                    return msg.edit(`${e.Check} | A bandeira "**${has.flag || '\`EMOJI NOT FOUND\`'} - ${has.country || '\`NAME NOT FOUND\`'}**" foi removida com sucesso!\n${has.image || '\`IMAGE NOT FOUND\`'}`).catch(() => { })
                })
                .on('end', () => {
                    if (clicked) return
                    return msg.edit({ content: `${e.Deny} | Comando cancelado.` }).catch(() => { })
                })
        }

        async function listFlags() {

            let data = await Database.Client.findOne({ id: client.user.id }, 'Moderadores Administradores')

            if (!data?.Administradores?.includes(message.author.id) && !data?.Moderadores?.includes(message.author.id))
                return message.reply(`${e.Admin} | Apenas moderadores e administradores da Saphire's Team possue o acesso a lista de Bandeiras.`)

            if (!flags || flags.length === 0)
                return message.reply(`${e.Deny} | Não há nenhuma bandeira no meu bando de dados.`)

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
                    length = flags.length / 15 <= 1 ? 1 : parseInt((flags.length / 15) + 1)

                for (let i = 0; i < flags.length; i += 15) {

                    let current = flags.slice(i, amount),
                        description = current.map(f => `> ${f.flag} **${f.country}**`).join("\n")

                    if (current.length > 0) {

                        embeds.push({
                            color: client.blue,
                            title: `${e.Database} Database Flag Game List - ${Page}/${length}`,
                            description: `${description}`,
                            footer: {
                                text: `${flags.length} Flags contabilizadas`
                            }
                        })

                        Page++
                        amount += 15

                    }

                }

                return embeds;
            }
        }

        async function startFlagGame() {

            let data = await Database.Client.findOne({ id: client.user.id }, 'GameChannels.Flags'),
                channels = data?.GameChannels?.Flags || []

            if (channels.includes(message.channel.id))
                return message.reply(`${e.Deny} | Já tem um flag game rolando nesse canal. Espere ele terminar para poder iniciar outro, ok?`)

            registerGameChannel()

            embed
                .setColor(client.blue)
                .setTitle(`🎌 ${client.user.username} Flag Game`)
                .setDescription(`${e.Loading} | Carregando bandeira... Prepare-se!`)

            randomizeFlags()
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
                        .setDescription(`**${data.flag || '\`EMOJI NOT FOUND\`'} - ${data.country || '\`NAME NOT FOUND\`'}**`)
                        .setImage(data.image || null)
                        .setFooter({ text: 'Se não apareceu a imagem da bandeira, este país não possui bandeira ou o link é inválido.' })
                ]
            })
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
                                value: `\`${prefix}flag new\` - Adicione uma nova bandeira\n\`${prefix}flag remove\` - Remova uma bandeira\n\`${prefix}flag edit <emoji/name/image>\` - Edite uma bandeira\n\`${prefix}flag list\` - Lista de todos as bandeiras`
                            },
                            {
                                name: '📝 Créditos',
                                value: `${e.Gear} Código fonte e automatização: ${client.users.cache.get(Database.Names.Rody)?.tag || '\`NOT FOUND\`'}\n${e.bigbrain} Emojis, Países, Bandeiras, Recursos: ${client.users.cache.get(Database.Names.Moana)?.tag || '\`NOT FOUND\`'}\n${e.Stonks} Dicas de funcionalidades: ${client.users.cache.get(Database.Names.Dspofu)?.tag || '\`NOT FOUND\`'}`
                            }
                        )
                        .setFooter({ text: '<> obrigatório | [] opicional' })
                ]
            })
        }

        function randomizeFlags() {

            let flag = flags[Math.floor(Math.random() * flags.length)]

            if (flag.country === control.atualFlag.country) return randomizeFlags()

            control.atualFlag = flag

            return
        }

        async function start(Msg) {

            control.rounds++

            if (Msg)
                Msg?.delete().catch(() => unregisterGameChannel())

            embed
                .setDescription(`${e.Loading} | Qual é a bandeira?\n${control.atualFlag.flag} - ???`)
                .setImage(control.atualFlag.image || null)
                .setFooter({ text: `Round: ${control.rounds}` })

            let msg = await message.channel.send({ embeds: [embed] }).catch(() => unregisterGameChannel())

            return msg.channel.createMessageCollector({
                filter: m => m.content?.toLowerCase() == control.atualFlag?.country,
                idle: 15000,
                max: 1,
                errors: ['idle', 'max']
            })
                .on('collect', async Message => {

                    control.collected = true

                    embed
                        .setDescription(`${e.Check} | ${Message.author} acertou o país!\n${control.atualFlag.flag} - ${control.atualFlag?.country}\n \n${e.Loading} Próxima bandeira...`)
                        .setImage(null)

                    randomizeFlags()
                    msg.delete().catch(() => unregisterGameChannel())
                    let toDelMessage = await Message.reply({ embeds: [embed] }).catch(() => unregisterGameChannel())

                    addPoint(Message.member)
                    return setTimeout(() => {
                        toDelMessage.delete().catch(() => unregisterGameChannel())
                        start()
                    }, 4000)

                })
                .on('end', () => {

                    if (control.collected) return control.collected = false

                    unregisterGameChannel()
                    embed
                        .setColor(client.red)
                        .setDescription(`${e.Deny} | Ninguém acertou o país.\n${control.atualFlag.flag} - ${control.atualFlag?.country}\n🔄 ${control.rounds} Rounds`)
                        .setFooter({ text: `Flag Game encerrado.` })
                    msg.delete().catch(() => { })

                    return message.channel.send({ embeds: [embed] }).catch(() => { })
                })
        }

        function addPoint(Member) {

            let data = control.usersPoints.find(data => data.name === Member.user.username,)

            data?.name
                ? data.points++
                : control.usersPoints.push({ name: Member.user.username, points: 1 })

            let ranking = control.usersPoints
                .slice(0, 5)
                .sort((a, b) => b.points - a.points)
                .map((d, i) => `${emoji(i)} ${d.name} - ${d.points} pontos`)
                .join('\n')

            if (embed.fields.length === 1)
                embed.spliceFields(0, 1, [{ name: '🏆 Pontuação', value: `${ranking || `${e.Deny} RANKING BAD FORMATED`}` }])
            else embed.addField('🏆 Pontuação', `${ranking || `${e.Deny} RANKING BAD FORMATED`}`)

            Database.addGamingPoint(Member.user.id, 'FlagCount', 1)
            return
        }

        function emoji(i) {
            return {
                0: '🥇',
                1: '🥈',
                2: '🥉'
            }[i] || '🏅'
        }

        async function flagPoints() {

            let user = client.getUser(client, message, args) || message.author

            if (!user?.id) return message.reply(`${e.Deny} | Nenhum usuário encontrado.`)

            let data = await Database.User.findOne({ id: user.id }, 'GamingCount.FlagCount'),
                points = data?.GamingCount?.FlagCount || 0,
                format = user.id === message.author.id ? 'Você' : user.username

            return message.reply(`${e.Info} | ${format} acertou ${points} bandeiras no Flag Gaming.`)
        }

        async function registerGameChannel() {

            await Database.Client.updateOne(
                { id: client.user.id },
                {
                    $push: { ['GameChannels.Flags']: message.channel.id }
                }
            )

        }

        async function unregisterGameChannel() {

            await Database.Client.updateOne(
                { id: client.user.id },
                {
                    $pull: { ['GameChannels.Flags']: message.channel.id }
                }
            )

        }

    }
}
