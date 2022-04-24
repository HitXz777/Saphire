const { e } = require('../../../JSON/emojis.json'),
    Colors = require('../../../modules/functions/plugins/colors'),
    Moeda = require("../../../modules/functions/public/moeda")

module.exports = {
    name: 'roleta',
    aliases: ['rol', 'roletar', 'r'],
    category: 'economy',
    ClientPermissions: ['ADD_REACTIONS'],
    emoji: '🎟️',
    usage: '<rol> [quantia/all]',
    description: 'Roleta é um jogo que te faz enlouquecer',

    run: async (client, message, args, prefix, MessageEmbed, Database) => {

        let userData = await Database.User.findOne({ id: message.author.id }, 'Balance Timeouts.Roleta'),
            color = await Colors(message.author.id),
            moeda = await Moeda(message)

        if (['info', 'help', 'ajuda'].includes(args[0]?.toLowerCase()) || !args[0]) return message.reply({
            embeds: [
                new MessageEmbed()
                    .setColor(color)
                    .setTitle(`🎟️ Roleta ${client.user.username}`)
                    .setDescription(`Seja muito bem vindo a Roleta ${client.user.username}!\n \n${e.Info} **O que é a Roleta ${client.user.username}?**\n- A Roleta é um simples jogo onde você ganha ou perde dinheiro.\n \nA Roleta consiste em uma variavel de sorte, onde depende de um resultado aleatório para você ganhar.`)
                    .addField(`${e.SaphireObs} Como jogar`, `Digite \`${prefix}roleta <Valor>\` ou \`${prefix}roleta all\` para jogar todo seu dinheiro.\nProntinho, é só isso.`)
                    .addField(`${e.Info} Informações adicionais`, '**1.** Todo o dinheiro perdido não vai a lugar nenhum\n**2.** O resultado de vitória é de 20%, derrota é de 40% e empate 40%\n**3. Resultado**\nVitória: Recebe de **0 a 35%** do valor apostado\nEmpate: Recebe de volta o dinheiro apostado\nDerrota: O dinheiro apostado sumirá para sempre.')
                    .setFooter(`A ${client.user.username} não se responsabiliza por dinheiro perdido.`)
            ]
        })

        if (client.Timeout(1200000, userData.Timeouts?.Roleta))
            return message.channel.send(`${e.Loading} | ${message.author}, as roletas estão voltando ao lugar, volte em: \`${client.GetTimeout(1200000, userData.Timeouts?.Roleta)}\``)

        let valor = parseInt(args[0].replace(/k/g, '000')),
            money = userData?.Balance || 0

        if (['all', 'tudo'].includes(args[0]?.toLowerCase()))
            return confirmValueAll()

        if (!/^[0-9]+$/i.test(valor))
            return message.reply(`${e.Deny} | Diga apenas números! Nada de tentar burlar o sistema, ok?`)

        if (valor > money)
            return message.reply(`${e.Deny} | Você não tem todo esse dinheiro na conta.`)

        if (valor <= 0)
            return message.reply(`${e.Deny} | Você tem que apostar algúm valor maior que 1 ${moeda}, baaaka!`)

        StartNewRol(valor)

        async function confirmValueAll() {

            if (money <= 0)
                return message.reply(`${e.Deny} | Você não tem dinheiro para jogar.`)

            Database.SetTimeout(message.author.id, 'Timeouts.Roleta')

            let msg = await message.reply(`${e.QuestionMark} | Você confirma apostar todo o seu dinheiro no valor de **${money || 0} ${moeda}**?`),
                emojis = ['✅', '❌'],
                validate = false

            for (let i of emojis) msg.react(i).catch(() => { })

            const collector = msg.createReactionCollector({
                filter: (reaction, user) => emojis.includes(reaction.emoji.name) && user.id === message.author.id,
                time: 30000,
                errors: ['time']
            })

            collector.on('collect', (reaction) => {

                if (reaction.emoji.name === '✅') {

                    msg.delete().catch(() => { })
                    StartNewRol(money)
                    validate = true
                    return collector.stop()

                } else {

                    Database.delete(message.author.id, 'Timeouts.Roleta')
                    return msg.edit(`${e.Deny} | Comando cancelado.`).catch(() => { })
                }

            })

            collector.on('end', () => {

                if (validate) return

                Database.delete(message.author.id, 'Timeouts.Roleta')
                return msg.edit(`${e.Deny} | Comando cancelado.`).catch(() => { })

            })
            return
        }

        async function StartNewRol(value) {

            Database.subtract(message.author.id, value)
            Database.SetTimeout(message.author.id, 'Timeouts.Roleta')

            const msg = await message.channel.send(`${e.Loading} | ${message.author} iniciou um jogo na roleta no valor de **${value?.toFixed(0)} ${moeda}**...`)

            let result = Math.floor(Math.random() * 100)
            setTimeout(() => {

                if (result <= 20) return AddMoneyVictory(value, msg)
                if (result > 60) return GiveBackMoneyDraw(value, msg)
                return SubtractMoneyLose(value, msg)

            }, 4000)

        }

        function AddMoneyVictory(prize, msg) {

            let prizeControl = Math.floor(Math.random() * parseInt(prize * 0.35))

            let taxa = Math.round(prizeControl * 0.05),
                taxaValidate

            if (prizeControl >= 1000) {
                prizeControl -= taxa
                taxaValidate = `\n${e.Taxa} | *Prêmios maiores que 1000 ${moeda} tem uma taxa de 5% (-${taxa})*`
            }

            Database.add(message.author.id, prizeControl + prize)

            Database.PushTransaction(
                message.author.id,
                `${e.gain} Recebeu ${prizeControl || 0} Safiras jogando na roleta`
            )

            return msg.edit(`${e.Tada} | **GANHOU!** | ${message.author} jogou **${prize} ${moeda}** na roleta e obteve o lucro de **${prizeControl?.toFixed(0)} ${moeda}**.${taxaValidate || ''}`).catch(() => { })
        }

        function SubtractMoneyLose(prize, msg) {

            Database.PushTransaction(
                message.author.id,
                `${e.loss} Perdeu ${prize} Safiras jogando na roleta`
            )

            return msg.edit(`${e.SaphireCry} | **PERDEU!** | ${message.author} jogou na roleta e perdeu **${prize?.toFixed(0)} ${moeda}**.`).catch(() => { })
        }

        function GiveBackMoneyDraw(prize, msg) {
            Database.add(message.author.id, prize)
            Database.delete(message.author.id, 'Timeouts.Roleta')
            return msg.edit(`${e.Nagatoro} | **EMPATE!** | ${message.author} jogou na roleta e empatou. O dinheiro foi retornado e o timeout zerado.`).catch(() => { })
        }
    }
}