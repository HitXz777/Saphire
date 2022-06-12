const client = require('../../../index')

module.exports = {
    name: 'giveaway',
    description: 'Crie sorteios no servidor',
    type: 1, // 'CHAT_INPUT',
    default_member_permissions: client.perms.MANAGE_CHANNELS,
    dm_permission: false,
    options: [
        {
            name: 'prize',
            description: 'Prêmio do sorteio',
            type: 3,
            required: true
        },
        {
            name: 'time',
            description: 'Para quando é o sorteio?',
            type: 3,
            required: true
        },
        {
            name: 'channel',
            description: 'Canal do sorteio',
            type: 7,
            required: true
        },
        {
            name: 'winners',
            description: 'Quantidade de vencedores',
            type: 4
        },
        {
            name: 'requires',
            description: 'Quais os requisitos para este sorteio',
            type: 3
        },
        {
            name: 'imageurl',
            description: 'Quer alguma imagem no sorteio?',
            type: 3
        }
    ],
    async execute({ interaction: interaction, database: Database, emojis: e }) {

        const momemt = require('moment'),
            Data = require('../../../modules/functions/plugins/data')

        const { options, guild, user, channel: intChannel } = interaction

        for (let perm of [{ discord: 'MANAGE_CHANNELS', user: 'GERENCIAR CANAIS' }, { discord: 'MANAGE_MESSAGES', user: 'GERENCIAR MENSAGENS' }])
            if (!guild.me.permissions.toArray().includes(perm.discord))
                return await interaction.reply({
                    content: `❌ | Eu preciso da permissão **\`${perm.user}\`**. Por favor, me dê esta permissão que eu vou conseguir fazer o sorteio.`,
                    ephemeral: true
                })

        let Prize = options.getString('prize')
        let Time = options.getString('time')
        let Requisitos = options.getString('requires') || null
        let imageURL = options.getString('imageurl') || null
        let Channel = options.getChannel('channel')
        let WinnersAmount = options.getInteger('winners') || 1
        let TimeMs = 0

        if (Channel.type !== 'GUILD_TEXT')
            return await interaction.reply({
                content: '❌ | O canal selecionado não é um canal de texto.',
                ephemeral: true
            })

        if (WinnersAmount > 20 || WinnersAmount < 1)
            return await interaction.reply({
                content: '❌ | A quantidade de vencedores deve estar dentro de 1 a 20 usuários.',
                ephemeral: true
            })

        if (Requisitos?.length > 1024)
            return await interaction.reply({
                content: '❌ | O limite máximo do requisito é de 1024 caracteres.',
                ephemeral: true
            })

        let Args = Time.trim().split(/ +/g)

        if (Args[0].includes('/') || Args[0].includes(':') || ['hoje', 'today', 'tomorrow', 'amanhã'].includes(Args[0]?.toLowerCase())) {

            let data = Args[0],
                hour = Args[1]

            if (['tomorrow', 'amanhã'].includes(data.toLowerCase()))
                data = day(true)

            if (['hoje', 'today'].includes(data.toLowerCase()))
                data = day()

            if (!hour && data.includes(':') && data.length <= 5) {
                data = day()
                hour = Args[0]
            }

            if (data.includes('/') && data.length === 10 && !hour)
                hour = '12:00'

            if (!data || !hour)
                return await interaction.reply({
                    content: '❌ | A data informada para o sorteio não é correta. Veja alguma formas de dizer a data:\n> Formato 1: \`h, m, s\` - Exemplo: 1h 10m 40s *(1 hora, 10 minutos, 40 segundos)* ou \`1m 10s\`, \`2h 10m\`\n> Formato 2: \`30/01/2022 14:35:25\` - *(Os segundos são opcionais)*\n> Formato 3: \`hoje 14:35 | amanhã 14:35\`\n> Formato 4: \`14:35\` ou \`30/01/2022\`',
                    ephemeral: true
                })

            let dataArray = data.split('/'),
                hourArray = hour.split(':'),
                dia = parseInt(dataArray[0]),
                mes = parseInt(dataArray[1]) - 1,
                ano = parseInt(dataArray[2]),
                hora = parseInt(hourArray[0]),
                minutos = parseInt(hourArray[1]),
                segundos = parseInt(hourArray[2]) || 0

            let date = moment.tz({ day: dia, month: mes, year: ano, hour: hora, minutes: minutos, seconds: segundos }, "America/Sao_Paulo")

            if (!date.isValid())
                return await interaction.reply({
                    content: '❌ | O tempo informado não é válido. Verifique se você escreveu o tempo de forma correta.',
                    ephemeral: true
                })

            date = date.valueOf()

            if (date < Date.now()) return await interaction.reply({
                content: '❌ | O tempo do lembrete deve ser maior que o tempo de "agora", não acha?',
                ephemeral: true
            })

            TimeMs += date - Date.now()

        } else {

            for (let arg of Args) {

                if (arg.slice(-1).includes('d')) {
                    let time = arg.replace(/d/g, '000') * 60 * 60 * 24
                    if (isNaN(time)) return cancelReminder()
                    TimeMs += parseInt(time)
                    continue
                }

                if (arg.slice(-1).includes('h')) {
                    let time = arg.replace(/h/g, '000') * 60 * 60
                    if (isNaN(time)) return cancelReminder()
                    TimeMs += parseInt(time)
                    continue
                }

                if (arg.slice(-1).includes('m')) {
                    let time = arg.replace(/m/g, '000') * 60
                    if (isNaN(time)) return cancelReminder()
                    TimeMs += parseInt(time)
                    continue
                }

                if (arg.slice(-1).includes('s')) {
                    let time = arg.replace(/s/g, '000')
                    if (isNaN(time)) return cancelReminder()
                    TimeMs += parseInt(time)
                    continue
                }

                return cancelReminder()
                async function cancelReminder() {
                    return await interaction.reply({
                        content: '❌ | Data inválida! Verifique se a data esta realmente correta: \`dd/mm/aaaa hh:mm\` *(dia, mês, ano, horas, minutos)*\nℹ | Exemplo: \`30/01/2022 14:35:25\` *(Os segundos são opcionais)*\nℹ | \`hoje 14:35\`\nℹ | \`Amanhã 14:35\`',
                        ephemeral: true
                    })
                }
            }
        }

        if (TimeMs > 2592000000)
            return await interaction.reply({
                content: '❌ | O tempo limite é de 30 dias.',
                ephemeral: true
            })

        const msg = await Channel.send({ embeds: [{ color: client.blue, title: `${e.Loading} | Construindo sorteio...` }] }).catch(() => { })
        if (!msg?.id)
            return await interaction.reply({
                content: '❌ | Falha ao obter o ID da mensagem do sorteio. Verifique se eu realmente tenho permissão para enviar mensagem no canal de sorteios.',
                ephemeral: true
            })

        await interaction.reply({ content: '✅ | Tudo certo! Todos os dados foram coletados.', ephemeral: true })
        let Message = await intChannel.send({ content: `${e.Loading} | Tudo certo! Última parte agora. Escolha um emoji **\`do Discord ou deste servidor\`** que você quer para o sorteio e **\`reaja nesta mensagem\`**. Caso queira o padrão, basta reagir em 🎉` })
        Message.react('🎉').catch(() => { })
        let collected = false

        let collector = Message.createReactionCollector({
            filter: (r, u) => u.id === user.id,
            idle: 20000
        })
            .on('collect', (reaction) => {

                let emoji = reaction.emoji

                if (emoji.id && !guild.emojis.cache.get(emoji.id))
                    return Message.edit(`${Message.content}\n \n❌ | Este emoji não pertence a este servidor. Por favor, escolha um emoji deste servidor ou do Discord.`)

                let emojiData = emoji.id || emoji.name

                msg.react(emoji).catch(err => {
                    Database.deleteGiveaway(msg.id)
                    collected = true
                    collector.stop()
                    return intChannel.send(`${e.Warn} | Erro ao reagir no sorteio. | \`${err}\``)
                })

                collected = true
                collector.stop()
                return registerGiveaway(msg, emoji, emojiData, Message)
            })
            .on('end', () => {
                if (collected) return

                msg.react('🎉').catch(err => {
                    Database.deleteGiveaway(msg.id)
                    return intChannel.send(`${e.Warn} | Erro ao reagir no sorteio. | \`${err}\``)
                })

                return registerGiveaway(msg, '🎉', '🎉', Message)
            })

        return
        async function registerGiveaway(msg, emoji = '🎉', emojiData = '🎉', Message) {

            new Database.Giveaway({ // new Class Model
                MessageID: msg.id, // Id da Mensagem
                GuildId: guild.id, // Id do Servidor
                Prize: Prize, // Prêmio do sorteio
                Winners: WinnersAmount, // Quantos vencedores
                Emoji: emojiData, // Quantos vencedores
                TimeMs: TimeMs, // Tempo do Sorteio
                DateNow: Date.now(), // Agora
                ChannelId: Channel.id, // Id do Canal
                Actived: true, // Ativado
                MessageLink: msg.url, // Link da mensagem
                Sponsor: user.id, // Quem fez o sorteio
                TimeEnding: Data(TimeMs) // Hora que termina o sorteio
            }).save()

            const embed = {
                color: 0x0099ff,
                title: `${e.Tada} Sorteios ${guild.name}`,
                description: `Para entrar no sorteio, basta reagir no emoji ${emoji}`,
                fields: [
                    {
                        name: `${e.Star} Prêmio`,
                        value: `> ${Prize}`
                    },
                    {
                        name: `${e.ModShield} Patrocinado por`,
                        value: `> ${user}`,
                        inline: true
                    },
                    {
                        name: `${e.CoroaDourada} Vencedores`,
                        value: `> ${parseInt(WinnersAmount)}`,
                        inline: true
                    }
                ],
                image: {
                    url: imageURL || null,
                },
                timestamp: new Date(Date.now() + TimeMs),
                footer: {
                    text: `Giveaway ID: ${msg?.id} | Resultado`
                }
            }

            if (Requisitos)
                embed.fields.push({
                    name: `${e.Commands} Requisitos`,
                    value: `${Requisitos}`
                })

            let isError = false

            msg.edit({ embeds: [embed] })
                .catch(async err => {
                    isError = true
                    Database.deleteGiveaway(msg.id)
                    msg.delete().catch(() => { })

                    if (err.code === 50035)
                        return await interaction.followUp({
                            content: `⚠️ | Erro ao criar o sorteio.\nℹ | O link de imagem fornecido não é compátivel com as embeds do Discord.`,
                            ephemeral: true
                        })

                    return await interaction.followUp({
                        content: `⚠️ | Erro ao criar o sorteio. | \`${err}\``,
                        ephemeral: true
                    })
                })

            if (isError) return
            return Message.edit(`${e.Check} | Sorteio criado com sucesso! Você pode vê-lo no canal ${msg.channel}`).catch(() => { })
        }

    }
}