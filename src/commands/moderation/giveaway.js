const { e } = require('../../../JSON/emojis.json'),
    ms = require('ms'),
    Data = require('../../../modules/functions/plugins/data'),
    Aliases = ['sorteio', 'gw']

module.exports = {
    name: 'giveaway',
    aliases: ['sorteio', 'gw'],
    category: 'moderation',
    UserPermissions: ['MANAGE_CHANNELS', 'MANAGE_MESSAGES'],
    ClientPermissions: ['ADD_REACTIONS'],
    emoji: `${e.Tada}`,
    usage: '<giveaway> <info>',
    description: 'Fazer sorteios é divertido, né?',

    run: async (client, message, args, prefix, MessageEmbed, Database) => {

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

            let guild = await Database.Guild.findOne({ id: message.guild.id }, 'GiveawayChannel'),
                WinnersAmount = args[1],
                Time = args[2],
                Prize = args.slice(3).join(' '),
                ChannelId = guild?.GiveawayChannel,
                Channel = message.guild.channels.cache.get(ChannelId),
                TimeMs

            if (!ChannelId)
                return message.reply(`${e.Deny} | Para criar um sorteio, o servidor deve ter um canal de sorteio configurado. Tem tudo no \`${prefix}giveaway info\`, dá uma olhadinha.`)

            if (ChannelId && !Channel) {

                await Database.Guild.updateOne(
                    { id: message.guild.id },
                    { $unset: { GiveawayChannel: 1 } }
                )

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

            const msg = await Channel.send({ embeds: [embed.setTitle(`${e.Loading} | Construindo sorteio...`)] })

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
                .setFooter({ text: `Giveaway ID: ${msg?.id}` })

            if (!msg?.id)
                return message.reply(`${e.Deny} | Falha ao obter o ID da mensagem do sorteio. Verifique se eu realmente tenho permissão para enviar mensagem no canal de sorteios.`)

            new Database.Giveaway({ // new Class Model
                MessageID: msg.id, // Id da Mensagem
                GuildId: message.guild.id, // Id do Servidor
                Prize: Prize, // Prêmio do sorteio
                Winners: WinnersAmount, // Quantos vencedores
                TimeMs: TimeMs, // Tempo do Sorteio
                DateNow: Date.now(), // Agora
                ChannelId: ChannelId, // Id do Canal
                Participants: [], // Array pra dar push em quem entra no sorteio
                Actived: true, // Ativado
                MessageLink: msg.url, // Link da mensagem
                Sponsor: message.author.id, // Quem fez o sorteio
                TimeEnding: Data(TimeMs) // Hora que termina o sorteio
            }).save()

            msg.edit({ embeds: [embed] }).catch(async (err) => {
                msg.delete().catch(() => { })

                Database.deleteGiveaway(msg.id)
                return message.channel.send(`${e.Warn} | Erro ao criar o sorteio.`)
            })

            msg.react('🎉').catch(async () => {
                msg.delete().catch(() => { })

                Database.deleteGiveaway(msg.id)
                return message.channel.send(`${e.Warn} | Erro ao reagir no sorteio.`)
            })

            return message.reply(`${e.Check} | Sorteio criado com sucesso!`)

        }

        async function DeleteGiveaway() {

            let GwId = args[1]

            if (['all', 'todos', 'tudo'].includes(args[1]?.toLowerCase())) return DeleteAllData()

            if (!GwId)
                return message.reply(`${e.Info} | Forneça o ID do sorteio. Você pode ver todos os ids em \`${prefix}giveaway list\` ou copiando o ID da mensagem do sorteio. Você também pode usar o comando \`${prefix}giveaway para deletar todos os sorteios de uma vez.\``)

            let sorteio = await Database.Giveaway.findOne({ MessageID: GwId })

            if (!sorteio)
                return message.reply(`${e.Deny} | Sorteio não encontrado para exclusão.`)

            let Emojis = ['✅', '❌'],
                msg = await message.reply(`${e.QuestionMark} | Deseja deletar o sorteio \`${GwId}\`?`),
                react = false

            for (const emoji of Emojis) msg.react(emoji).catch(() => { })

            const collector = msg.createReactionCollector({
                filter: (reaction, user) => Emojis.includes(reaction.emoji.name) && user.id === message.author.id,
                time: 30000
            })

                .on('collect', async (reaction) => {

                    if (reaction.emoji.name === Emojis[1]) // X
                        return collector.stop()

                    Database.deleteGiveaway(GwId)
                    react = true
                    return msg.edit(`${e.Check} | Sorteio deletado com sucesso!`).catch(() => { })

                })

                .on('end', () => {
                    if (react) return
                    return msg.edit({ content: `${e.Deny} | Comando cancelado.` }).catch(() => { })
                })

            async function DeleteAllData() {

                let gwData = await Database.Giveaway.find({ GuildId: message.guild.id })

                if (!gwData || gwData.length === 0)
                    return message.reply(`${e.Deny} | Este servidor não tem nenhum sorteio.`)

                let Emojis = ['✅', '❌'],
                    msg = await message.reply(`${e.QuestionMark} | Deseja deletar todos os sorteios deste servidor?`),
                    react = false

                for (const emoji of Emojis)
                    msg.react(emoji).catch(() => { })

                const collector = msg.createReactionCollector({
                    filter: (reaction, user) => Emojis.includes(reaction.emoji.name) && user.id === message.author.id,
                    time: 30000
                })

                    .on('collect', async (reaction) => {

                        if (reaction.emoji.name === Emojis[1]) // X
                            return collector.stop()
                        react = true
                        Database.deleteGiveaway(message.guild.id, true)
                        return msg.edit(`${e.Check} | Todos os sorteios foram deletados.`)

                    })

                    .on('end', () => {
                        if (react) return
                        return msg.edit(`${e.Deny} | Comando cancelado.`)
                    })

            }

        }

        async function Reroll() {

            let GwId = args[1],
                Amount = args[2] || 1

            if (!GwId)
                return message.reply(`${e.Info} | Forneça o ID do sorteio para reroll. Você pode ver em \`${prefix}giveaway list\` ou copiando o ID da mensagem do sorteio.`)

            let sorteio = await Database.Giveaway.findOne({ MessageID: GwId })

            if (!sorteio)
                return message.reply(`${e.Deny} | Sorteio não encontrado para reroll. \`${prefix}gw reroll GiveawayID QuatidadeDeVencedores\``)

            if (sorteio?.Actived)
                return message.reply(`${e.Deny} | Este sorteio ainda está ativado e não é possível o Reroll antes do término. Caso você queira finalizar este sorteio antes da hora, use o comando \`${prefix}giveaway finish ${GwId}\``)

            if (isNaN(Amount))
                return message.reply(`${e.Deny} | A quantidade de vencedores para reroll deve ser um número de 1~20`)

            return NewReroll(sorteio, GwId, Amount)

        }

        async function FinishGiveaway() {

            let GwId = args[1]

            if (!GwId)
                return message.reply(`${e.Info} | Forneça o ID do sorteio para finaliza-lo. Você pode ver em \`${prefix}giveaway list\` ou copiando o ID da mensagem do sorteio.`)

            let sorteio = await Database.Giveaway.findOne({ MessageID: GwId }, 'Actived')

            if (!sorteio)
                return message.reply(`${e.Deny} | Sorteio não encontrado.`)

            if (!sorteio?.Actived)
                return message.reply(`${e.Deny} | Este sorteio já foi está finalizado.`)

            await Database.Giveaway.updateOne(
                { MessageID: GwId },
                { DateNow: 0 }
            )

            return message.reply(`${e.Check} | Sorteio finalizado com sucesso!`)

        }

        async function GiveawayList() {

            let Sorteios = await Database.Giveaway.find({ GuildId: message.guild.id })

            if (!Sorteios || Sorteios.length === 0)
                return message.reply(`${e.Deny} | Este servidor não tem nenhum sorteio na lista.`)

            let Embeds = EmbedGenerator(),
                Control = 0,
                Emojis = ['◀️', '▶️', '❌'],
                msg = await message.reply({ embeds: [Embeds[0]] }),
                react = false

            if (Embeds.length > 1)
                for (const emoji of Emojis)
                    msg.react(emoji).catch(() => { })

            const collector = msg.createReactionCollector({
                filter: (reaction, user) => Emojis.includes(reaction.emoji.name) && user.id === message.author.id,
                idle: 30000
            })

                .on('collect', (reaction) => {

                    if (reaction.emoji.name === Emojis[2]) // X
                        return collector.stop()
                    react = true
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

                .on('end', () => {
                    if (react) return
                    return msg.edit({ content: `${e.Deny} | Comando cancelado.` }).catch(() => { })
                })

            function EmbedGenerator() {

                let amount = 5,
                    Page = 1,
                    embeds = [],
                    length = Sorteios.length / 5 <= 1 ? 1 : parseInt((Sorteios.length / 5) + 1)

                for (let i = 0; i < Sorteios.length; i += 5) {

                    let current = Sorteios.slice(i, amount),
                        description = current.map(Gw => `> 🆔 \`${Gw.MessageID}\`\n> ⏱️ Término: \`${Gw.TimeEnding}\`\n> ${Gw?.Actived ? `${e.Check} Ativado` : `${e.Deny} Desativado`}\n> ${e.Info} \`${prefix}giveaway info ${Gw.MessageID}\`\n--------------------`).join("\n") || false

                    if (current.length > 0) {

                        embeds.push({
                            color: client.blue,
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

            return

        }

        async function GiveawayInfo() {

            let MessageId = args[1]

            MessageId ? (async () => {

                let sorteio = await Database.Giveaway.findOne({ MessageID: MessageId })
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
                    msg = await message.reply({ embeds: [Embeds[0]] }),
                    react = false

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

                        react = true
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
                        if (react) return
                        return msg.edit({ content: `${e.Deny} | Comando desativado` }).catch(() => { })

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

                                return Member ? `> ${Member.user.tag.replace(/`/g, '')} - \`${Member.id}\`` : (async () => {

                                    await Database.Giveaway.updateOne(
                                        { MessageID: MessageId },
                                        { $pull: { Participants: Participante } }
                                    )

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
                                .setFooter({ text: `Este comando faz parte da: ${client.user.username} Hiper Commmands` })
                        ]
                    })
                })()
        }

        async function ResetGiveawayTime() {

            let MessageId = args[1]

            if (!MessageId)
                return message.reply(`${e.Info} | Forneça o ID do sorteio para resetar o tempo. Você pode ver usando \`${prefix}giveaway list\``)

            let sorteio = await Database.Giveaway.findOne({ MessageID: MessageId })

            if (!sorteio)
                return message.reply(`${e.Deny} | Sorteio não encontrado.`)

            let Emojis = ['✅', '❌'],
                msg = await message.reply(`${e.QuestionMark} | Deseja resetar o tempo do sorteio \`${MessageId}\`?`),
                react = false

            for (const emoji of Emojis)
                msg.react(emoji).catch(() => { })

            const collector = msg.createReactionCollector({
                filter: (reaction, user) => Emojis.includes(reaction.emoji.name) && user.id === message.author.id,
                time: 30000
            })

                .on('collect', async (reaction) => {

                    if (reaction.emoji.name === Emojis[1]) // X
                        return collector.stop()

                    const Time = sorteio.TimeMs

                    await Database.Giveaway.updateOne(
                        { MessageID: MessageId },
                        {
                            DateNow: Date.now(),
                            TimeEnding: Data(Time),
                            Actived: true
                        }
                    )
                    react = true
                    return msg.edit(`${e.Check} | Sorteio resetado com sucesso. *Não é necessário os membros entrar novamente*`).catch(() => { })

                })

                .on('end', () => {
                    if (react) return
                    return msg.edit(`${e.Deny} | Comando cancelado.`)
                })

        }

        function NaoSabeUsarOComando() {
            return message.reply(`${e.Info} | Não sabe usar o comando de sorteio? Tenta usar o comando \`${prefix}giveaway info\``)
        }

        async function ConfigGiveawayChannel() {

            let Channel = message.mentions.channels.first() || message.channel,
                react = false

            if (['off', 'desligar', 'excluir', 'apagar', 'delete', 'del'].includes(args[1]?.toLowerCase())) return DeleteGiveawaysConfig()

            await Database.Guild.updateOne(
                { id: message.guild.id },
                { GiveawayChannel: Channel.id },
                { upsert: true }
            )

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
                            ? (async () => {

                                await Database.Giveaway.deleteMany(
                                    { GuildId: message.guild.id },
                                )

                                await Database.Guild.updateOne(
                                    { id: message.guild.id },
                                    { $unset: { GiveawayChannel: 1 } }
                                )

                                react = true
                                return message.reply(`${e.Check} | Todos os sorteios e configurações foram deletados.`)
                            })()
                            : collector.stop()

                    })

                    .on('end', () => {
                        if (react) return
                        msg.edit(`${e.Deny} | Comando cancelado.`)
                    })

                return
            }

        }

        async function NewReroll(sorteio, MessageId, Vencedores) {

            if (!sorteio)
                return message.reply(`${e.Deny} | Sorteio não encontrado para reroll.`)

            let embed = new MessageEmbed(),
                WinnersAmount = parseInt(Vencedores),
                Participantes = sorteio?.Participants || [],
                Channel = message.guild.channels.cache.get(sorteio?.ChannelId),
                Sponsor = sorteio?.Sponsor,
                Prize = sorteio?.Prize || 'Indefinido',
                MessageLink = sorteio?.MessageLink

            if (!Channel)
                return message.reply(`${e.Deny} | Canal não encontrado.`)

            if (!Participantes || Participantes.length === 0) {
                Database.deleteGiveaway(MessageId)
                return Channel.send(`${e.Deny} | Reroll cancelado por falta de participantes.\n🔗 | Sorteio link: ${sorteio?.MessageLink}`)
            }

            let vencedores = GetWinners(Participantes, WinnersAmount)

            if (vencedores.length === 0) {
                Database.deleteGiveaway(MessageId)
                return Channel.send(`${e.Deny} | Reroll cancelado por falta de participantes.\n🔗 | Giveaway Reference: ${MessageLink || 'Link indisponível'}`)
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

            }).catch(() => Database.deleteGiveaway(MessageId))

            if (sorteio)
                Database.Giveaway.updateOne(
                    { MessageID: MessageId },
                    { TimeToDelete: Date.now() }
                )

            function GetWinners(WinnersArray, Amount) {

                let Winners = []

                if (WinnersArray.length === 0)
                    return []

                WinnersArray.length >= Amount
                    ? (() => {

                        for (let i = 0; i < Amount; i++)
                            Winners.push(GetUserWinner())

                    })()
                    : (() => Winners.push(...WinnersArray))()

                function GetUserWinner() {

                    const Winner = WinnersArray[Math.floor(Math.random() * WinnersArray.length)]
                    return Winners.includes(Winner) ? GetUserWinner() : Winner

                }

                return Winners
            }

            function GetMember(memberId) {
                const member = message.guild.members.cache.get(memberId)

                return member
                    ? `${member} *\`${member?.id || '0'}\`*`
                    : (async () => {

                        await Database.Giveaway.updateOne(
                            { MessageID: MessageId },
                            { $pull: { Participants: memberId } }
                        )

                        return `${e.Deny} Usuário não encontrado.`
                    })()
            }
        }

    }
}