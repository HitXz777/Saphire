module.exports = {
    name: 'cooldown',
    description: '[util] Veja todos os seus cooldown em todos os meus comandos',
    dm_permission: false,
    type: 1,
    options: [
        {
            name: 'user',
            description: 'Cooldown do usuário',
            type: 6
        },
        {
            name: 'global',
            description: 'Timeouts Globais',
            type: 5
        }
    ],
    async execute({ interaction: interaction, client: client, database: Database, emojis: e }) {

        const { options } = interaction

        let user = options.getUser('user') || interaction.user
        let isGlobal = options.getBoolean('global')

        const msg = await interaction.reply({
            embeds: [{
                color: client.blue,
                description: `${e.Loading} | Carregando...`
            }],
            fetchReply: true
        })

        let data = await Database.User.findOne({ id: user.id }, 'Timeouts Vip'),
            clientData = await Database.Client.findOne({ id: client.user.id }, 'Timeouts'),
            color = data.Color?.Set || client.blue,
            timeouts = data?.Timeouts,
            clientTimeouts = clientData?.Timeouts

        if (!timeouts) return msg.edit({ content: `${e.Database} | DATABASE | Nenhum dado foi encontrado para: **${user.tag} \`${user.id}\`**`, embeds: [] })

        let Daily = timeouts.Daily,
            Porquinho = timeouts.Porquinho,
            Work = timeouts.Work,
            Cu = timeouts.Cu,
            Bitcoin = timeouts.Bitcoin,
            Rep = timeouts.Rep,
            Vip = {
                DateNow: data.Vip.DateNow,
                TimeRemaing: data.Vip.TimeRemaing || 0,
                Permanent: data.Vip.Permanent
            },
            TDaily, TPig, TWork, TRestoreDividas, TCu, TBit, TLikes, TVip,
            TimeRestoreDividas = clientTimeouts.RestoreDividas

        // Timeout Daily
        TDaily = cooldown(86400000, Daily)

        // Timeout Pig
        TPig = cooldown(30000, Porquinho)

        // Timeout Work
        TWork = cooldown(66400000, Work)

        // Timeout RestoreDividas
        TRestoreDividas = cooldown(86400000, TimeRestoreDividas)

        // Timeout Cu
        TCu = cooldown(600000, Cu)

        // Timeout Bitcoin
        TBit = cooldown(7200000, Bitcoin)

        // Timeout Likes
        TLikes = cooldown(1800000, Rep)

        // Timeout Vip
        TVip = cooldown(Vip.TimeRemaing, Vip.DateNow, true)

        if (isGlobal)
            return SendCooldownsSaphire()

        return msg.edit({
            embeds: [
                {
                    color: color,
                    title: `⏱️ ${client.user.username} Timeouts | ${user?.username || "User not found."}`,
                    description: 'Aqui você pode conferir todos os timeouts.',
                    fields: [

                        {
                            name: `${e.VipStar} Vip`,
                            value: TVip || `\`Você não deveria ver essa mensagem... Usa "/bug", por favor?\``
                        },
                        {
                            name: `${e.MoneyWings} Daily`,
                            value: TDaily || `\`Você não deveria ver essa mensagem... Usa "/bug", por favor?\``
                        },
                        {
                            name: `${e.PepeRich} Work`,
                            value: TWork || `\`Você não deveria ver essa mensagem... Usa "/bug", por favor?\``
                        },
                        {
                            name: `${e.Pig} Pig`,
                            value: TPig || `\`Você não deveria ver essa mensagem... Usa "/bug", por favor?\``
                        },
                        {
                            name: `${e.SaphireOk} Cu`,
                            value: TCu || `\`Você não deveria ver essa mensagem... Usa "/bug", por favor?\``
                        },
                        {
                            name: `${e.BitCoin} Bitcoin`,
                            value: TBit || `\`Você não deveria ver essa mensagem... Usa "/bug", por favor?\``
                        },
                        {
                            name: `${e.Like} Like`,
                            value: TLikes || `\`Você não deveria ver essa mensagem... Usa "/bug", por favor?\``
                        },
                    ]
                }
            ]
        }).catch(() => { })

        function SendCooldownsSaphire() {
            return msg.edit({
                embeds: [
                    {
                        color: color,
                        title: `⏱️ ${client.user.username} Timeouts | Global`,
                        description: 'Timeouts Globais',
                        fields: [
                            {
                                name: `${e.MoneyWings} Restaurar Dívida`,
                                value: TRestoreDividas || `\`Você não deveria ver essa mensagem... Usa "/bug", por favor?\``
                            }
                        ]
                    }
                ]
            }).catch(() => { })
        }

        function cooldown(ms, timeDatabase = 0, vip = false) {

            if (vip) {
                if (Vip.Permanent) return `\`Permanente\``
                return ms - (Date.now() - timeDatabase) > 0 ? cooldown(ms, timeDatabase) : '\`Indisponível\`'
            }

            return client.Timeout(ms, timeDatabase) ? `${e.Loading} \`${client.GetTimeout(ms, timeDatabase)}\`` : `${e.Check} \`Disponível\``
        }

    }
}