const { e } = require('../../../database/emojis.json')
const { f } = require('../../../database/frases.json')
const Colors = require('../../../Routes/functions/colors')
const Moeda = require('../../../Routes/functions/moeda')
const Error = require('../../../Routes/functions/errors')
const { PushTransaction, TransactionsPush } = require('../../../Routes/functions/transctionspush')

module.exports = {
    name: 'duelar',
    aliases: ['duelo', 'x1'],
    category: 'economy',
    ClientPermissions: ['ADD_REACTIONS'],
    emoji: '⚔️',
    usage: '<duelar> <@user/id> <quantia>',
    description: 'Duelo. A mais antiga forma do X1',

    run: async (client, message, args, prefix, db, MessageEmbed, request, sdb) => {

        if (request) return message.reply(`${e.Deny} | ${f.Request}${sdb.get(`Request.${message.author.id}`)}`)

        let user = message.mentions.members.first() || message.mentions.repliedUser || message.guild.members.cache.get(args[0]) || message.guild.members.cache.get(args[1]) || message.guild.members.cache.find(user => user.displayName?.toLowerCase() == args[0]?.toLowerCase() || user.user.username?.toLowerCase() == args[0]?.toLowerCase())

        if (sdb.get(`Users.${message.author.id}.Duelo`))
            return message.reply(`${e.Deny} | Você está com um duelo aberto. Espere o duelo atual fechar.`)

        const NoArgsEmbed = new MessageEmbed()
            .setColor(Colors(message.member))
            .setTitle(`⚔️ Duelo ${client.user.username} Arena`)
            .setDescription(`O Duelo é um dos comandos da Classe Arena, onde você disputa com outros membros do servidor por alguma recompensa.\nCom o Duelo, você aposta uma quantia em ${Moeda(message)}, e o vencedor que tiver mais sorte ganha.`)
            .addField(`${e.SaphireObs} Comando`, `\`${prefix}duelar <@user/id> <quantia>\``)
            .setFooter(`A ${client.user.username} não se responsabiliza por dinheiro perdido.`)

        if (!args[0])
            return message.reply({ embeds: [NoArgsEmbed] })

        if (!user)
            return message.reply(`${e.SaphireObs} | Tenta assim: \`${prefix}duelar <@user/id> <quantia>\``)

        if (sdb.get(`Users.${user.id}.Duelo`))
            return message.reply(`${e.Deny} | ${user.user.username} está com um duelo aberto no momento.`)

        if (user.user.bot) return message.reply(`${e.Deny} | Bots não podem duelar.`)
        if (user.id === client.user.id) return message.reply(`${e.SaphireCry} Eu sou fraquinha e nem sei segurar uma espada`)
        if (user.id === message.author.id) return message.reply(`${e.Deny} | Você não pode duelar com você mesmo.`)
        if (args[2]) return message.reply(`${e.Deny} | Por favor, não use nada além da quantia. Informações adicionais podem atrapalhar o meu processsamento.`)

        let AuthorMoney = sdb.get(`Users.${message.author.id}.Balance`) || 0
        let UserMoney = sdb.get(`Users.${user.id}.Balance`) || 0

        let Valor = parseInt(args[1]?.replace(/k/g, '000'))

        if (['all', 'tudo'].includes(args[1]?.toLowerCase())) Valor = ValueAll()
        if (!Valor) return message.reply(`${e.Deny} | O comando não está certo não... Tenta assim: \`${prefix}duelar <@user/id> <valor>\``)
        if (isNaN(Valor)) return message.reply(`${e.Deny} | **${Valor}** | Não é um número! Siga o formato correto, por favor. \`${prefix}duelar @user quantia\``)

        if (AuthorMoney <= 0) return message.reply(`${e.Deny} | Você não pode duelar sem dinheiro na carteira.`)
        if (AuthorMoney < Valor) return message.reply(`${e.Deny} | Você não tem **${Valor}** ${Moeda(message)} na carteira. Duele com o valor desejado sacando mais \`${prefix}sacar ${(Valor - AuthorMoney)}\` ${Moeda(message)}`)
        if (Valor > ((sdb.get(`Users.${user.id}.Balance`) || 0) + (sdb.get(`Users.${user.id}.Bank`) || 0))) return message.reply(`${e.Deny} | ${user.user.username} não possui todo esse dinheiro.`)

        sdb.subtract(`Users.${message.author.id}.Balance`, Valor)
        sdb.add(`Users.${message.author.id}.Cache.Duelo`, parseInt(Valor))
        sdb.set(`Users.${message.author.id}.Duelo`, true)

        return message.channel.send(`${e.Loading} | ${user}, você está sendo desafiado para um duelo.\nDesafiante: ${message.author}\nValor: ${Valor} ${Moeda(message)}`).then(msg => {
            msg.react('⚔️').catch(() => { })
            msg.react('❌').catch(() => { })

            const FilterInit = (reaction, u) => { return reaction.emoji.name === '⚔️' && u.id === user.id; }
            const CollectorInit = msg.createReactionCollector({ filter: FilterInit, time: 30000, errors: ['time'] })

            const FilterCancel = (reaction, u) => { return reaction.emoji.name === '❌' && (u.id === message.author.id || u.id === user.id) }
            const CollectorCancel = msg.createReactionCollector({ filter: FilterCancel, time: 30000, errors: ['time'] })

            CollectorInit.on('collect', (reaction, u) => {
                if (UserMoney < Valor)
                    return Withdraw(msg)

                sdb.subtract(`Users.${user.id}.Balance`, Valor)
                sdb.add(`Users.${message.author.id}.Cache.Duelo`, parseInt(Valor))
                sdb.set(`Users.${user.id}.Duelo`, true)
                DuelStart(msg)
            })

            CollectorCancel.on('collect', (reaction, u) => {
                if (u.id === client.user.id) return
                sdb.set(`Users.${user.id}.Duelo`, false)
                sdb.set(`Users.${message.author.id}.Duelo`, false)
                CollectorInit.stop()
                CollectorCancel.stop()
            })

            CollectorCancel.on('end', collected => {
                if (sdb.get(`Users.${user.id}.Duelo`))
                    return
                sdb.add(`Users.${message.author.id}.Balance`, sdb.get(`Users.${message.author.id}.Cache.Duelo`))
                sdb.set(`Users.${message.author.id}.Cache.Duelo`, 0)
                sdb.set(`Users.${message.author.id}.Duelo`, false)
                sdb.set(`Users.${user.id}.Duelo`, false)
                msg.edit(`${e.Deny} | Duelo cancelado.`).catch(() => { })
            })

        }).catch(err => {
            Error(message, err)
            message.channel.send(`${e.SaphireCry} | Ocorreu um erro durante o processo. Por favor, reporte o ocorrido usando \`${prefix}bug\`\n\`${err}\``)
        })

        function DuelStart(msg) {
            msg.delete(() => { })
            let DuelUsers, Winner, Loser
            message.channel.send(`${message.author} ${e.FightKirby} ${user} ~~ ${sdb.get(`Users.${message.author.id}.Cache.Duelo`).toFixed(0)} ${Moeda(message)}`).then(msg => {
                setTimeout(() => {
                    sdb.set(`Users.${message.author.id}.Duelo`, false)
                    sdb.set(`Users.${user.id}.Duelo`, false)
                    DuelUsers = [message.member, user]
                    Winner = DuelUsers[Math.floor(Math.random() * DuelUsers.length)]
                    Winner.id === message.author.id ? Loser = user : Loser = message.member

                    try {
                        NewWinner(Winner, Loser, msg)
                    } catch (err) { Error(message, err) }
                }, 4000)

            }).catch(() => {
                Error(message, err)
                message.channel.send(`${e.SaphireCry} | Ocorreu um erro durante o processo. Por favor, reporte o ocorrido usando \`${prefix}bug\`\n\`${err}\``)
            })
        }

        function NewWinner(Winner, Loser, msg) {
            let Prize = sdb.get(`Users.${message.author.id}.Cache.Duelo`).toFixed(0)
            sdb.add(`Users.${Winner.id}.Balance`, sdb.get(`Users.${message.author.id}.Cache.Duelo`))
            if (Winner.id !== message.author.id) {
                TransactionsPush(
                    Winner.id,
                    message.author.id,
                    `${e.BagMoney} Recebeu ${sdb.get(`Users.${message.author.id}.Cache.Duelo`) / 2} em um duelo contra ${message.author.tag}`,
                    `${e.MoneyWithWings} Perdeu ${sdb.get(`Users.${message.author.id}.Cache.Duelo`) / 2} em um duelo contra ${Winner.user.tag}`
                )
            } else {
                let M = (sdb.get(`Users.${message.author.id}.Cache.Duelo`) || 0) / 2
                TransactionsPush(
                    user.user.id,
                    message.author.id,
                    `${e.MoneyWithWings} Perdeu ${M} em um duelo contra ${message.author.tag}`,
                    `${e.BagMoney} Recebeu ${sdb.get(`Users.${message.author.id}.Cache.Duelo`) / 2} em um duelo contra ${user.user.tag}`
                )
            }
            sdb.delete(`Users.${message.author.id}.Cache.Duelo`)
            return msg.edit(`${e.OwnerCrow} | ${Winner} ganhou o duelo contra ${Loser}\n${e.PandaProfit} | ${Winner.user.username} teve o retorno de **${Prize} ${Moeda(message)}** com um lucro de **${Prize / 2} ${Moeda(message)}**\n*${Loser.user.username} perdeu o dinheiro no duelo.*`).catch(() => { })
        }

        function Withdraw(msg) {

            message.reply(`${e.QuestionMark} | Você não tem o dinheiro do duelo na carteira. Quer retirar mais **${Valor - UserMoney} ${Moeda(message)}** do banco pra completar o valor?`).then(Msg => {
                sdb.set(`Request.${user.id}`, `${Msg.url}`)
                Msg.react('✅').catch(() => { }) // Check
                Msg.react('❌').catch(() => { }) // X

                const WithdrawFilter = (reaction, u) => { return ['✅', '❌'].includes(reaction.emoji.name) && u.id === user.id }

                Msg.awaitReactions({ filter: WithdrawFilter, max: 1, time: 15000, errors: ['time'] }).then(collected => {
                    const reaction = collected.first()

                    if (reaction.emoji.name === '✅') {
                        sdb.delete(`Request.${user.id}`)
                        sdb.subtract(`Users.${user.id}.Bank`, (Valor - UserMoney))
                        sdb.subtract(`Users.${user.id}.Balance`, UserMoney)
                        sdb.add(`Users.${message.author.id}.Cache.Duelo`, parseInt(Valor))
                        sdb.set(`Users.${user.id}.Duelo`, true)
                        Msg.delete().catch(() => { })
                        DuelStart(msg)
                    } else {
                        sdb.delete(`Request.${user.id}`)
                        sdb.add(`Users.${message.author.id}.Balance`, sdb.get(`Users.${message.author.id}.Cache.Duelo`))
                        sdb.set(`Users.${message.author.id}.Cache.Duelo`, 0)
                        sdb.set(`Users.${message.author.id}.Duelo`, false)
                        sdb.set(`Users.${user.id}.Duelo`, false)
                        Msg.edit(`${e.Deny} | Duelo cancelado.`).catch(() => { })
                    }
                }).catch(() => {
                    sdb.delete(`Request.${user.id}`)
                    sdb.add(`Users.${message.author.id}.Balance`, sdb.get(`Users.${message.author.id}.Cache.Duelo`))
                    sdb.set(`Users.${message.author.id}.Cache.Duelo`, 0)
                    sdb.set(`Users.${message.author.id}.Duelo`, false)
                    sdb.set(`Users.${user.id}.Duelo`, false)
                    Msg.edit(`${e.Deny} | Duelo cancelado por tempo expirado.`).catch(() => { })
                })
            })
        }

        function ValueAll() {
            let All = parseInt(sdb.get(`Users.${message.author.id}.Cache.Resgate`))

            if (All > 0) {

                sdb.add(`Users.${message.author.id}.Balance`, All)
                sdb.delete(`Users.${message.author.id}.Cache.Resgate`)
                
            }

            return sdb.get(`Users.${message.author.id}.Balance`)
        }

    }
}