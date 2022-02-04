const { e } = require('../../../database/emojis.json')
const ms = require("parse-ms")
const Moeda = require('../../../Routes/functions/moeda')
const Vip = require('../../../Routes/functions/vip')
const { PushTransaction } = require('../../../Routes/functions/transctionspush')

module.exports = {
    name: 'trabalhar',
    aliases: ['work'],
    category: 'economy',
    emoji: `${e.Coin}`,
    usage: '<trabalhar>',
    description: 'Trabalhe e ganhe uma quantia em dinheiro',

    run: async (client, message, args, prefix, db, MessageEmbed, request, sdb) => {

        let vip = Vip(`${message.author.id}`)

        let time = ms(66400000 - (Date.now() - sdb.get(`Users.${message.author.id}.Timeouts.Work`)))
        if (sdb.get(`Users.${message.author.id}.Timeouts.Work`) !== null && 66400000 - (Date.now() - sdb.get(`Users.${message.author.id}.Timeouts.Work`)) > 0)
            return message.reply(`${e.Deny} | Você já trabalhou hoje, descance um pouco! Volte em \`${time.hours}h, ${time.minutes}m, e ${time.seconds}s\``)

        let luck = ['win', 'lose', 'lose', 'lose', 'lose']
        let result = luck[Math.floor(Math.random() * luck.length)]
        let gorjeta = parseInt([Math.floor(Math.random() * 1000) + 1])
        let work = parseInt([Math.floor(Math.random() * 500) + 1])
        let xp = parseInt([Math.floor(Math.random() * 200) + 1])
        sdb.set(`Users.${message.author.id}.Timeouts.Work`, Date.now())

        if (vip) {
            gorjeta = parseInt(gorjeta) + parseInt([Math.floor(Math.random() * gorjeta)])
            work = parseInt(work) + parseInt([Math.floor(Math.random() * work)])
            xp = parseInt(xp) + parseInt([Math.floor(Math.random() * xp)])
        }

        result === "win" ? NewGorjeta() : Commum()

        function Commum() {
            sdb.add(`Users.${message.author.id}.Balance`, work)
            sdb.add(`Users.${message.author.id}.Xp`, xp)

            let comvip = `Bônus ${e.VipStar} | Você trabalhou e ganhou ${work} ${Moeda(message)} e ${xp} ${e.RedStar}XP`
            let semvip = `${e.Check} | Você trabalhou e ganhou ${work} ${Moeda(message)} e ${xp} ${e.RedStar}XP\n${e.SaphireObs} | Sabia que Vips ganham bônus? \`${prefix}vip\``

            PushTransaction(
                message.author.id,
                `${e.BagMoney} Ganhou ${work} Moedas trabalhando`
            )

            vip ? message.reply(comvip) : message.reply(semvip)
        }

        function NewGorjeta() {
            sdb.add(`Users.${message.author.id}.Balance`, gorjeta)
            sdb.add(`Users.${message.author.id}.Balance`, work)
            sdb.add(`Users.${message.author.id}.Xp`, xp)

            let comvip = `Bônus ${e.VipStar} | Você trabalhou e ganhou ${work} ${Moeda(message)}, ${xp} ${e.RedStar}XP e uma gorjeta de ${gorjeta} ${Moeda(message)}`
            let semvip = `${e.Check} | Você trabalhou e ganhou ${work} ${Moeda(message)}, ${xp} ${e.RedStar}XP e uma gorjeta de ${gorjeta} ${Moeda(message)}\n${e.SaphireObs} | Sabia que Vips ganham bônus? \`${prefix}vip\``

            PushTransaction(
                message.author.id,
                `${e.BagMoney} Ganhou ${work + gorjeta} Moedas trabalhando`
            )

            vip ? message.reply(comvip) : message.reply(semvip)
        }
    }
}