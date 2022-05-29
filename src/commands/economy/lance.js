const { e } = require('../../../JSON/emojis.json'),
    Moeda = require('../../../modules/functions/public/moeda'),
    Colors = require('../../../modules/functions/plugins/colors')

module.exports = {
    name: 'lance',
    aliases: ['lançar'],
    category: 'economy',
    ClientPermissions: ['ADD_REACTIONS'],
    emoji: `${e.MoneyWings}`,
    usage: '<lance> <quantia>',
    description: 'Lance dinheiro no chat',

    execute: async (client, message, args, prefix, MessageEmbed, Database) => {

        let authorData = await Database.User.findOne({ id: message.author.id }, 'Balance Cache'),
            money = parseInt(authorData.Balance) || 0,
            UsersLance = [],
            moeda = await Moeda(message),
            color = await Colors(message.author.id)

        if (!args[0]) return message.reply({
            embeds: [
                new MessageEmbed()
                    .setColor(color)
                    .setTitle(`${e.MoneyWings} Comando Lance`)
                    .setDescription(`Você pode lançar ${moeda} no chat para todos tentar pegar.`)
                    .addField(`${e.On} Comandos`, `\`${prefix}lance [quantia]\` Valor mínino: 500 ${moeda}\n\`${prefix}lance resgate\` Resgate o valor que ficou em cache\n\`${prefix}lance all\` Lance todo o dinheiro da carteira e cache`)
            ]
        })

        let quantia = parseInt(args[0].replace(/k/g, '000')),
            lancePrize = 0

        if (['all', 'tudo'].includes(args[0]?.toLowerCase())) {

            if (args[1]) return message.reply(`${e.Deny} | Não use nada além do **${args[0]}**, ok?`)

            if (!money || money < 500) return message.reply(`${e.Deny} | Quantia mínima para lances é de 500 ${moeda}`)

            lancePrize += money
            Database.subtract(message.author.id, money)

            const msg = await message.reply(`${e.QuestionMark} | Você confirma lançar **${money} ${moeda}** no chat?`),
                emojis = ['✅', '❌']

            for (let i of emojis) msg.react(i).catch(() => { })

            return msg.awaitReactions({
                filter: (reaction, user) => emojis.includes(reaction.emoji.name) && user.id === message.author.id,
                max: 1,
                time: 15000,
                errors: ['time']
            }).then(collected => {
                const reaction = collected.first()

                if (reaction.emoji.name === emojis[0]) {
                    UsersLance.push(message.author.id)
                    msg.delete().catch(() => { })
                    return Lance(lancePrize)
                }

                msg.edit(`${e.Deny} | Comando cancelado.`).catch(() => { })
                Database.add(message.author.id, lancePrize)
                return
            }).catch(() => {

                msg.edit(`${e.Deny} | Comando cancelado por tem expirado.`).catch(() => { })
                Database.add(message.author.id, lancePrize)
                return
            })

        }

        if (quantia < 500) return message.reply(`${e.Deny} | Quantia mínima para lances é de 500 ${moeda}`)
        if (isNaN(quantia)) return message.reply(`${e.Deny} | O valor não é um número`)
        if (args[1]) return message.reply(`${e.Deny} | Por favor, use \`${prefix}lance [quantia/all/resgate]\` ou \`${prefix}lance\`, nada além disso, ok?`)
        if ((authorData.Balance || 0) < quantia) return message.reply(`${e.Deny} | Você não tem todo esse dinheiro.`)

        if ((authorData.Balance || 0) >= quantia) {
            lancePrize += quantia
            Database.subtract(message.author.id, quantia)
            UsersLance.push(message.author.id)
            return Lance(lancePrize)
        }

        return message.reply(`${e.Deny} | Você está usando o comando errado... Tenta \`${prefix}lance\``)

        async function Lance(prize) {

            const buttons = {
                type: 1,
                components: [
                    {
                        type: 2,
                        label: 'Finalizar',
                        custom_id: 'finish',
                        style: 'PRIMARY'
                    },
                    {
                        type: 2,
                        label: 'Entrar ao lance',
                        custom_id: 'join',
                        style: 'SUCCESS'
                    },
                    {
                        type: 2,
                        label: 'Sair',
                        custom_id: 'leave',
                        style: 'DANGER'
                    }
                ]
            }

            const msg = await message.channel.send({
                content: `${e.MoneyWings} ${message.author} lançou ${prize} ${moeda} no chat.`,
                components: [buttons]
            })

            Database.PushTransaction(message.author.id, `${e.loss} Lançou ${prize} Safiras no chat`)

            const collector = msg.createMessageComponentCollector({
                filter: () => true,
                time: 120000
            })

            collector.on('collect', (interaction) => {

                interaction.deferUpdate().catch(() => { })

                let customId = interaction.customId
                let user = interaction.user

                if (customId === 'finish' && user.id === message.author.id)
                    return collector.stop()

                if (customId === 'join') {
                    if (UsersLance?.includes(user.id)) return
                    UsersLance.push(user.id)
                    return message.channel.send(`${e.Join} | ${user} entrou no lance.`)
                }

                if (customId === 'leave') {
                    if (!UsersLance.includes(user.id)) return
                    UsersLance.splice(UsersLance.indexOf(user.id), 1)
                    return message.channel.send(`${e.Leave} | ${user}, você saiu do lance.`)

                }

                return

            })

            collector.on('end', () => {
                msg.edit({ content: `${msg.content} | Finalizado.`, components: [] }).catch(() => { })
                Win(prize)
            })

            function Win(prize) {

                if (!UsersLance || UsersLance.length === 0 || UsersLance.length <= 1 && UsersLance.includes(message.author.id)) {

                    Database.add(message.author.id, prize)
                    return message.channel.send(`${e.Deny} | Lance cancelado por falta de participantes (Min: 2 players). Dinheiro retornado a carteira.`)

                }

                return GetWinner(UsersLance)

            }

            async function GetWinner(ArrayUsers) {

                let RandomUser = ArrayUsers[Math.floor(Math.random() * ArrayUsers.length)]
                let winner = await message.guild.members.cache.get(RandomUser)

                if (!winner) return RemoveUserFromArray(ArrayUsers, winner)

                let winnerData = await Database.User.findOne({ id: winner.id }, 'id')

                if (!winnerData) {
                    Database.add(message.author.id, prize)
                    return message.channel.send(`${e.Deny} | Eu não encontrei o usuário ${winner} na minha database. Cancelei o lance e devolvi o dinheiro para o autor do lance. ${message.author}`)
                }

                let taxa = parseInt((prize * 0.05).toFixed(0)),
                    taxaValidate = ''

                if (prize >= 1000) {
                    prize -= taxa
                    taxaValidate = `\n${e.Taxa} | *Prêmios maiores que 1000 ${moeda} tem uma taxa de 5% (-${taxa})*`
                }

                Database.add(winner.id, prize)
                Database.PushTransaction(winner.id, `${e.gain} Recebeu ${prize} Safiras de um lançamento no chat`)
                message.channel.send(`${e.MoneyWings} | ${winner} pegou ${prize} ${moeda} lançadas por ${message.author}.${taxaValidate}`).catch(() => { })
                return msg.edit(`${e.Check} ${message.author} lançou ${prize} ${moeda} no chat. | ${winner} levou este lance.${taxaValidate}`).catch(() => { })

            }

            function RemoveUserFromArray(array, IdToRemove) {

                if (array.length === 0) {
                    Database.add(message.author.id, lancePrize)
                    return message.channel.send(`${e.Deny} | Falha ao sortear o lance. Dinheiro retornado a carteira.`)
                }

                let NewArray = []
                for (const id of array) id !== IdToRemove ? NewArray.push(id) : null

                return GetWinner(NewArray)

            }

        }
    }
}

