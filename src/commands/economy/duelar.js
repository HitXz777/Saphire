const { e } = require('../../../JSON/emojis.json'),
    Colors = require('../../../modules/functions/plugins/colors'),
    Moeda = require('../../../modules/functions/public/moeda')

module.exports = {
    name: 'duelar',
    aliases: ['duelo', 'x1'],
    category: 'economy',
    ClientPermissions: ['ADD_REACTIONS'],
    emoji: '⚔️',
    usage: '<duelar> <@user/id> <quantia>',
    description: 'Duelo. A mais antiga forma do X1',

    run: async (client, message, args, prefix, MessageEmbed, Database) => {

        let user = message.mentions.members.first() || message.mentions.repliedUser || message.guild.members.cache.get(args[0]) || message.guild.members.cache.get(args[1]) || message.guild.members.cache.find(user => user.displayName?.toLowerCase() == args[0]?.toLowerCase() || user.user.username?.toLowerCase() == args[0]?.toLowerCase()),
            moeda = await Moeda(message),
            authorData = await Database.User.findOne({ id: message.author.id }, 'Balance'),
            color = await Colors(message.author.id),
            NoArgsEmbed = new MessageEmbed()
                .setColor(color)
                .setTitle(`⚔️ Duelo ${client.user.username} Arena`)
                .setDescription(`O Duelo é um dos comandos da Classe Arena, onde você disputa com outros membros do servidor por alguma recompensa.\nCom o Duelo, você aposta uma quantia em ${moeda}, e o vencedor que tiver mais sorte ganha.`)
                .addField(`${e.SaphireObs} Comando`, `\`${prefix}duelar <@user/id> <quantia>\``)
                .setFooter({ text: `A ${client.user.username} não se responsabiliza por dinheiro perdido.` })

        if (!args[0]) return message.reply({ embeds: [NoArgsEmbed] })

        if (!user) return message.reply(`${e.SaphireObs} | Tenta assim: \`${prefix}duelar <@user/id> <quantia>\``)

        if (user.user.bot) return message.reply(`${e.Deny} | Bots não podem duelar.`)
        if (user.id === client.user.id) return message.reply(`${e.SaphireCry} Eu sou fraquinha e nem sei segurar uma espada`)
        if (user.id === message.author.id) return message.reply(`${e.Deny} | Você não pode duelar com você mesmo.`)

        if (args[2]) return message.reply(`${e.Deny} | Por favor, não use nada além da quantia. Informações adicionais podem atrapalhar o meu processsamento.`)

        let userData = await Database.User.findOne({ id: user?.id }, 'Balance')

        if (!userData) return message.reply(`${e.Database} | DATABASE | O usuário mencionado \`${user.user.tag}\` não foi encontrado.`)

        let AuthorMoney = authorData.Balance || 0,
            UserMoney = userData.Balance || 0,
            Valor = parseInt(args[1]?.replace(/k/g, '000'))

        if (['all', 'tudo'].includes(args[1]?.toLowerCase())) Valor = AuthorMoney
        if (!Valor) return message.reply(`${e.Deny} | O comando não está certo não... Tenta assim: \`${prefix}duelar <@user/id> <valor>\``)
        if (isNaN(Valor)) return message.reply(`${e.Deny} | **${Valor}** | Não é um número! Siga o formato correto, por favor. \`${prefix}duelar @user quantia\``)

        if (Valor < 1) return message.reply(`${e.Deny} | O valor do duelo deve ser uma quantia maior que 1 ${moeda}`)
        if (AuthorMoney < 1) return message.reply(`${e.Deny} | Você não pode duelar sem dinheiro na carteira.`)
        if (UserMoney < 1) return message.reply(`${e.Deny} | ${user} não possui nenhum dinheiro.`)
        if (AuthorMoney < Valor) return message.reply(`${e.Deny} | Você não tem tudo isso na carteira. Duele com o valor desejado sacando mais \`${prefix}sacar ${Valor - AuthorMoney}\` ${moeda}`)
        if (Valor > UserMoney) return message.reply(`${e.Deny} | ${user.user.username} não possui todo esse dinheiro.`)

        let DueloPrize = 0

        Database.subtract(message.author.id, Valor)
        DueloPrize += Valor

        let msg = await message.channel.send(`${e.Loading} | ${user}, você está sendo desafiado para um duelo.\nDesafiante: ${message.author}\nValor: ${Valor} ${moeda}`),
            emojis = ['⚔️', '❌'],
            validate = false

        for (let i of emojis) msg.react(i).catch(() => { })

        const collector = msg.createReactionCollector({
            filter: (reaction, u) => emojis.includes(reaction.emoji.name) && message.author.id === u.id || user.id === u.id,
            time: 30000,
            errors: ['time']
        })

        collector.on('collect', (reaction, User) => {

            if (reaction.emoji.name === emojis[1])
                return collector.stop()

            validate = true
            if (User.id === user.id) {
                Database.subtract(user.id, Valor)
                DueloPrize += Valor
                return DuelStart(msg)
            }
            return
        })

        collector.on('end', () => {

            if (validate) return

            Database.add(message.author.id, DueloPrize)
            return msg.edit(`${e.Deny} | Duelo cancelado.`).catch(() => { })
        })

        async function DuelStart(msg) {

            msg.delete(() => { })

            let DuelUsers, Winner, Loser

            const Msg = await message.channel.send(`${message.author} ${e.FightKirby} ${user} ~~ ${DueloPrize.toFixed(0)} ${moeda}`)

            setTimeout(() => {
                DuelUsers = [user, message.member]
                Winner = DuelUsers[Math.floor(Math.random() * DuelUsers.length)]
                Loser = Winner.id === message.author.id ? user : message.member

                return NewWinner(Winner, Loser, Msg)
            }, 4000)

            return
        }

        function NewWinner(Winner, Loser, Msg) {

            let Prize = DueloPrize.toFixed(0)

            Database.add(Winner.id, Prize)

            if (Winner.id !== message.author.id) {
                Database.PushTransaction(Winner.id, `${e.gain} Recebeu ${Prize / 2} Safiras em um duelo contra ${message.author.tag}`)
                Database.PushTransaction(message.author.id, `${e.loss} Perdeu ${Prize / 2} Safiras em um duelo contra ${message.author.tag}`)

            } else {
                Database.PushTransaction(message.author.id, `${e.gain} Recebeu ${Prize / 2} Safiras em um duelo contra ${message.author.tag}`)
                Database.PushTransaction(user.user.id, `${e.loss} Perdeu ${Prize / 2} Safiras em um duelo contra ${message.author.tag}`)
            }
            return Msg.edit(`${e.OwnerCrow} | ${Winner} ganhou o duelo contra ${Loser}\n${e.PandaProfit} | ${Winner.user.username} teve o retorno de **${Prize} ${moeda}** com um lucro de **${Prize / 2} ${moeda}**\n*${Loser.user.username} perdeu o dinheiro no duelo.*`).catch(() => { })
        }
    }
}