const { e } = require('../../../database/emojis.json')
const { f } = require('../../../database/frases.json')
const Moeda = require('../../../Routes/functions/moeda')
const Error = require('../../../Routes/functions/errors')
const { TransactionsPush } = require('../../../Routes/functions/transctionspush')

module.exports = {
    name: 'cobrar',
    aliases: ['mepaga', 'pagueme'],
    category: 'economy',
    ClientPermissions: ['ADD_REACTIONS'],
    emoji: `${e.Coin}`,
    usage: '<cobrar> <@user> <quantia>',
    description: 'Cobre os que te devem',

    run: async (client, message, args, prefix, db, MessageEmbed, request, sdb) => {

        let member = message.mentions.members.first() || message.mentions.repliedUser || message.guild.members.cache.get(args[0]) || message.guild.members.cache.find(user => user.displayName?.toLowerCase() == args[0]?.toLowerCase() || user.user.username?.toLowerCase() == args[0]?.toLowerCase()) || message.member

        const cobre = new MessageEmbed()
            .setColor('#246FE0')
            .setTitle('💸 Sistema de cobrança')
            .setDescription('Cobre as pessoas que te devem ou apenas peça dinheiro, você que sabe.')
            .addField('Comando', `\`${prefix}cobrar @user quantia\``)
            .setFooter(`A ${client.user.username} não se responsabiliza por dinheiro perdido ou mal usado.`)

        let Quantia = parseInt(args[1]?.replace(/k/g, '000'))
        if (!args[1]) Quantia = parseInt(args[0]?.replace(/k/g, '000'))
        if (member.id === message.author.id) return message.reply({ embeds: [cobre] })
        if (member.id === client.user.id) return message.reply('Sai pra lá, eu não to devendo ninguém.')
        if (!Quantia) return message.reply(`${e.Deny} | E a quantia? Tenta assim: \`${prefix}cobrar @user quantia\``)
        if (isNaN(Quantia)) return message.reply(`${e.Deny} | **${Quantia}** | Não é um número.`).catch(() => { })
        if (parseInt(Quantia) <= 0) { return message.reply('Diga um valor maior que 0') }

        let UserMoney = sdb.get(`Users.${member.id}.Balance`)
        let UserBank = sdb.get(`Users.${member.id}.Bank`)
        if ((UserMoney + UserBank) <= 0) return message.reply(`${e.Deny} | ${member.user.username} não possui dinheiro.`)
        if ((UserMoney + UserBank) < Quantia) return message.reply(`${e.Deny} | ${member.user.username} não possui toda essa quantia para te pagar.`)

        return message.channel.send(`${e.MoneyWings} | ${member}, você está sendo cobrado por ${message.author} para pagar a quantia de **${Quantia} ${Moeda(message)}**.\n${e.QuestionMark} | Prosseguir com o pagamento?`).then(msg => {
            msg.react('✅').catch(() => { })
            msg.react('❌').catch(() => { })

            const FilterPayment = (reaction, u) => { return reaction.emoji.name === '✅' && u.id === member.id; };
            const CollectorPayment = msg.createReactionCollector({ filter: FilterPayment, time: 15000 });

            const FilterDenied = (reaction, u) => { return reaction.emoji.name === '❌' && u.id === member.id; };
            const CollectorDenied = msg.createReactionCollector({ filter: FilterDenied, time: 15000 });

            CollectorPayment.on('collect', (reaction, user) => {
                if (user.id === client.user.id) return
                if (sdb.get(`Users.${user.id}.Balance`) < Quantia) return BankSubtract(msg)
                if (sdb.get(`Users.${user.id}.Balance`) >= Quantia) return PayStart(msg)
            });

            CollectorPayment.on('end', collected => {
                if (collected.size === 0) {
                    msg.edit(`${e.Deny} | Tempo expirado.`).catch(() => { })
                }
            });

            CollectorDenied.on('collect', (reaction, user) => {
                if (user.id === client.user.id) return
                Recusou(msg)
            });

        }).catch(err => {
            Error(message, err)
            message.channel.send(`${e.Deny} | Houve um erro ao executar o comando de cobrança.\n\`${err}\``)
        })

        function PayStart(msg) {
            sdb.subtract(`Users.${member.id}.Balance`, Quantia)
            sdb.add(`Users.${message.author.id}.Balance`, Quantia)
            TransactionsPush(
                member.id,
                message.author.id,
                `💸 Pagou a cobrança de ${Quantia || 0} Moedas a ${message.author.tag}`,
                `💰 Recebeu a cobrança de ${Quantia || 0} Moedas feita a ${member.user.tag}`
            )
            msg.edit(`${e.Check} | ${member} pagou a quantia de **${Quantia} ${Moeda(message)}** cobrada por ${message.author}\n${e.PandaProfit} Stats\n${member.user.username} -${Quantia} ${Moeda(message)}\n${message.author.username} +${Quantia} ${Moeda(message)}`).catch(err => {
                message.channel.send(`${e.Check} | ${member} pagou a quantia de **${Quantia} ${Moeda(message)}** cobrada por ${message.author}\n${e.PandaProfit} Stats\n${member.user.username} -${Quantia} ${Moeda(message)}\n${message.author.username} +${Quantia} ${Moeda(message)}`).catch(() => { })
            })
        }

        function Recusou(msg) {
            msg.delete().catch(() => { })
            message.channel.send(`${e.Deny} | ${member} se recusou a pagar a quantia cobrada por ${message.author}`)
        }

        function BankSubtract(x) {
            x.delete().catch(() => { })
            message.channel.send(`${e.QuestionMark} | ${member}, o dinheiro que você possui na carteira não é o suficiente. Deseja retirar **${(Quantia - sdb.get(`Users.${member.id}.Balance`))} ${Moeda(message)}** do banco para efetuar o pagamento?`).then(msg => {
                msg.react('✅').catch(() => { }) // Check
                msg.react('❌').catch(() => { }) // X

                const filter = (reaction, user) => { return ['✅', '❌'].includes(reaction.emoji.name) && user.id === member.id }

                msg.awaitReactions({ filter, max: 1, time: 15000, errors: ['time'] }).then(collected => {
                    const reaction = collected.first()

                    if (reaction.emoji.name === '✅') {
                        sdb.subtract(`Users.${member.id}.Bank`, (Quantia - sdb.get(`Users.${member.id}.Balance`)))
                        sdb.add(`Users.${member.id}.Balance`, (Quantia - sdb.get(`Users.${member.id}.Balance`)))
                        PayStart(msg)

                    } else {
                        Recusou(msg)
                    }
                }).catch(() => {
                    msg.edit(`${e.Deny} | Tempo expirado.`).catch(() => { })
                })

            }).catch(err => {
                Error(message, err)
                message.channel.send(`${e.Deny} | Houve um erro ao executar o comando de cobrança.\n\`${err}\``)
            })
        }
    }
}
