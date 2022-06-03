const { e } = require('../../../JSON/emojis.json'),
    Moeda = require('../../../modules/functions/public/moeda')

module.exports = {
    name: 'pay',
    aliases: ['pagar', 'transferir', 'pix'],
    category: 'economy',
    ClientPermissions: ['ADD_REACTIONS'],
    emoji: `${e.MoneyWings}`,
    usage: '<pay> <user/id> <quantia>',
    description: 'Faça um pagamento rápido!',

    execute: async (client, message, args, prefix, MessageEmbed, Database) => {

        if (['info', 'help', 'ajuda'].includes(args[0]?.toLowerCase())) return InfoPay()

        let moeda = await Moeda(message),
            user = client.getUser(client, message, args, 'user')

        if (!user) return message.reply(`${e.MoneyWings} | Transfira dinheiro rápido e fácil! É assim olha: \`${prefix}pay <@user/id> <quantia>\``)
        if (user.id === client.user.id) return message.reply(`${e.HiNagatoro} | Preciso não coisa fofa, eu já sou rica.`)
        if (user.id === message.author.id) return message.reply(`${e.Deny} | Nada de pagar você mesmo.`)
        if (user.bot) return message.reply(`${e.Deny} | Nada de bots.`)

        let authorData = await Database.User.findOne({ id: message.author.id }, 'Balance'),
            userData = await Database.User.findOne({ id: user.id }, 'id')

        if (!userData) return message.reply(`${e.Database} | DATABASE | O usuário **${user} \`${user.id}\`** não se encontra no meu banco de dados. Diga para ele/a mandar uma mensageem no chat que eu registro rapidinho!`)

        let money = authorData.Balance || 0
        if (money <= 0) return message.reply(`${e.Deny} | Você não possui dinheiro para efetuar pagamentos.`)

        let quantia = parseInt(args[1]?.replace(/k/g, '000')) || parseInt(args[0]?.replace(/k/g, '000'))

        if (['all', 'tudo'].includes(args[0]?.toLowerCase()) || ['all', 'tudo'].includes(args[1]?.toLowerCase())) quantia = money || 0
        if (!quantia || isNaN(quantia)) return message.reply(`${e.Deny} | Só faltou dizer o valor do pagamento em números...`)
        if (quantia > money) return message.reply(`${e.Deny} | Você não tem todo esse dinheiro...`)
        if (quantia <= 0) return message.reply(`${e.Deny} | Você não pode pagar alguém com menos de 1 ${moeda}, baaaaka.`)

        let payCache = quantia
        Database.subtract(message.author.id, quantia)

        let msg = await message.reply(`${e.Loading} | Transferir **${payCache} ${moeda}** de ${message.author} para ${user}?${quantia >= 1000 ? `\n> *${e.Taxa} Pagamentos acima de 1000 ${moeda} sofrem uma taxa de 5%.*` : ''}\n \n> **ATENÇÃO:** A Saphire e sua equipe não irá se responsabilizar por *${moeda}* perdidas. Pense bem para quem você manda seu dinheiro. Dinheiro perdido não será devolvido.\n> *obs: Os dois lados devem confirmar o pagamento.*`),
            emojis = ['✅', '❌'], control = [], validate = false

        for (let i of emojis) msg.react(i).catch(() => { })

        const collector = msg.createReactionCollector({
            filter: (reaction, u) => emojis.includes(reaction.emoji.name) && [message.author.id, user.id].includes(u.id),
            idle: 60000
        })

        collector.on('collect', (reaction, u) => {

            if (reaction.emoji.name === emojis[1]) return collector.stop()

            if (reaction.emoji.name === emojis[0] && !control.includes(u.id))
                control.push(u.id)

            if (control.includes(user.id) && control.includes(message.author.id))
                return paymentStart()

            return

        })

        collector.on('end', () => {

            if (validate) return

            Database.add(message.author.id, payCache)
            return msg.edit(`${e.Deny} | Pagamento cancelado.`).catch(() => { })

        })

        function paymentStart() {

            validate = true

            let taxa = parseInt((payCache * 0.05).toFixed(0)),
                taxaValidate

            if (payCache >= 1000) {
                payCache -= taxa
                taxaValidate = `\n${e.Taxa} | *Pagamentos maiores que 1000 ${moeda} tem uma taxa de 5% (-${taxa})*`
            }

            Database.PushTransaction(user.id, `${e.gain} Recebeu ${payCache} Safiras de ${message.author.tag} em um pagamento`)
            Database.PushTransaction(message.author.id, `${e.loss} Enviou ${payCache} Safiras para ${client.users.cache.get(user.id)?.tag} em um pagamento`)
            Database.add(user.id, payCache)
            return msg.edit(`${e.Check} | ${message.author} -> ${user} | Pagamento efetuado com sucesso!${taxaValidate || ''}`)
        }

        function InfoPay() {
            return message.reply({
                embeds: [
                    new MessageEmbed()
                        .setColor(client.blue)
                        .setTitle(`${e.MoneyWithWings} ${client.user.username} Pagamentos`)
                        .setDescription(`${e.SaphireObs} Com o comando \`${prefix}pay\`, você pode transferir dinheiro para qualquer pessoa.`)
                        .addField(`${e.Gear} Comando`, `\`${prefix}pay <@user/Id> <quantia>\``)
                        .setFooter({ text: `obs: Pagamentos acima de 1000 safiras terá uma taxa de 2%` })
                ]
            })
        }
    }
}