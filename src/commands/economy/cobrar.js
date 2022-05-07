const { e } = require('../../../JSON/emojis.json'),
    Moeda = require('../../../modules/functions/public/moeda')

module.exports = {
    name: 'cobrar',
    aliases: ['mepaga', 'pagueme'],
    category: 'economy',
    ClientPermissions: ['ADD_REACTIONS'],
    emoji: `${e.Coin}`,
    usage: '<cobrar> <@user> <quantia>',
    description: 'Cobre os que te devem',

    run: async (client, message, args, prefix, MessageEmbed, Database) => {

        let member = message.mentions.members.first() || message.mentions.repliedUser || message.guild.members.cache.get(args[0]) || message.guild.members.cache.find(user => user.displayName?.toLowerCase() == args[0]?.toLowerCase() || user.user.username?.toLowerCase() == args[0]?.toLowerCase()) || message.member,
            moeda = await Moeda(message),
            Quantia = parseInt(args[1]?.replace(/k/g, '000'))

        if (!args[0]) return message.reply({
            embeds: [
                new MessageEmbed()
                    .setColor('#246FE0')
                    .setTitle('💸 Sistema de cobrança')
                    .setDescription('Cobre as pessoas que te devem ou apenas peça dinheiro, você que sabe.')
                    .addField('Comando', `\`${prefix}cobrar @user quantia\``)
                    .setFooter({ text: `A ${client.user.username} não se responsabiliza por dinheiro perdido ou mal usado.` })
            ]
        })

        if (!args[1]) Quantia = parseInt(args[0]?.replace(/k/g, '000'))
        if (member.id === message.author.id) return message.reply('Não cobre você mesmo...')
        if (member.id === client.user.id) return message.reply('Sai pra lá, eu não to devendo ninguém.')
        if (!Quantia) return message.reply(`${e.Deny} | E a quantia? Tenta assim: \`${prefix}cobrar @user quantia\``)
        if (isNaN(Quantia)) return message.reply(`${e.Deny} | **${Quantia}** | Não é um número.`).catch(() => { })
        if (parseInt(Quantia) <= 0) return message.reply('Diga um valor maior que 0')

        let memberData = await Database.User.findOne({ id: member.id }, 'Balance')
        if (!memberData) return message.reply(`${e.Database} | DATABASE | Nenhum usuário foi encontrado.`)

        let UserMoney = memberData.Balance || 0
        if (UserMoney < Quantia) return message.reply(`${e.Deny} | ${member.user.username} não possui toda essa quantia para te pagar.`)

        let msg = await message.channel.send(`${e.MoneyWings} | ${member}, você está sendo cobrado por ${message.author} para pagar a quantia de **${Quantia} ${moeda}**.\n${e.QuestionMark} | Prosseguir com o pagamento?`),
            emojis = ['✅', '❌'],
            validate = false

        for (let i of emojis) msg.react(i).catch(() => { })

        const collector = msg.createReactionCollector({
            filter: (reaction, user) => emojis.includes(reaction.emoji.name) && user.id === member.id,
            time: 15000,
            errors: ['time']
        })

        collector.on('collect', (reaction) => {

            if (reaction.emoji.name === emojis[0]) {
                validate = true
                if (UserMoney >= Quantia) return PayStart(msg)
            }

            return collector.stop()

        })

        collector.on('end', () => {
            if (!validate)
                Recusou(msg)

            return
        })

        function PayStart(msg) {
            msg.delete().catch(() => { })
            Database.add(message.author.id, Quantia)
            Database.subtract(member.id, Quantia)
            Database.PushTransaction(member.id, `${e.loss} Pagou a cobrança de ${Quantia || 0} Safiras a ${message.author.tag}`)
            Database.PushTransaction(message.author.id, `${e.gain} Cobrou ${Quantia || 0} Safiras de ${member.user.tag}`)

            return msg.edit(`${e.Check} | ${member} pagou a quantia de **${Quantia} ${moeda}** cobrada por ${message.author}\n${e.PandaProfit} Stats\n${member.user.username} -${Quantia} ${moeda}\n${message.author.username} +${Quantia} ${moeda}`).catch(err => {
                message.channel.send(`${e.Check} | ${member} pagou a quantia de **${Quantia} ${moeda}** cobrada por ${message.author}\n${e.PandaProfit} Stats\n${member.user.username} -${Quantia} ${moeda}\n${message.author.username} +${Quantia} ${moeda}`).catch(() => { })
            })
        }

        function Recusou(msg) {
            return msg.edit(`${e.Deny} | ${member} se recusou a pagar a quantia cobrada por ${message.author}`).catch(() => { })
        }
    }
}