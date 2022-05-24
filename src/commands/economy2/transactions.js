const { e } = require('../../../JSON/emojis.json'),
    Colors = require('../../../modules/functions/plugins/colors'),
    { MessageButton, MessageActionRow } = require('discord.js')

module.exports = {
    name: 'transactions',
    aliases: ['transações', 'extrato', 'transação', 'ts'],
    category: 'economy',
    ClientPermissions: ['ADD_REACTIONS'],
    emoji: `${e.MoneyWings}`,
    usage: '<transactions> [@user]',
    description: 'Veja o extrato bancário.',

    execute: async (client, message, args, prefix, MessageEmbed, Database) => {

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

        embeds = EmbedGenerator()

        if (!embeds[EmbedsControl])
            return msg.edit({ content: 'Embed Generation Failed to Payload', embeds: [] }).catch(() => { })

        if (embeds.length === 1)
            return msg.edit({ content: 'Apenas uma página de transações.', embeds: [embeds[0]] }).catch(() => { })

        let buttons = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setCustomId('zero')
                    .setEmoji('⏪')
                    .setStyle('PRIMARY')
            )
            .addComponents(
                new MessageButton()
                    .setCustomId('left')
                    .setEmoji('◀️')
                    .setStyle('PRIMARY')
            )
            .addComponents(
                new MessageButton()
                    .setCustomId('right')
                    .setEmoji('▶️')
                    .setStyle('PRIMARY')
            )
            .addComponents(
                new MessageButton()
                    .setCustomId('last')
                    .setEmoji('⏩')
                    .setStyle('PRIMARY')
            )

        let buttons2 = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setCustomId('gain')
                    .setEmoji(`${e.gain}`)
                    .setStyle('SUCCESS')
            )
            .addComponents(
                new MessageButton()
                    .setCustomId('lose')
                    .setEmoji(`${e.loss}`)
                    .setStyle('SUCCESS')
            )
            .addComponents(
                new MessageButton()
                    .setCustomId('admin')
                    .setEmoji(`${e.Admin}`)
                    .setStyle('SUCCESS')
            )
            .addComponents(
                new MessageButton()
                    .setCustomId('all')
                    .setEmoji('🔄')
                    .setStyle('SUCCESS')
            )

        msg.edit({
            content: 'Use os botões abaixo para navegar entre as transações',
            embeds: [embeds[0]],
            components: [buttons, buttons2]
        })

        return msg.createMessageComponentCollector({
            filter: (interaction) => interaction.user.id === message.author.id,
            idle: 40000
        })

            .on('collect', (interaction) => {
                interaction.deferUpdate().catch(() => { })

                let customId = interaction.customId

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
                    transactions = userData?.Transactions?.filter(data => data.data?.includes(e.gain))
                    let newEmbeds = EmbedGenerator()

                    if (!newEmbeds || newEmbeds.length === 0)
                        return msg.edit({ content: 'Nenhuma transação da categora "Lucro" foi encontrada.', embeds: [] }).catch(() => { })

                    if (newEmbeds.length === 1)
                        return msg.edit({ content: 'Apenas uma página de transações.', embeds: [newEmbeds[0]] }).catch(() => { })

                    embeds = newEmbeds
                    EmbedsControl = 0
                    return msg.edit({ content: 'Use os botões para navegar entre as transações.', embeds: [embeds[0]] }).catch(() => { })
                }

                if (customId === 'lose') {
                    transactions = userData?.Transactions?.filter(data => data.data?.includes(e.loss))
                    let newEmbeds = EmbedGenerator()

                    if (!newEmbeds || newEmbeds.length === 0)
                        return msg.edit({ content: 'Nenhuma transação da categora "Perda" foi encontrada.', embeds: [] }).catch(() => { })

                    if (newEmbeds.length === 1)
                        return msg.edit({ content: 'Apenas uma página de transações.', embeds: [newEmbeds[0]] }).catch(() => { })

                    embeds = newEmbeds
                    EmbedsControl = 0
                    return msg.edit({ content: 'Use os botões para navegar entre as transações.', embeds: [embeds[0]] }).catch(() => { })
                }

                if (customId === 'admin') {
                    transactions = userData?.Transactions?.filter(data => data.data?.includes(e.Admin))
                    let newEmbeds = EmbedGenerator()

                    if (!newEmbeds || newEmbeds.length === 0)
                        return msg.edit({ content: 'Nenhuma transação da categora "Ações de Administradores" foi encontrada.', embeds: [] }).catch(() => { })

                    if (newEmbeds.length === 1)
                        return msg.edit({ content: 'Apenas uma página de transações.', embeds: [newEmbeds[0]] }).catch(() => { })

                    embeds = newEmbeds
                    EmbedsControl = 0
                    return msg.edit({ content: 'Use os botões para navegar entre as transações.', embeds: [embeds[0]] }).catch(() => { })
                }

                if (customId === 'all') {
                    transactions = userData?.Transactions
                    let newEmbeds = EmbedGenerator()

                    if (!newEmbeds || newEmbeds.length === 0)
                        return msg.edit({ content: 'Nenhuma transação da categora "Total" foi encontrada.', embeds: [] }).catch(() => { })

                    if (newEmbeds.length === 1)
                        return msg.edit({ content: 'Apenas uma página de transações.', embeds: [newEmbeds[0]] }).catch(() => { })

                    embeds = newEmbeds
                    EmbedsControl = 0
                    return msg.edit({ content: 'Use os botões para navegar entre as transações.', embeds: [embeds[0]] }).catch(() => { })
                }

                return
            })

            .on('end', () => msg.edit({ content: `${e.Deny} Comando cancelado.`, components: [] }).catch(() => { }))

        function EmbedGenerator() {

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
}