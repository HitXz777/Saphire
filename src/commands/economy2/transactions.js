const { f } = require('../../../database/frases.json'),
    { e } = require('../../../database/emojis.json'),
    { Transactions } = require('../../../Routes/functions/database'),
    Colors = require('../../../Routes/functions/colors')

module.exports = {
    name: 'transactions',
    aliases: ['transações', 'extrato', 'transação', 'ts'],
    category: 'economy2',
    ClientPermissions: ['ADD_REACTIONS'],
    emoji: `${e.MoneyWings}`,
    usage: '<transactions> [@user]',
    description: 'Veja o extrato bancário.',

    run: async (client, message, args, prefix, db, MessageEmbed, request, sdb) => {

        let user = message.mentions.users.first() || message.mentions.repliedUser || await client.users.cache.get(args[0]) || client.users.cache.find(user => user.username?.toLowerCase() == args[0]?.toLowerCase() || user.tag?.toLowerCase() == args[0]?.toLowerCase()) || message.author,
            transactions = Transactions.get(`Transactions.${user.id}`) || []

        if (user.bot || transactions.length < 1)
            return message.reply(`${e.Deny} | Nenhuma transação foi encontrada.`)

        if (['delete', 'excluir', 'del'].includes(args[0]?.toLowerCase()))
            return DeleteAllTransactions()

        if (['info', 'help', 'ajuda'].includes(args[0]?.toLowerCase()))
            return TransactionsInfo()

        let embeds = EmbedGenerator(),
            msg = await message.reply({ embeds: [embeds[0]] }),
            EmbedsControl = 0

        if (embeds.length === 1) return

        for (const i of ['◀️', '▶️', '❌'])
            msg.react(i).catch(() => { })

        const collector = msg.createReactionCollector({
            filter: (reaction, user) => ['◀️', '▶️', '❌'].includes(reaction.emoji.name) && user.id === message.author.id,
            idle: 40000
        })

            .on('collect', (reaction) => {

                if (reaction.emoji.name === '❌')
                    return collector.stop()

                reaction.emoji.name === '▶️'
                    ? (() => {
                        EmbedsControl++
                        return embeds[EmbedsControl] ? msg.edit({ embeds: [embeds[EmbedsControl]] }).catch(() => { }) : EmbedsControl--
                    })()
                    : (() => {
                        EmbedsControl--
                        return embeds[EmbedsControl] ? msg.edit({ embeds: [embeds[EmbedsControl]] }).catch(() => { }) : EmbedsControl++
                    })()

            })

            .on('end', () => msg.edit({ content: `${e.Deny} Comando cancelado.` }))

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

            return embeds;
        }

        async function DeleteAllTransactions() {

            const msg = await message.channel.send(`${e.QuestionMark} | Você realmente deseja apagar **TODAS** as suas transações?`),
                collector = msg.createReactionCollector({
                    filter: (reaction, user) => ['✅', '❌'].includes(reaction.emoji.name) && user.id === message.author.id,
                    time: 30000,
                    errors: ['time']
                });

            for (const emoji of ['✅', '❌'])
                msg.react(emoji).catch(() => { })

            collector.on('collect', (reaction) => {
                return reaction.emoji.name === '✅' ? DeleteAllData(msg) : collector.stop()
            })

            collector.on('end', () => {
                return msg.edit(`${e.Deny} | Comando cancelado`).catch(() => { })
            })

        }

        function DeleteAllData(msg) {
            Transactions.delete(`Transactions.${message.author.id}`)
            return msg.edit(`${e.Check} | Todas as suas transações foram deletadas.`).catch(() => { })
        }

        function TransactionsInfo() {
            return message.reply(
                {
                    embeds: [
                        new MessageEmbed()
                            .setColor(Colors(message.member))
                            .setTitle(`${e.MoneyWings} Transações`)
                            .setDescription(`Aqui você pode ver todas as suas transações.\nAtalho principal: \`${prefix}ts\``)
                            .addFields(
                                {
                                    name: `${e.Gear} Comando`,
                                    value: `\`${prefix}ts\` ou \`${prefix}ts <@user/ID>\` para ver as transações de alguém`
                                },
                                {
                                    name: `${e.Deny} Delete as transações`,
                                    value: `\`${prefix}ts delete\` - Apaga tudo`
                                }
                            )
                    ]
                }
            )
        }

    }
}