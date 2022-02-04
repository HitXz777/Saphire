const { e } = require('../../../database/emojis.json'),
    { ServerDb, Giveaway } = require('../../../Routes/functions/database'),
    ms = require('ms'),
    Data = require('../../../Routes/functions/data'),
    Aliases = ['sorteio', 'gw']

module.exports = {
    name: 'giveaway',
    aliases: Aliases,
    category: 'moderation',
    UserPermissions: ['MANAGE_CHANNELS', 'MANAGE_MESSAGES'],
    ClientPermissions: ['ADD_REACTIONS'],
    emoji: `${e.Tada}`,
    usage: '<giveaway> <info>',
    description: 'Fazer sorteios é divertido, né?',

    run: async (client, message, args, prefix, db, MessageEmbed, request, sdb) => {

        const embed = new MessageEmbed().setColor(client.blue)

        if (['create', 'criar', 'new'].includes(args[0]?.toLowerCase())) return CreateNewGiveaway()
        if (['delete', 'deletar', 'del', 'apagar', 'excluir'].includes(args[0]?.toLowerCase())) return DeleteGiveaway()
        if (['reroll', 'resortear'].includes(args[0]?.toLowerCase())) return Reroll()
        if (['finalizar', 'finish'].includes(args[0]?.toLowerCase())) return FinishGiveaway()
        if (['list', 'all', 'todos', 'lista'].includes(args[0]?.toLowerCase())) return GiveawayList()
        if (['info', 'help', 'ajuda'].includes(args[0]?.toLowerCase())) return GiveawayInfo()
        if (['setchannel', 'config'].includes(args[0]?.toLowerCase())) return ConfigGiveawayChannel()
        if (['reset', 'resetar'].includes(args[0]?.toLowerCase())) return ResetGiveawayTime()
        return NaoSabeUsarOComando()

        async function CreateNewGiveaway() {

            let WinnersAmount = args[1],
                Time = args[2],
                Prize = args.slice(3).join(' '),
                ChannelId = ServerDb.get(`Servers.${message.guild.id}.GiveawayChannel`),
                Channel = message.guild.channels.cache.get(ChannelId),
                TimeMs

            if (!ChannelId)
                return message.reply(`${e.Deny} | Para criar um sorteio, o servidor deve ter um canal de sorteio configurado. Tem tudo no \`${prefix}giveaway info\`, dá uma olhadinha.`)

            if (ChannelId && !Channel) {
                ServerDb.delete(`Servers.${message.guild.id}.GiveawayChannel`)
                return message.reply(`${e.Deny} | Para criar um sorteio, o servidor deve ter um canal de sorteio configurado. Tem tudo no \`${prefix}giveaway info\`, dá uma olhadinha.`)
            }

            if (!Channel)
                return message.reply(`${e.Deny} | Para criar um sorteio, o servidor deve ter um canal de sorteio configurado. Tem tudo no \`${prefix}giveaway info\`, dá uma olhadinha.`)

            if (!WinnersAmount)
                return NaoSabeUsarOComando()

            if (isNaN(WinnersAmount))
                return message.reply(`${e.Deny} | O número de vencedores deve ser um número, não acha? Olha um exemplo:\n\`${prefix}giveaway create <QuantidadeDeVencedores> <TempoDoSorteio> <O Prêmio do Sorteio>\` | \`${prefix}giveaway create 3 10h Cargo Mod\``)

            if (parseInt(WinnersAmount) > 20 || parseInt(WinnersAmount) < 1)
                return message.reply(`${e.Deny} | O limite máximo de vencedores é entre 1 e 20.`)

            if (!['s', 'm', 'h', 'd'].includes(Time.slice(-1)))
                return message.reply(`${e.Deny} | Tempo inválido! Tenta colocar o tempo assim: \`50s | 10m | 1h | 2d\`\nOu seja: Segundos, Minutos, Horas e Dias`)

            if (!Prize)
                return message.reply(`${e.Info} | O mais legal é que você disse tudo do sorteio e só se esqueceu do prêmio 🤡`)

            if (Prize.length > 200)
                return message.reply(`${e.Deny} | O prêmio não pode passar de **200 caracteres**`)

            try {
                TimeMs = ms(Time)
            } catch (err) { return message.reply(`${e.Deny} | O tempo informado é inválido.`) }

            if (TimeMs > 2592000000)
                return message.reply(`${e.Deny} | O tempo limite é de 30 dias.`)

            const msg = await Channel.send({
                embeds: [
                    embed.setTitle(`${e.Loading} | Construindo sorteio...`)
                ]
            })

            embed
                .setTitle(`🎉 Sorteios ${message.guild.name}`)
                .setDescription(`Para entrar no sorteio, reaja em 🎉. Para sair, basta remover a sua reação.`)
                .addFields(
                    {
                        name: `Prêmio`,
                        value: `> ${Prize}`
                    },
                    {
                        name: 'Data de Término',
                        value: `> \`${Data(TimeMs)}\``,
                        inline: true
                    },
                    {
                        name: 'Patrocinado por:',
                        value: `> ${message.author}`,
                        inline: true
                    },
                    {
                        name: 'Vencedores',
                        value: `> ${parseInt(WinnersAmount)}`,
                        inline: true
                    }
                )
                .setFooter(`Giveaway ID: ${msg.id}`)

            if (!msg.id)
                return message.reply(`${e.Deny} | Fala ao obter o ID da mensagem do sorteio. Verifique se eu realmente tenho permissão para enviar mensagem no canal de sorteios.`)

            Giveaway.set(`Giveaways.${message.guild.id}.${msg.id}`, {
                Prize: Prize,
                Winners: WinnersAmount,
                TimeMs: TimeMs,
                DateNow: Date.now(),
                ChannelId: ChannelId,
                Participants: [],
                Actived: true,
                MessageLink: msg.url,
                Sponsor: message.author.id,
                TimeEnding: Data(TimeMs)
            })

            setTimeout(() => msg.edit({ embeds: [embed] }).catch((err) => {
                msg.delete().catch(() => { })

                Giveaway.delete(`Giveaways.${message.guild.id}.${msg.id}`)

                return message.channel.send(`${e.Warn} | Erro ao criar o sorteio.`)
            }), 1500)

            msg.react('🎉').catch(() => {
                msg.delete().catch(() => { })

                Giveaway.delete(`Giveaways.${message.guild.id}.${msg.id}`)

                return message.channel.send(`${e.Warn} | Erro ao reagir no sorteio.`)
            })

            return message.reply(`${e.Check} | Sorteio criado com sucesso!`)

        }

        async function DeleteGiveaway() {

            let GwId = args[1]

            if (['all', 'todos', 'tudo'].includes(args[1]?.toLowerCase())) return DeleteAllData()

            if (!GwId)
                return message.reply(`${e.Info} | Forneça o ID do sorteio. Você pode ver todos os ids em \`${prefix}giveaway list\` ou copiando o ID da mensagem do sorteio. Você também pode usar o comando \`${prefix}giveaway para deletar todos os sorteios de uma vez.\``)

            if (!Giveaway.get(`Giveaways.${message.guild.id}.${GwId}`))
                return message.reply(`${e.Deny} | Sorteio não encontrado para exclusão.`)

            let Emojis = ['✅', '❌'],
                msg = await message.reply(`${e.QuestionMark} | Deseja deletar o sorteio \`${GwId}\`?`)

            for (const emoji of Emojis)
                msg.react(emoji).catch(() => { })

            const collector = msg.createReactionCollector({
                filter: (reaction, user) => Emojis.includes(reaction.emoji.name) && user.id === message.author.id,
                time: 30000
            })

                .on('collect', (reaction) => {

                    if (reaction.emoji.name === Emojis[1]) // X
                        return collector.stop()

                    Giveaway.delete(`Giveaways.${message.guild.id}.${GwId}`)
                    return msg.edit(`${e.Check} | Sorteio deletado com sucesso!`).catch(() => { })

                })

                .on('end', () => msg.edit(`${e.Deny} | Comando cancelado.`))

            async function DeleteAllData() {

                if (!Giveaway.get(`Giveaways.${message.guild.id}`))
                    return message.reply(`${e.Deny} | Este servidor não tem nenhum sorteio.`)

                let Emojis = ['✅', '❌'],
                    msg = await message.reply(`${e.QuestionMark} | Deseja deletar todos os sorteios deste servidor?`)

                for (const emoji of Emojis)
                    msg.react(emoji).catch(() => { })

                const collector = msg.createReactionCollector({
                    filter: (reaction, user) => Emojis.includes(reaction.emoji.name) && user.id === message.author.id,
                    time: 30000
                })

                    .on('collect', (reaction) => {

                        if (reaction.emoji.name === Emojis[1]) // X
                            return collector.stop()

                        Giveaway.delete(`Giveaways.${message.guild.id}`)
                        return msg.edit(`${e.Check} | Todos os sorteios foram deletados.`)

                    })

                    .on('end', () => msg.edit(`${e.Deny} | Comando cancelado.`))

            }

        }

        function Reroll() {

            let GwId = args[1],
                Amount = args[2] || 1

            if (!GwId)
                return message.reply(`${e.Info} | Forneça o ID do sorteio para reroll. Você pode ver em \`${prefix}giveaway list\` ou copiando o ID da mensagem do sorteio.`)

            if (!Giveaway.get(`Giveaways.${message.guild.id}.${GwId}`))
                return message.reply(`${e.Deny} | Sorteio não encontrado para exclusão.`)

            if (Giveaway.get(`Giveaways.${message.guild.id}.${GwId}.Actived`))
                return message.reply(`${e.Deny} | Este sorteio ainda está ativado e não é possível o Reroll antes do término. Caso você queira finalizar este sorteio antes da hora, use o comando \`${prefix}giveaway finish ${GwId}\``)

            if (isNaN(Amount))
                return message.reply(`${e.Deny} | A quantidade de vencedores para reroll deve ser um número de 1~20`)

            return NewReroll(GwId, Amount)

        }

        function FinishGiveaway() {

            let GwId = args[1]

            if (!GwId)
                return message.reply(`${e.Info} | Forneça o ID do sorteio para finaliza-lo. Você pode ver em \`${prefix}giveaway list\` ou copiando o ID da mensagem do sorteio.`)

            if (!Giveaway.get(`Giveaways.${message.guild.id}.${GwId}`))
                return message.reply(`${e.Deny} | Sorteio não encontrado.`)

            if (!Giveaway.get(`Giveaways.${message.guild.id}.${GwId}.Actived`))
                return message.reply(`${e.Deny} | Este sorteio já foi está finalizado.`)

            Giveaway.set(`Giveaways.${message.guild.id}.${GwId}.DateNow`, 0)
            return message.reply(`${e.Check} | Sorteio finalizado com sucesso!`)

        }

        async function GiveawayList() {

            let Sorteios = Object.keys(Giveaway.get(`Giveaways.${message.guild.id}`) || {})

            if (Sorteios.length === 0)
                return message.reply(`${e.Deny} | Este servidor não tem nenhum sorteio na lista.`)

            let Embeds = EmbedGenerator(),
                Control = 0,
                Emojis = ['◀️', '▶️', '❌'],
                msg = await message.reply({ embeds: [Embeds[0]] })

            if (Embeds.length < 2) return

            for (const emoji of Emojis)
                msg.react(emoji).catch(() => { })

            const collector = msg.createReactionCollector({
                filter: (reaction, user) => Emojis.includes(reaction.emoji.name) && user.id === message.author.id,
                idle: 30000
            })

                .on('collect', (reaction) => {

                    if (reaction.emoji.name === Emojis[2]) // X
                        return collector.stop()

                    return reaction.emoji.name === Emojis[0] // Left
                        ? (() => {

                            Control--
                            return Embeds[Control] ? msg.edit({ embeds: [Embeds[Control]] }).catch(() => { }) : Control++

                        })()
                        : (() => { // Right

                            Control++
                            return Embeds[Control] ? msg.edit({ embeds: [Embeds[Control]] }).catch(() => { }) : Control--

                        })()

                })

                .on('end', () => msg.edit({ content: `${e.Deny} | Comando cancelado.` }).catch(() => { }))

            function EmbedGenerator() {

                let amount = 5,
                    Page = 1,
                    embeds = [],
                    Sorteio = Giveaway.get(`Giveaways.${message.guild.id}`),
                    length = Sorteios.length / 5 <= 1 ? 1 : parseInt((Sorteios.length / 5) + 1)

                for (let i = 0; i < Sorteios.length; i += 5) {

                    let current = Sorteios.slice(i, amount),
                        description = current.map(Gw => `> 🆔 \`${Gw}\`\n> ⏱️ Término: \`${Sorteio[Gw]?.TimeEnding}\`\n> ${Sorteio[Gw]?.Actived ? `${e.Check} Ativado` : `${e.Deny} Desativado`}\n> ${e.Info} \`${prefix}giveaway info ${Gw}\`\n--------------------`).join("\n")

                    if (current.length > 0) {

                        embeds.push({
                            color: 'GREEN',
                            title: `${e.Tada} Sorteios ${message.guild.name} ${length > 1 ? `- ${Page}/${length}` : ''}`,
                            description: `${description || 'Nenhum sorteio encontrado'}`,
                            footer: {
                                text: `${Sorteios.length} sorteios contabilizados`
                            },
                        })

                        Page++
                        amount += 5

                    }

                }

                return embeds;
            }

        }

        async function GiveawayInfo() {

            let MessageId = args[1]

            MessageId ? (async () => {

                let GiveawayDatabase = Giveaway.get(`Giveaways.${message.guild.id}`),
                    sorteio = Giveaway.get(`Giveaways.${message.guild.id}.${MessageId}`)

                if (!GiveawayDatabase)
                    return message.reply(`${e.Info} | Este servidor não tem nenhum sorteio na lista.`)

                if (!sorteio) return message.reply(`${e.Deny} | Id inválido ou sorteio inexistente.`)

                let WinnersAmount = sorteio?.Winners,
                    Participantes = sorteio?.Participants,
                    Sponsor = sorteio?.Sponsor,
                    Prize = sorteio?.Prize,
                    MessageLink = sorteio?.MessageLink,
                    Actived = sorteio?.Actived,
                    Vencedores = sorteio?.WinnersGiveaway || [],
                    VencedoresMapped = Vencedores?.map(winner => {

                        let member = message.guild.members.cache.get(winner)

                        return member
                            ? `> ${member.user.tag.replace(/`/g, '')} - \`${member.id}\``
                            : '> Membro não encontrado'

                    }).join('\n') || '> Ninguém',
                    description = `> :id: \`${MessageId}\`\n> 👐 Patrocinador*(a)*: ${message.guild.members.cache.get(Sponsor)?.user.tag || 'Não encontrado'}\n> ${e.Star} Prêmio: ${Prize}\n> 👥 Participantes: ${Participantes?.length || 0}\n> ${e.CoroaDourada} Vencedores: ${WinnersAmount}\n> ⏱️ Término: \`${sorteio?.TimeEnding || 'Indefinido'}\`\n> ${Actived ? `${e.Check} Ativado` : `${e.Deny} Desativado`}\n> 🔗 [Sorteio Link](${MessageLink})`,
                    Emojis = ['⬅️', '➡️', '❌'],
                    Control = 0,
                    Embeds = EmbedGenerator(),
                    msg = await message.reply({ embeds: [Embeds[0]] })

                if (Embeds.length === 1)
                    return

                for (const emoji of Emojis)
                    msg.react(emoji).catch(() => { })

                const collector = msg.createReactionCollector({
                    filter: (reaction, user) => Emojis.includes(reaction.emoji.name) && user.id === message.author.id,
                    idle: 30000
                })

                    .on('collect', (reaction) => {

                        if (reaction.emoji.name === Emojis[2])
                            return collector.stop()

                        return reaction.emoji.name === Emojis[0]
                            ? (() => {

                                Control--
                                return Embeds[Control] ? msg.edit({ embeds: [Embeds[Control]] }).catch(() => { }) : Control++

                            })()
                            : (() => {

                                Control++
                                return Embeds[Control] ? msg.edit({ embeds: [Embeds[Control]] }).catch(() => { }) : Control--

                            })()

                    })

                    .on('end', () => {

                        msg.edit({ content: `${e.Deny} | Comando desativado` }).catch(() => { })

                    })

                function EmbedGenerator() {

                    let amount = 10,
                        Page = 1,
                        embeds = [],
                        length = Participantes.length / 10 <= 1 ? 1 : parseInt((Participantes.length / 10) + 1)

                    for (let i = 0; i < Participantes.length; i += 10) {

                        let current = Participantes.slice(i, amount),
                            GiveawayMembersMapped = current.map(Participante => {

                                let Member = message.guild.members.cache.get(Participante)

                                return Member ? `> ${Member.user.tag.replace(/`/g, '')} - \`${Member.id}\`` : (() => {
                                    Giveaway.pull(`Giveaways.${message.guild.id}.${MessageId}.Participants`, Participante)
                                    return `> ${e.Deny} Usuário deletado`
                                })()

                            }).join("\n")

                        if (current.length > 0) {

                            embeds.push({
                                color: client.blue,
                                title: `${e.Tada} Informações do sorteio`,
                                description: `${description}`,
                                fields: [
                                    {
                                        name: `👥 Participantes ${length > 0 ? `- ${Page}/${length}` : ''}`,
                                        value: `${GiveawayMembersMapped || '> Nenhum membro entrou neste sorteio'}`
                                    },
                                    {
                                        name: `${e.OwnerCrow} Vencedores do Sorteios${Vencedores.length > 0 ? `: ${Vencedores.length}/${WinnersAmount}` : ''}`,
                                        value: `${VencedoresMapped}`
                                    }
                                ],
                                footer: {
                                    text: `${Participantes.length} participantes contabilizados`
                                },
                            })

                            Page++
                            amount += 10

                        }

                    }

                    return embeds;
                }

            })()

                : (() => {

                    return message.reply({
                        embeds: [
                            embed
                                .setTitle(`${e.Tada} ${client.user.username} Giveaway Manager | Info Class`)
                                .setDescription(`Com este comando é possível fazer sorteios. E isso é bem legal.`)
                                .addFields(
                                    {
                                        name: `:link: Atalhos`,
                                        value: `\`${prefix}giveaway\`, ${Aliases.map(cmd => `\`${prefix}${cmd}\``).join(', ')}`
                                    },
                                    {
                                        name: `${e.Star} Crie sorteios`,
                                        value: `\`${prefix}giveaway new <QuantidadeDeVencedores> <TempoDoSorteio> <O Prêmio do Sorteio>\`\n${e.Info} Exemplo: \`${prefix}giveaway create 3 10h Cargo Mod\``
                                    },
                                    {
                                        name: `${e.Deny} Delete sorteios`,
                                        value: `\`${prefix}giveaway delete <IdDoSorteio>\` ou \`${prefix}giveaway delete all\``
                                    },
                                    {
                                        name: `${e.Gear} Configure o canal ou delete tudo`,
                                        value: `\`${prefix}giveaway config [#channel]\` ou \`${prefix}giveaway config <delete>\``
                                    },
                                    {
                                        name: `🔄 Reroll`,
                                        value: `\`${prefix}giveaway reroll <IdDoSorteio> [QuantidadeDeVencedores]\``
                                    },
                                    {
                                        name: `🌀 Reset o tempo do sorteio`,
                                        value: `\`${prefix}giveaway reset <IdDoSorteio>\``
                                    },
                                    {
                                        name: `⏱️ Finalize um sorteio antes da hora`,
                                        value: `\`${prefix}giveaway finish <IdDoSorteio>\``
                                    },
                                    {
                                        name: `${e.Commands} Veja todos os sorteios e suas informações`,
                                        value: `\`${prefix}giveaway list\` ou \`${prefix}giveaway info <IdDoSorteio>\``
                                    }
                                )
                                .setFooter(`Este comando faz parte da: ${client.user.username} Hiper Commmands`)
                        ]
                    })
                })()
        }

        async function ResetGiveawayTime() {

            let MessageId = args[1]

            if (!MessageId)
                return message.reply(`${e.Info} | Forneça o ID do sorteio para resetar o tempo. Você pode ver usando \`${prefix}giveaway list\``)

            if (!Giveaway.get(`Giveaways.${message.guild.id}.${MessageId}`))
                return message.reply(`${e.Deny} | Sorteio não encontrado.`)

            let Emojis = ['✅', '❌'],
                msg = await message.reply(`${e.QuestionMark} | Deseja resetar o tempo do sorteio \`${MessageId}\`?`)

            for (const emoji of Emojis)
                msg.react(emoji).catch(() => { })

            const collector = msg.createReactionCollector({
                filter: (reaction, user) => Emojis.includes(reaction.emoji.name) && user.id === message.author.id,
                time: 30000
            })

                .on('collect', (reaction) => {

                    if (reaction.emoji.name === Emojis[1]) // X
                        return collector.stop()

                    const Time = Giveaway.get(`Giveaways.${message.guild.id}.${MessageId}.TimeMs`)

                    Giveaway.set(`Giveaways.${message.guild.id}.${MessageId}.DateNow`, Date.now())
                    Giveaway.set(`Giveaways.${message.guild.id}.${MessageId}.TimeEnding`, Data(Time))
                    Giveaway.set(`Giveaways.${message.guild.id}.${MessageId}.Actived`, true)
                    return msg.edit(`${e.Check} | Sorteio resetado com sucesso. *Não é necessário os membros entrar novamente*`).catch(() => { })

                })

                .on('end', () => msg.edit(`${e.Deny} | Comando cancelado.`))

        }

        function NaoSabeUsarOComando() {
            return message.reply(`${e.Info} | Não sabe usar o comando de sorteio? Tenta usar o comando \`${prefix}giveaway info\``)
        }

        function ConfigGiveawayChannel() {

            let Channel = message.mentions.channels.first() || message.channel

            if (['off', 'desligar', 'excluir', 'apagar', 'delete', 'del'].includes(args[1]?.toLowerCase())) return DeleteGiveawaysConfig()

            ServerDb.set(`Servers.${message.guild.id}.GiveawayChannel`, Channel.id)
            return message.reply(`${e.Check} | O canal ${Channel} foi configurado com sucesso como Canal de Sorteios!`)

            async function DeleteGiveawaysConfig() {

                const msg = await message.reply(`${e.QuestionMark} | Deseja deletar todos os sorteios e as configurações de canais?`)

                for (const emoji of ['✅', '❌'])
                    msg.react(emoji).catch(() => { })

                const collector = msg.createReactionCollector({
                    filter: (reaction, user) => ['✅', '❌'].includes(reaction.emoji.name) && user.id === message.author.id,
                    time: 30000
                })

                    .on('collect', (reaction) => {

                        return reaction.emoji.name === '✅'
                            ? (() => {
                                ServerDb.delete(`Servers.${message.guild.id}.GiveawayChannel`)
                                Giveaway.delete(`Giveaways.${message.guild.id}`)
                                return message.reply(`${e.Check} | Todos os sorteios e configurações foram deletados.`)
                            })()
                            : collector.stop()

                    })

                    .on('end', () => msg.edit(`${e.Deny} | Comando cancelado.`))



                return
            }

        }

        function NewReroll(MessageId, Vencedores) {

            let embed = new MessageEmbed(),
                sorteio = Giveaway.get(`Giveaways.${message.guild.id}.${MessageId}`),
                WinnersAmount = parseInt(Vencedores),
                Participantes = sorteio?.Participants,
                Channel = message.guild.channels.cache.get(sorteio?.ChannelId),
                Sponsor = sorteio?.Sponsor,
                Prize = sorteio?.Prize,
                MessageLink = sorteio?.MessageLink

            if (!sorteio) {
                Giveaway.delete(`Giveaways.${message.guild.id}.${MessageId}`)
                return message.reply(`${e.Deny} | Sorteio não encontrado para reroll.`)
            }

            if (!Channel)
                return message.reply(`${e.Deny} | Canal não encontrado.`)

            if (Participantes.length === 0) {

                Channel.send(`${e.Deny} | Reroll cancelado por falta de participantes.\n🔗 | Sorteio link: ${sorteio?.MessageLink}`)
                return Giveaway.delete(`Giveaways.${message.guild.id}.${MessageId}`)

            }

            let vencedores = GetWinners(Participantes, WinnersAmount)

            if (vencedores.length === 0) {

                Channel.send(`${e.Deny} | Reroll cancelado por falta de participantes.\n🔗 | Giveaway Reference: ${MessageLink || 'Link indisponível'}`)
                return Giveaway.delete(`Giveaways.${message.guild.id}.${MessageId}`)

            }

            let vencedoresMapped = vencedores.map(memberId => `${GetMember(memberId)}`).join('\n')

            Channel.send({
                embeds: [
                    embed
                        .setColor('GREEN')
                        .setTitle(`${e.Tada} Sorteio Finalizado [Reroll]`)
                        .setURL(`${MessageLink}`)
                        .addFields(
                            {
                                name: `${e.CoroaDourada} Vencedores`,
                                value: `${vencedoresMapped || 'Ninguém'}`,
                                inline: true
                            },
                            {
                                name: `${e.ModShield} Patrocinador`,
                                value: `${message.guild.members.cache.get(Sponsor) || `${e.Deny} Patrocinador não encontrado`}`,
                                inline: true
                            },
                            {
                                name: `${e.Star} Prêmio`,
                                value: `${Prize}`,
                                inline: true
                            },
                            {
                                name: `🔗 Giveaway Reference`,
                                value: `[Link do Sorteio](${MessageLink})`
                            }
                        )
                ]

            }).catch(() => Giveaway.delete(`Giveaways.${message.guild.id}.${MessageId}`))

            if (Giveaway.get(`Giveaways.${message.guild.id}.${MessageId}`))
                Giveaway.set(`Giveaways.${message.guild.id}.${MessageId}.TimeToDelete`, Date.now())

            function GetWinners(WinnersArray, Amount) {

                let Winners = []

                if (WinnersArray.length === 0)
                    return []

                WinnersArray.length >= Amount
                    ? (() => {

                        for (let i = 0; i < Amount; i++)
                            Winners.push(GetUserWinner())

                    })()
                    : (() => {

                        Winners.push(...WinnersArray)

                    })()

                function GetUserWinner() {

                    const Winner = WinnersArray[Math.floor(Math.random() * WinnersArray.length)]
                    return Winners.includes(Winner) ? GetUserWinner() : Winner

                }

                return Winners
            }

            function GetMember(memberId) {
                const member = message.guild.members.cache.get(memberId)

                return member
                    ? `${member} *\`${member?.id || 'Id desconhecido'}\`*`
                    : (() => {
                        Giveaway.pull(`Giveaways.${message.guild.id}.${MessageId}.Participants`, memberId)
                        return `${e.Deny} Usuário não encontrado.`
                    })()
            }
        }

    }
}