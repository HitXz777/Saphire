const { e } = require('../../../JSON/emojis.json')
const ms = require("parse-ms")
const Moeda = require('../../../modules/functions/public/moeda')

module.exports = {
    name: 'pig',
    aliases: ['porco'],
    category: 'economy',
    ClientPermissions: ['ADD_REACTIONS'],
    emoji: `${e.Pig}`,
    usage: '<pig> [coins/status]',
    description: 'Tente obter toda a grana do porquinho',

    run: async (client, message, args, prefix, MessageEmbed, Database) => {

        let authorData = await Database.User.findOne({ id: message.author.id }, 'Timeouts Balance'),
            clientData = await Database.Client.findOne({ id: client.user.id }, 'Porquinho'),
            porquinho = clientData?.Porquinho,
            PorquinhoMoney = porquinho?.Money || 0,
            LastWinner = porquinho?.LastWinner || 'Ninguém por enquanto',
            LastPrize = porquinho?.LastPrize || 0,
            moeda = await Moeda(message),
            timeOut = authorData?.Timeouts.Porquinho

        if (['coins', 'safiras', 'moedas', 'moeda', 'status'].includes(args[0]?.toLowerCase()))
            return message.reply({
                embeds: [
                    new MessageEmbed()
                        .setColor('#BA49DA')
                        .setTitle(`${e.Pig} Status`)
                        .setDescription(`Tente quebrar o Pig e ganhe todo o dinheiro dele`)
                        .addField('Último ganhador', `${LastWinner}\n${LastPrize}${moeda}`, true)
                        .addField('Montante', `${PorquinhoMoney}${moeda}`, true)

                ]
            })

        if (client.Timeout(30000, timeOut))
            return message.reply(`${e.Deny} | Tente quebrar o ${e.Pig} novamente em: \`${client.GetTimeout(30000, timeOut)}\``)

        let money = authorData?.Balance || 0

        if (money < 1000) return message.reply(`${e.Deny} | Você não possui dinheiro pra apostar no pig. Quantia mínima: 1000 ${moeda}.`)

        await Database.Client.updateOne(
            { id: client.user.id },
            { $inc: { 'Porquinho.Money': 1000 } }
        )

        return Math.floor(Math.random() * 100) === 1
            ? PigBroken()
            : (() => {
                Database.SetTimeout(message.author.id, 'Timeouts.Porquinho')
                Database.subtract(message.author.id, 1000)

                Database.PushTransaction(message.author.id, `${e.loss} Apostou 1000 Safiras no porquinho.`)
                return message.reply(`${e.Deny} | Não foi dessa vez! Veja o status: \`${prefix}pig coins\`\n-1000 ${moeda}!`)
            })()

        async function PigBroken() {
            PorquinhoMoney += 1000
            Database.add(message.author.id, PorquinhoMoney)
            Database.PushTransaction(message.author.id, `${e.gain} Ganhou ${PorquinhoMoney} quebrando o porquinho.`)

            message.reply(`${e.Check} | ${message.author} quebrou o porquinho e conseguiu +${PorquinhoMoney} ${moeda}!`)

            await Database.Client.updateOne(
                { id: client.user.id },
                {
                    Porquinho: {
                        LastPrize: PorquinhoMoney,
                        LastWinner: `${message.author.tag}\n*${message.author.id}*`,
                        Money: 0
                    }
                }
            )

            return
        }

    }
}