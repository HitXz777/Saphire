const { e } = require('../../../JSON/emojis.json')

module.exports = {
    name: 'bandeiras',
    aliases: ['flag', 'flags', 'bandeira', 'band', 'bands'],
    category: 'games',
    emoji: '🇧🇷',
    usage: '<bandeiras> <start>',
    description: 'Adivinhe o país das bandeiras',

    run: async (client, message, args, prefix, MessageEmbed, Database) => {

        let flags = Database.Flags.get('Flags') || [],
            control = {
                atualFlag: {},
                usersPoints: [],
                rounds: 0,
                collected: false
            }, embed = new MessageEmbed()

        if (['add', 'adicionar', '+'].includes(args[0]?.toLowerCase())) return addFlag()
        if (['remove', 'del', '-'].includes(args[0]?.toLowerCase())) return removeFlag()
        if (['list', 'lista', 'all', 'full'].includes(args[0]?.toLowerCase())) return listFlags()
        if (['start', 'começar', 's', 'init'].includes(args[0]?.toLowerCase())) return startFlagGame()
        return message.reply(`${e.Info} | Não sabe jogar o *Flag Game*? Use \`${prefix}flag info\`.`)

        async function addFlag() {

            let data = await Database.Client.findOne({ id: client.user.id }, 'Moderadores Administradores')

            if (!data?.Administradores?.includes(message.author.id) && !data?.Moderadores?.includes(message.author.id))
                return message.reply(`${e.Admin} | Apenas moderadores e administradores da Saphire's Team podem adicionar novas bandeiras no Flag Game.`)

            let flag = args[1],
                countryName = args.slice(2).join(' ')?.toLowerCase()

            if (!flag)
                return message.reply(`${e.Info} | \`${prefix}flag add <emojiBandeira> <Nome do país>\``)

            if (!countryName)
                return message.reply(`${e.Deny} | Formato inválido! \`${prefix}flag add <emojiBandeira> <Nome do país>\``)

            let has = flags?.find(data => data.flag == flag || data.country == countryName)

            if (has)
                return message.reply(`${e.Deny} | Esse país já existe no banco de dados.`)

            let msg = await message.reply(`${e.QuestionMark} | Você confirma adicionar esse país no banco de dados do Flag Game? "**${flag} - ${countryName}**"`),
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
                    Database.Flags.push('Flags', { flag: flag, country: countryName })
                    return msg.edit(`${e.Check} | A bandeira "**${flag} - ${countryName}**" foi adicionada com sucesso!`).catch(() => { })
                })
                .on('end', () => {
                    if (clicked) return
                    return msg.edit({ content: `${e.Deny} | Comando cancelado.` }).catch(() => { })
                })
        }

        async function removeFlag() {

            let data = await Database.Client.findOne({ id: client.user.id }, 'Moderadores Administradores')

            if (!data?.Administradores?.includes(message.author.id) && !data?.Moderadores?.includes(message.author.id))
                return message.reply(`${e.Admin} | Apenas moderadores e administradores da Saphire's Team podem remover bandeiras no Flag Game.`)

            let args1 = args[1],
                args2 = args.slice(2).join(' ')?.toLowerCase()

            if (!args1)
                return message.reply(`${e.Info} | \`${prefix}flag del <emojiBandeira> ou <Nome do país>\``)

            if (args2)
                return message.reply(`${e.Info} | \`${prefix}flag del <emojiBandeira> ou <Nome do país>\` *(apenas um dos dois)*`)

            let has = flags?.find(data => data.flag == args1 || data.country == args1 || data.country == args2)

            if (!has)
                return message.reply(`${e.Deny} | Esse país não existe no meu banco de dados.`)

            let msg = await message.reply(`${e.QuestionMark} | Você confirma remover o país "**${has.flag} - ${has.country}**" do banco de dados do Flag Game?`),
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
                    let flagIndex = flags.findIndex(data => data.flag == args1 || data.country == args2)

                    flags.splice(flagIndex, 1)
                    Database.Flags.set('Flags', flags)
                    return msg.edit(`${e.Check} | A bandeira "**${has.flag} - ${has.country}**" foi removida com sucesso!`).catch(() => { })
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
                .setDescription(`${e.Loading} | Carregando bandeiras... Prepare-se!`)

            randomizeFlags()
            let Msg = await message.channel.send({ embeds: [embed] })

            setTimeout(() => start(Msg), 4000)
            return
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

            let data = control.usersPoints.find(data => data.name === Member.displayName,)

            data?.name
                ? data.points++
                : control.usersPoints.push({ name: Member.displayName, points: 1 })

            let ranking = control.usersPoints
                .slice(0, 5)
                .sort((a, b) => b.points - a.points)
                .map((d, i) => `${emoji(i)} ${d.name} - ${d.points} pontos`)
                .join('\n')

            if (embed.fields.length === 1)
                embed.spliceFields(0, 1, [{ name: '🏆 Pontuação', value: `${ranking || `${e.Deny} RANKING BAD FORMATED`}` }])
            else embed.addField('🏆 Pontuação', `${ranking || `${e.Deny} RANKING BAD FORMATED`}`)

            // TODO: Adicionar o Flag Gaming no ranking
            // Database.addGamingPoint(Member.user.id, 'Flag', 1)

            return
        }

        function emoji(i) {
            return {
                0: '🥇',
                1: '🥈',
                2: '🥉'
            }[i] || '🏅'
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
