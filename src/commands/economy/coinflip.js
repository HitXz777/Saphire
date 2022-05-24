const { e } = require('../../../JSON/emojis.json'),
    Moeda = require('../../../modules/functions/public/moeda')

module.exports = {
    name: 'coinflip',
    aliases: ['caracoroa', 'caraoucoroa', 'cfp', 'cf'],
    category: 'economy',
    emoji: `${e.Coin}`,
    usage: '<coinflip> <@user> <quantia>',
    description: 'Cara ou coroa?',

    execute: async (client, message, args, prefix, MessageEmbed, Database) => {

        let member = client.getUser(client, message, args, 'member'),
            moeda = await Moeda(message)

        if (!args[0] || ['help', 'ajuda', 'info'].includes(args[0]?.toLowerCase())) return coinflipInfo()

        if (Database.Cache.get(`Raspadinhas.Users.${message.author.id}`))
            return message.reply(`${e.Deny} | Você já tem um coinflip aberto. Calma, calma. É apenas um por vez.`)

        if (!args[1] && !member)
            return message.reply(`${e.Deny} | Eu procurei em todos os lugares e não achei nenhum membro para efetuar a aposta 😔`)

        if (!member)
            return message.reply(`${e.Deny} | Você precisa me dizer um usuário com quem você deseja efetuar a aposta. Tenta assim: \`${prefix}coinflip @user <quantia>\`, ou só diga \`${prefix}coinflip <quantia>\` respondendo a mensagem de alguém.`)

        let data = {}

        data.author = await Database.User.findOne({ id: message.author.id }, 'Balance')
        data.member = await Database.User.findOne({ id: member.id }, 'Balance')

        if (!data.member)
            return message.reply(`${e.Deny} | ${member.displayName} não possui nenhum dado no meu banco de dados. Você pode pedir para ele mandar uma mensagem no chat? Assim eu posso efetuar cadastro.`)

        let amount = parseInt(args[args.length - 1]?.replace(/k/g, '000'))?.toFixed(0)
        if (['all', 'tudo'].includes(args[args.length - 1]?.toLowerCase())) amount = data?.author?.Balance || 0
        if (['half', 'metade'].includes(args[args.length - 1]?.toLowerCase())) amount = parseInt(data?.author?.Balance / 2).toFixed(0) || 0

        if (!amount || isNaN(amount))
            return message.reply(`${e.Deny} | O valor da aposta deve ser um número, não acha? \`${prefix}coinflip @user quantia\``)

        if (!data.author?.Balance || data.author?.Balance <= 0)
            return message.reply(`${e.Deny} | Poxa... Você não tem dinheiro algum...`)

        if (amount > (data.author?.Balance || 0))
            return message.reply(`${e.Deny} | Você não tem toda essa quantia.`)

        if (amount > (data.member?.Balance || 0))
            return message.reply(`${e.Deny} | ${member.displayName} não possui todo esse dinheiro.`)

        let buttons = [{
            type: 1,
            components: [
                {
                    type: 2,
                    label: 'CARA',
                    custom_id: 'cara',
                    style: 'PRIMARY'
                },
                {
                    type: 2,
                    label: 'COROA',
                    custom_id: 'coroa',
                    style: 'PRIMARY'
                },
                {
                    type: 2,
                    label: 'RECUSAR',
                    custom_id: 'cancel',
                    style: 'DANGER'
                }
            ]
        }]

        let msg = await message.channel.send({
            content: `${e.dogecoin} | ${member}, você está sendo chamado para uma partida de *cara ou coroa* valendo **${amount} ${moeda}**. Eai, qual é a sua escolha?`,
            components: buttons
        })

        Database.Cache.set(`Raspadinhas.Users.${message.author.id}`, true)

        let collector = msg.createMessageComponentCollector({
            filter: int => [message.author.id, member.id].includes(int.user.id),
            time: 60000,
            max: 1,
            erros: ['max', 'time']
        })
            .on('collect', interaction => {

                let { customId, user } = interaction

                if (customId === 'cancel')
                    return collector.stop()

                data.collected = true

                if (user.id !== member.id) return

                return startCoinflip(customId, amount, msg)

            })
            .on('end', () => {
                if (data.collected) return
                Database.Cache.delete(`Raspadinhas.Users.${message.author.id}`)
                return msg.edit({ content: `${e.Deny} | Aposta cancelada.`, components: [] }).catch(() => { })
            })

        function startCoinflip(customId, amount) {

            Database.Cache.delete(`Raspadinhas.Users.${message.author.id}`)
            data.memberOption = customId
            data.authorOption = customId === 'cara' ? 'coroa' : 'cara'

            msg.edit({
                content: `${member} \`${data.memberOption}\` ${e.dogecoin} \`${data.authorOption}\` ${message.author}`,
                components: []
            }).catch(() => { })

            for (let id of [message.author.id, member.id])
                Database.subtract(id, amount)

            let optionWin = ['cara', 'coroa'][Math.floor(Math.random() * 2)]

            setTimeout(() => {

                let winner = data.authorOption === optionWin ? message.author : member

                let taxa = parseInt((amount * 0.05).toFixed(0)),
                    prize = amount, taxaMessage = ''

                if (amount >= 1000) {
                    prize -= taxa
                    taxaMessage = `\n${e.Taxa} | *Apostas maiores que 1000 ${moeda} tem uma taxa de 5% (-${taxa})*`
                }

                msg.edit({
                    content: `🏆 | \`${optionWin.toUpperCase()}\` | ${winner} ganhou! E com sua vitória, obteve **${prize} ${moeda}**\n${e.Deny} | \`${optionWin.toUpperCase() === 'CARA' ? 'COROA' : 'CARA'}\` | ${winner.id === member.id ? message.author : member}... Então... Você perdeu **${amount} ${moeda}** neste *coinflip*. Boa sorte na próxima, tá?${taxaMessage}`
                }).catch(() => { })

                Database.add(winner.id, prize)
                registerBet(winner.id === message.author.id ? message.author : member.user, winner.id === message.author.id ? member.user : message.author, amount, prize)

            }, 5000)

        }

        function coinflipInfo() {
            return message.reply({
                embeds: [{
                    color: client.blue,
                    title: `${e.dogecoin} ${client.user.username}'s Coinflip`,
                    description: `Use este comando para tirar uma quantia na moeda com um amigo.`,
                    fields: [
                        {
                            name: `${e.Gear} Comando`,
                            value: `\`${prefix}coinflip @user <quantia>\``
                        },
                        {
                            name: '🔍 Internal Machine Search',
                            value: `Este comando é integrado ao Internal Machine Search. O mesmo recurso de pesquisa do comando \`${prefix}userinfo\`. Ou seja, você não precisa literalmente \@marcar a pessoa, basta dizer o nome dela.`
                        }
                    ]
                }]
            })
        }

        function registerBet(Winner, Loser, amount, prize) {
            Database.PushTransaction(Winner.id, `${e.gain} Ganhou ${prize} Safiras em um *coinflip* contra ${Loser.tag}`)
            Database.PushTransaction(Loser.id, `${e.loss} Perdeu ${amount} Safiras em um *coinflip* contra ${Winner.tag}`)
        }

    }
}
