const { getUser } = require('../../../modules/functions/plugins/eventPlugins')
const Colors = require('../../../modules/functions/plugins/colors')

module.exports = {
    name: 'transactions',
    description: '[economy] Veja suas transações (ou a de alguém)',
    dm_permission: false,
    type: 1,
    options: [
        {
            name: 'user',
            description: 'Selecione um usuário para ver suas transações',
            type: 6
        },
        {
            name: 'search',
            description: 'Pesquise por um usuário',
            type: 3
        }
    ],
    async execute({ interaction: interaction, client: client, database: Database, emojis: e }) {

        const { options, user: author } = interaction
        let color = await Colors(author.id)

        let user = options.getUser('user') || getUser(options.getString('search'), client) || author

        let userData = await Database.User.findOne({ id: user?.id }, 'Transactions'),
            embeds = [],
            EmbedsControl = 0

        if (!userData)
            return await interaction.reply({
                content: `${e.Database} | DATABASE | Não foi possível obter os dados de **${user?.tag || 'indefinido'}** *\`${user?.id || 0}\`*`,
                ephemeral: true
            }).catch(() => { })

        let transactions = userData?.Transactions || []

        if (user.bot || transactions.length === 0)
            return await interaction.reply({
                content: `${e.Deny} | Nenhuma transação foi encontrada.`,
                ephemeral: true
            })

        embeds = EmbedGenerator(userData?.Transactions, user, user.id) || []

        if (!embeds[EmbedsControl])
            return await interaction.reply({
                content: `${e.Deny} | Embed Generation Failed to Payload.`,
                ephemeral: true
            })

        if (embeds.length === 1)
            return await interaction.reply({
                embeds: [embeds[0]]
            })

        let buttons = {
            type: 1,
            components: [
                {
                    type: 2,
                    emoji: '⏪',
                    custom_id: 'zero',
                    style: 'PRIMARY'
                },
                {
                    type: 2,
                    emoji: '◀️',
                    custom_id: 'left',
                    style: 'PRIMARY'
                },
                {
                    type: 2,
                    emoji: '▶️',
                    custom_id: 'right',
                    style: 'PRIMARY'
                },
                {
                    type: 2,
                    emoji: '⏩',
                    custom_id: 'last',
                    style: 'PRIMARY'
                },
            ]
        }

        let selectMenuObject = {
            type: 1,
            components: [{
                type: 3,
                custom_id: 'menu',
                placeholder: 'Opções de transações',
                options: [
                    {
                        label: 'Ganho',
                        emoji: e.gain || '💸',
                        description: 'Filtre suas transações por ganho de Safiras',
                        value: 'gain',
                    },
                    {
                        label: 'Perda',
                        emoji: e.loss || '📈',
                        description: 'Filtre suas transações por perda de Safiras',
                        value: 'lose',
                    },
                    {
                        label: 'Administrativo',
                        emoji: e.Admin || '⚙️',
                        description: 'Filtre suas transações por ações administrativas',
                        value: 'admin',
                    },
                    {
                        label: 'Início',
                        emoji: '🔄',
                        description: 'Volte para a página inicial de transações',
                        value: 'all',
                    },
                    {
                        label: 'Reportar',
                        emoji: '🚨',
                        description: 'Reporte um erro nas suas transações',
                        value: 'reportTransactions',
                    },
                    {
                        label: 'Cancelar',
                        emoji: '❌',
                        description: 'Encerre o comando',
                        value: 'cancel',
                    },
                ]
            }]
        }

        let dataComponents = {
            content: 'Use os botões abaixo para navegar entre as transações',
            embeds: [embeds[0]],
            fetchReply: true
        }

        if (embeds.length > 1)
            dataComponents.components = [selectMenuObject, buttons]

        let msg = await interaction.reply(dataComponents)

        if (embeds.length <= 1) return

        let collector = msg.createMessageComponentCollector({
            filter: (i) => i.user.id === author.id,
            idle: 40000
        })

            .on('collect', (int) => {

                let customId = int.customId === 'menu' ? int.values[0] : int.customId

                if (customId === 'reportTransactions') return

                int.deferUpdate().catch(() => { })
                if (customId === 'cancel') return collector.stop()

                if (customId === 'zero') {
                    if (EmbedsControl === 0) return
                    EmbedsControl = 0
                    return msg.edit({ embeds: [embeds[0]] }).catch(() => { })
                }

                if (customId === 'last') {
                    if (EmbedsControl === embeds.length - 1) return
                    EmbedsControl = embeds.length - 1
                    return msg.edit({ embeds: [embeds[EmbedsControl]] }).catch(() => { })
                }

                if (customId === 'right') {
                    EmbedsControl++
                    return embeds[EmbedsControl] ? msg.edit({ embeds: [embeds[EmbedsControl]] }).catch(() => { }) : EmbedsControl--
                }

                if (customId === 'left') {
                    EmbedsControl--
                    return embeds[EmbedsControl] ? msg.edit({ embeds: [embeds[EmbedsControl]] }).catch(() => { }) : EmbedsControl++
                }

                if (customId === 'gain') {
                    embeds = EmbedGenerator(userData?.Transactions?.filter(data => data.data?.includes(e.gain)))

                    if (!embeds || embeds.length === 0)
                        return msg.edit({ content: 'Nenhuma transação da categora "Lucro" foi encontrada.', embeds: [] }).catch(() => { })

                    if (embeds.length === 1)
                        return msg.edit({ content: 'Apenas uma página de transações.', embeds: [embeds[0]], components: [selectMenuObject] }).catch(() => { })

                    EmbedsControl = 0
                    return msg.edit({ content: 'Use os botões para navegar entre as transações.', embeds: [embeds[0]], components: [selectMenuObject, buttons] }).catch(() => { })
                }

                if (customId === 'lose') {
                    embeds = EmbedGenerator(userData?.Transactions?.filter(data => data.data?.includes(e.loss)))

                    if (!embeds || embeds.length === 0)
                        return msg.edit({ content: 'Nenhuma transação da categora "Perda" foi encontrada.', embeds: [] }).catch(() => { })

                    if (embeds.length === 1)
                        return msg.edit({ content: 'Apenas uma página de transações.', embeds: [embeds[0]], components: [selectMenuObject] }).catch(() => { })

                    EmbedsControl = 0
                    return msg.edit({ content: 'Use os botões para navegar entre as transações.', embeds: [embeds[0]], components: [selectMenuObject, buttons] }).catch(() => { })
                }

                if (customId === 'admin') {
                    embeds = EmbedGenerator(userData?.Transactions?.filter(data => data.data?.includes(e.Admin)))

                    if (!embeds || embeds.length === 0)
                        return msg.edit({ content: 'Nenhuma transação da categora "Ações de Administradores" foi encontrada.', embeds: [] }).catch(() => { })

                    if (embeds.length === 1)
                        return msg.edit({ content: 'Apenas uma página de transações.', embeds: [embeds[0]], components: [selectMenuObject] }).catch(() => { })

                    EmbedsControl = 0
                    return msg.edit({ content: 'Use os botões para navegar entre as transações.', embeds: [embeds[0]], components: [selectMenuObject, buttons] }).catch(() => { })
                }

                if (customId === 'all') {
                    embeds = EmbedGenerator(userData?.Transactions)

                    if (!embeds || embeds.length === 0)
                        return msg.edit({ content: 'Nenhuma transação da categora "Total" foi encontrada.', embeds: [] }).catch(() => { })

                    if (embeds.length === 1)
                        return msg.edit({ content: 'Apenas uma página de transações.', embeds: [embeds[0]], components: [selectMenuObject] }).catch(() => { })

                    EmbedsControl = 0
                    return msg.edit({ content: 'Use os botões para navegar entre as transações.', embeds: [embeds[0]], components: [selectMenuObject, buttons] }).catch(() => { })
                }

                return
            })

            .on('end', () => {

                let embed = msg.embeds[0]
                if (!embed) return msg.edit({ content: `${e.Deny} Comando cancelado.`, components: [] }).catch(() => { })

                embed.color = client.red
                return msg.edit({ content: `${e.Deny} Comando cancelado.`, embeds: [embed], components: [] }).catch(() => { })
            })

        function EmbedGenerator(transactions = []) {

            let amount = 10,
                Page = 1,
                embeds = [],
                AuthorOrUser = user.id === author.id ? 'Suas transações' : `Transações de ${user.tag}`,
                length = transactions.length / 10 <= 1 ? 1 : parseInt((transactions.length / 10) + 1)

            for (let i = 0; i < transactions.length; i += 10) {

                let current = transactions.slice(i, amount),
                    description = current.map(t => `> \`${t.time}\` ${t.data}`).join("\n")

                if (current.length > 0) {

                    embeds.push({
                        color: color,
                        title: `${e.MoneyWings} ${AuthorOrUser} - ${Page}/${length}`,
                        description: `${description}`,
                        footer: {
                            text: `${transactions.length} transações contabilizadas`
                        },
                    })

                    Page++
                    amount += 10
                }

            }

            return embeds
        }
    }
}