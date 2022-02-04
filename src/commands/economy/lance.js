const { e } = require('../../../database/emojis.json')
const { f } = require('../../../database/frases.json')
const Moeda = require('../../../Routes/functions/moeda')
const Error = require('../../../Routes/functions/errors')
const Colors = require('../../../Routes/functions/colors')
const { PushTransaction } = require('../../../Routes/functions/transctionspush')

module.exports = {
    name: 'lance',
    aliases: ['lançar'],
    category: 'economy',
    ClientPermissions: ['ADD_REACTIONS'],
    emoji: `${e.MoneyWings}`,
    usage: '<lance> <quantia>',
    description: 'Lance dinheiro no chat',

    run: async (client, message, args, prefix, db, MessageEmbed, request, sdb) => {

        let cache = parseInt(sdb.get(`Users.${message.author.id}.Cache.Resgate`)) || 0
        let money = parseInt(sdb.get(`Users.${message.author.id}.Balance`)) || 0
        let UsersLance = []

        const Embed = new MessageEmbed()
            .setColor(Colors(message.member))
            .setTitle(`${e.MoneyWings} Comando Lance`)
            .setDescription(`Você pode lançar ${Moeda(message)} no chat para todos tentar pegar.`)
            .addField(`${e.Gear} Emojis`, `✅ Force o sorteio do lance\n💸 Entre e concorra ao lance`)
            .addField(`${e.On} Comandos`, `\`${prefix}lance [quantia]\` Valor mínino: 500 ${Moeda(message)}\n\`${prefix}lance resgate\` Resgate o valor que ficou em cache\n\`${prefix}lance all\` Lance todo o dinheiro da carteira e cache`)

        if (!args[0]) return message.reply({ embeds: [Embed] })

        let quantia = parseInt(args[0].replace(/k/g, '000'))

        if (['all', 'tudo'].includes(args[0]?.toLowerCase())) {
            if (request) return message.reply(`${e.Deny} | ${f.Request}${sdb.get(`Request.${message.author.id}`)}`)
            if (args[1]) return message.reply(`${e.Deny} | Não use nada além do **${args[0]}**, ok?`)

            quantia = money + cache
            if (quantia < 500) return message.reply(`${e.Deny} | Quantia mínima para lances é de 500 ${Moeda(message)}`)
            if (isNaN(quantia)) return message.reply(`${e.Deny} | **${quantia}** | Não é um número`)

            sdb.add(`Users.${message.author.id}.Cache.LancePrize`, quantia)
            sdb.set(`Users.${message.author.id}.Cache.Resgate`, 0)
            sdb.delete(`Users.${message.author.id}.Balance`)

            return message.reply(`${e.QuestionMark} | Você confirma lançar **${quantia} ${Moeda(message)}** no chat?`).then(msg => {
                sdb.set(`Request.${message.author.id}`, `${msg.url}`)
                msg.react('✅').catch(() => { }) // Check
                msg.react('❌').catch(() => { }) // X

                const filter = (reaction, user) => { return ['✅', '❌'].includes(reaction.emoji.name) && user.id === message.author.id }

                msg.awaitReactions({ filter, max: 1, time: 15000, errors: ['time'] }).then(collected => {
                    const reaction = collected.first()

                    if (reaction.emoji.name === '✅') {
                        sdb.delete(`Request.${message.author.id}`)
                        UsersLance.push(message.author.id)
                        return Lance(sdb.get(`Users.${message.author.id}.Cache.LancePrize`))
                    } else {
                        sdb.delete(`Request.${message.author.id}`)
                        msg.edit(`${e.Deny} | Comando cancelado. Dinheiro retornado a carteira.`).catch(() => { })
                        sdb.add(`Users.${message.author.id}.Balance`, sdb.get(`Users.${message.author.id}.Cache.LancePrize`))
                        sdb.delete(`Users.${message.author.id}.Cache.LancePrize`)
                    }
                }).catch(() => {
                    sdb.delete(`Request.${message.author.id}`)
                    msg.edit(`${e.Deny} | Comando cancelado por tem expirado. O dinheiro foi retornado a carteira.`).catch(() => { })
                    sdb.add(`Users.${message.author.id}.Balance`, sdb.get(`Users.${message.author.id}.Cache.LancePrize`))
                    sdb.delete(`Users.${message.author.id}.Cache.LancePrize`)
                })

            }).catch(err => {
                Error(message, err)
                sdb.add(`Users.${message.author.id}.Balance`, sdb.get(`Users.${message.author.id}.Cache.LancePrize`))
                sdb.delete(`Users.${message.author.id}.Cache.LancePrize`)
                message.channel.send(`${e.SaphireCry} | Ocorreu um erro durante o processo. Por favor, reporte o ocorrido usando \`${prefix}bug\`\n\`${err}\``)
            })
        }

        if (quantia < 500) return message.reply(`${e.Deny} | Quantia mínima para lances é de 500 ${Moeda(message)}`)
        if (isNaN(quantia)) return message.reply(`${e.Deny} | O valor não é um número`)
        if (args[1]) return message.reply(`${e.Deny} | Por favor, use \`${prefix}lance [quantia/all/resgate]\` ou \`${prefix}lance\`, nada além disso, ok?`)
        if ((sdb.get(`Users.${message.author.id}.Balance`) || 0) < quantia) return message.reply(`${e.Deny} | Você não tem todo esse dinheiro.`)

        if ((sdb.get(`Users.${message.author.id}.Balance`) || 0) >= quantia) {
            sdb.add(`Users.${message.author.id}.Cache.LancePrize`, quantia)
            sdb.subtract(`Users.${message.author.id}.Balance`, quantia)
            UsersLance.push(message.author.id)
            return Lance(sdb.get(`Users.${message.author.id}.Cache.LancePrize`))
        } else {
            return message.reply(`${e.Deny} | Você está usando o comando errado... Tenta \`${prefix}lance\``)
        }

        function Lance(prize) {

            return message.channel.send(`${e.MoneyWings} ${message.author} lançou ${prize} ${Moeda(message)} no chat.\n✅ Encerrar | 💸 Participar | ❌ Sair`).then(msg => {
                sdb.set(`Request.${message.author.id}`, `${msg.url}`)
                for (const e of ['✅', '💸', '❌']) msg.react(e).catch(() => { })

                PushTransaction(
                    message.author.id,
                    `${e.MoneyWithWings} Lançou ${prize} Moedas no chat`
                )

                const filter = (reaction, user) => { return reaction.emoji.name === '💸' && user.id === user.id; };
                const collector = msg.createReactionCollector({ filter, time: 120000 })

                const FilterLeave = (reaction, user) => { return reaction.emoji.name === '❌' && user.id === user.id; };
                const CollectorLeave = msg.createReactionCollector({ filter: FilterLeave, time: 120000 })

                const cancel = (reaction, user) => { return reaction.emoji.name === '✅' && user.id === message.author.id; };
                const CollectorCancel = msg.createReactionCollector({ filter: cancel, max: 1, time: 120000, errors: 'max' })

                collector.on('collect', (reaction, user) => {
                    if (user.bot) return
                    if (UsersLance?.includes(user.id)) return message.channel.send(`${e.Deny} | ${user}, você já entrou no lance.`)
                    UsersLance.push(user.id)
                    return message.channel.send(`${e.Join} | ${user} entrou no lance.`)
                });

                collector.on('end', () => { Win(prize) });

                CollectorLeave.on('collect', (collected, user) => {
                    if (user.bot) return

                    if (!UsersLance.includes(user.id)) return
                    
                    UsersLance.splice(UsersLance.indexOf(user.id), 1)
                    return message.channel.send(`${e.Leave} | ${user}, você saiu do lance.`)

                })

                CollectorCancel.on('collect', collected => {
                    sdb.delete(`Request.${message.author.id}`)
                    msg.delete().catch(() => {
                        sdb.add(`Users.${message.author.id}.Balance`, sdb.get(`Users.${message.author.id}.Cache.LancePrize`))
                        sdb.delete(`Users.${message.author.id}.Cache.LancePrize`)
                        return message.channel.send(`${e.Deny} | Falha ao forçar o sorteio do lance. Dinheiro retornado a carteira.`)
                    })
                });

                function Win(prize) {

                    if (UsersLance.length <= 1) {

                        msg.delete().catch(() => { })
                        sdb.add(`Users.${message.author.id}.Balance`, prize)
                        sdb.delete(`Users.${message.author.id}.Cache.LancePrize`)
                        return message.channel.send(`${e.Deny} | Lance cancelado por falta de participantes (Min: 2 players). Dinheiro retornado a carteira. `)

                    } else {

                        GetWinner(UsersLance)

                    }

                }

                async function GetWinner(ArrayUsers) {

                    let RandomUser = ArrayUsers[Math.floor(Math.random() * ArrayUsers.length)]
                    let winner = await message.guild.members.cache.get(RandomUser)

                    if (!winner)
                        return RemoveUserFromArray(ArrayUsers, winner)

                    sdb.add(`Users.${winner.id}.Cache.Resgate`, prize)
                    PushTransaction(
                        winner.id,
                        `${e.BagMoney} Recebeu ${prize} Moedas de um lançamento no chat`
                    )
                    sdb.delete(`Users.${message.author.id}.Cache.LancePrize`)
                    message.channel.send(`${e.MoneyWings} | ${winner} pegou o ${prize} ${Moeda(message)} lançado por ${message.author}\n${e.SaphireObs} | ${winner}, você possui ${(sdb.get(`Users.${winner.id}.Cache.Resgate`) || 0)} ${Moeda(message)} no cache. Use \`${prefix}resgate\` para resgatar o prêmio ou \`${prefix}lance again\` para lançar ${sdb.get(`Users.${winner.id}.Cache.Resgate`) || 0} ${Moeda(message)}.`).catch(() => { })
                    return msg.edit(`${e.Check} ${message.author} lançou ${prize} ${Moeda(message)} no chat. | ${winner.id} levou este lance.`).catch(() => { })

                }

                function RemoveUserFromArray(array, IdToRemove) {

                    if (array.length <= 0) {
                        sdb.add(`Users.${message.author.id}.Balance`, sdb.get(`Users.${message.author.id}.Cache.LancePrize`))
                        sdb.delete(`Users.${message.author.id}.Cache.LancePrize`)
                        return message.channel.send(`${e.Deny} | Falha ao sortear o lance. Dinheiro retornado a carteira.`)
                    }

                    let NewArray = []
                    for (const id of array) id !== IdToRemove ? NewArray.push(id) : null

                    return GetWinner(NewArray)

                }

            }).catch(err => {
                sdb.add(`Users.${message.author.id}.Cache.Resgate`, sdb.get(`Users.${message.author.id}.Cache.LancePrize`))
                sdb.set(`Users.${message.author.id}.Cache.LancePrize`, 0)
                Error(message, err)
                return message.channel.send(`${e.Warn} | Aconteceu algo inesperado.\n\`${err}\``)
            })
        }
    }
}

