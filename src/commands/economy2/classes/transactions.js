class EmbedGeneratorClass {
    generate(transactions = [], user, message) {
        let { e } = Transactions

        let amount = 10,
            Page = 1,
            embeds = [],
            AuthorOrUser = user.id === message.author.id ? 'Suas transações' : `Transações de ${user.tag}`,
            length = transactions.length / 10 <= 1 ? 1 : parseInt((transactions.length / 10) + 1)

        for (let i = 0; i < transactions.length; i += 10) {

            let current = transactions.slice(i, amount),
                description = current.map(t => `> \`${t.time}\` ${t.data}`).join("\n")

            if (current.length > 0) {

                embeds.push({
                    color: 'GREEN',
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

class Transactions {
    static e = require('../../../../JSON/emojis.json').e
    static Colors = require('../../../../modules/functions/plugins/colors')
}

Transactions.prototype.execute = async (client, message, args, prefix, MessageEmbed, Database) => {

    let { e, Colors } = Transactions
    const { generate: EmbedGenerator } = new EmbedGeneratorClass()

    if (['info', 'help', 'ajuda'].includes(args[0]?.toLowerCase()))
        return TransactionsInfo()

    let msg = await message.reply({ embeds: [new MessageEmbed().setColor(client.blue).setDescription(`${e.Loading} | Carregando transações...`)] }),
        user = message.mentions.users.first() || message.mentions.repliedUser || client.users.cache.find(data => data.username?.toLowerCase() === args.join(' ')?.toLowerCase() || data.tag?.toLowerCase() === args[0]?.toLowerCase() || data.discriminator === args[0] || data.id === args[0]) || message.author,
        userData = await Database.User.findOne({ id: user?.id }, 'Transactions'),
        embeds = [],
        EmbedsControl = 0

    if (!userData)
        return msg.edit({ content: `${e.Database} | DATABASE | Não foi possível obter os dados de **${user?.tag || 'indefinido'}** *\`${user?.id || 0}\`*`, embeds: [] }).catch(() => { })

    let transactions = userData?.Transactions || []

    if (user.bot || transactions.length === 0)
        return msg.edit({ content: `${e.Deny} | Nenhuma transação foi encontrada.`, embeds: [] }).catch(() => { })

    embeds = EmbedGenerator(userData?.Transactions, user, message)

    if (!embeds[EmbedsControl])
        return msg.edit({ content: 'Embed Generation Failed to Payload', embeds: [] }).catch(() => { })

    if (embeds.length === 1)
        return msg.edit({ content: 'Apenas uma página de transações.', embeds: [embeds[0]] }).catch(() => { })

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

    msg.edit({
        content: 'Use os botões abaixo para navegar entre as transações',
        embeds: [embeds[0]],
        components: [buttons, selectMenuObject]
    })

    let collector = msg.createMessageComponentCollector({
        filter: (interaction) => interaction.user.id === message.author.id,
        idle: 40000
    })

        .on('collect', (interaction) => {

            let customId = interaction.customId === 'menu' ? interaction.values[0] : interaction.customId

            if (customId === 'reportTransactions') return

            interaction.deferUpdate().catch(() => { })
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
                embeds = EmbedGenerator(userData?.Transactions?.filter(data => data.data?.includes(e.gain)), user, message)

                if (!embeds || embeds.length === 0)
                    return msg.edit({ content: 'Nenhuma transação da categora "Lucro" foi encontrada.', embeds: [] }).catch(() => { })

                if (embeds.length === 1)
                    return msg.edit({ content: 'Apenas uma página de transações.', embeds: [embeds[0]], components: [selectMenuObject] }).catch(() => { })

                EmbedsControl = 0
                return msg.edit({ content: 'Use os botões para navegar entre as transações.', embeds: [embeds[0]], components: [buttons, selectMenuObject] }).catch(() => { })
            }

            if (customId === 'lose') {
                embeds = EmbedGenerator(userData?.Transactions?.filter(data => data.data?.includes(e.loss)), user, message)

                if (!embeds || embeds.length === 0)
                    return msg.edit({ content: 'Nenhuma transação da categora "Perda" foi encontrada.', embeds: [] }).catch(() => { })

                if (embeds.length === 1)
                    return msg.edit({ content: 'Apenas uma página de transações.', embeds: [embeds[0]], components: [selectMenuObject] }).catch(() => { })

                EmbedsControl = 0
                return msg.edit({ content: 'Use os botões para navegar entre as transações.', embeds: [embeds[0]], components: [buttons, selectMenuObject] }).catch(() => { })
            }

            if (customId === 'admin') {
                embeds = EmbedGenerator(userData?.Transactions?.filter(data => data.data?.includes(e.Admin)), user, message)

                if (!embeds || embeds.length === 0)
                    return msg.edit({ content: 'Nenhuma transação da categora "Ações de Administradores" foi encontrada.', embeds: [] }).catch(() => { })

                if (embeds.length === 1)
                    return msg.edit({ content: 'Apenas uma página de transações.', embeds: [embeds[0]], components: [selectMenuObject] }).catch(() => { })

                EmbedsControl = 0
                return msg.edit({ content: 'Use os botões para navegar entre as transações.', embeds: [embeds[0]], components: [buttons, selectMenuObject] }).catch(() => { })
            }

            if (customId === 'all') {
                embeds = EmbedGenerator(userData?.Transactions, user, message)

                if (!embeds || embeds.length === 0)
                    return msg.edit({ content: 'Nenhuma transação da categora "Total" foi encontrada.', embeds: [] }).catch(() => { })

                if (embeds.length === 1)
                    return msg.edit({ content: 'Apenas uma página de transações.', embeds: [embeds[0]], components: [selectMenuObject] }).catch(() => { })

                EmbedsControl = 0
                return msg.edit({ content: 'Use os botões para navegar entre as transações.', embeds: [embeds[0]], components: [buttons, selectMenuObject] }).catch(() => { })
            }

            return

            // function refreshComponents(length = 0) {

            //     if (length > 1)
            //         return msg.edit({ components: [buttons, selectMenuObject] })

            //     if (length === 1)
            //         return msg.edit({ components: [selectMenuObject] })
            // }
        })

        .on('end', () => {

            let embed = msg.embeds[0]
            if (!embed) return msg.edit({ content: `${e.Deny} Comando cancelado.`, components: [] }).catch(() => { })

            embed.color = client.red
            return msg.edit({ content: `${e.Deny} Comando cancelado.`, embeds: [embed], components: [] }).catch(() => { })
        })

    async function TransactionsInfo() {

        let color = await Colors(message.author.id)

        return message.reply(
            {
                embeds: [
                    new MessageEmbed()
                        .setColor(color)
                        .setTitle(`${e.MoneyWings} Transações`)
                        .setDescription(`Aqui você pode ver todas as suas transações.\nAtalho principal: \`${prefix}ts\``)
                        .addFields(
                            {
                                name: `${e.Gear} Comando`,
                                value: `\`${prefix}ts\` ou \`${prefix}ts <@user/ID>\` para ver as transações de alguém`
                            },
                            {
                                name: '🔍 Filtros',
                                value: `Com os filtros, você pode ver apenas o que você quer.\n${e.gain} Veja apenas o que entrou na conta\n${e.loss} Vejas apenas o que saiu da conta\n${e.Admin} Ações tomadas pelos Administradores da Economia Global\n🔄 Resete o painel para todas as transações`
                            }
                        )
                ]
            }
        )
    }
}

module.exports = Transactions