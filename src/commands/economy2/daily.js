const { DatabaseObj } = require('../../../Routes/functions/database')
const { e, config } = DatabaseObj
const ms = require("parse-ms")
const Moeda = require('../../../Routes/functions/moeda')
const Colors = require('../../../Routes/functions/colors')
const Vip = require('../../../Routes/functions/vip')
const { PushTransaction } = require('../../../Routes/functions/transctionspush')

module.exports = {
    name: 'daily',
    aliases: ['d', 'diário', 'diario'],
    category: 'economy2',
    emoji: `${e.Coin}`,
    usage: '<daily>',
    description: 'Pegue uma recompensa diária',

    run: async (client, message, args, prefix, db, MessageEmbed, request, sdb) => {

        if (['info', 'help', 'ajuda'].includes(args[0]?.toLowerCase()))
            return DailyInfo()

        // 86400000 ---> 24hrs
        let time = ms(86400000 - (Date.now() - sdb.get(`Users.${message.author.id}.Timeouts.Daily`)))
        if (sdb.get(`Users.${message.author.id}.Timeouts.Daily`) !== null && 86400000 - (Date.now() - sdb.get(`Users.${message.author.id}.Timeouts.Daily`)) > 0)
            return message.reply(`${e.Deny} | Espere calmamente jovem ser. \`${time.hours}h, ${time.minutes}m, e ${time.seconds}s\``)

        let vip = Vip(`${message.author.id}`)
        message.guild.id === config.guildId ? InsideGuild() : OutsideGuild()

        function InsideGuild() {
            let amountcoins = parseInt(Math.floor(Math.random() * 500) + 1)
            let amountxp = parseInt(Math.floor(Math.random() * 500) + 1)
            let Bonus1 = parseInt(Math.floor(Math.random() * 2000) + 1)
            let Bonus2 = parseInt(Math.floor(Math.random() * 2000) + 1)

            if (vip) {
                let MoneyVipBonus = parseInt(Math.floor(Math.random() * amountcoins))
                let XpVipBonus = parseInt(amountxp + Math.floor(Math.random() * 100))
                amountcoins += MoneyVipBonus
                amountxp += XpVipBonus
            }

            sdb.add(`Users.${message.author.id}.Bank`, amountcoins)
            sdb.add(`Users.${message.author.id}.Xp`, amountxp)
            sdb.add(`Users.${message.author.id}.Balance`, Bonus1)
            sdb.add(`Users.${message.author.id}.Xp`, Bonus2)
            sdb.set(`Users.${message.author.id}.Timeouts.Daily`, Date.now())

            let ComVip = `Bônus ${e.VipStar} | Você adquiriu +${amountcoins} ${Moeda(message)} e +${amountxp} ${e.RedStar} XP\n${e.SaphireHi} | Bônus: +${Bonus1} ${Moeda(message)} e +${Bonus2} ${e.RedStar} XP`
            let NoVip = `${e.Check} | Você adquiriu +${amountcoins} ${Moeda(message)} e +${amountxp} ${e.RedStar} XP\n${e.SaphireHi} | Bônus: +${Bonus1} ${Moeda(message)} e +${Bonus2} ${e.RedStar} XP`

            PushTransaction(
                message.author.id,
                `${e.BagMoney} Recebeu ${amountcoins + Bonus1} Moedas no daily`
            )

            vip ? message.reply(ComVip) : message.reply(NoVip)
        }

        function OutsideGuild() {
            let amountcoins = parseInt(Math.floor(Math.random() * 500) + 1)
            let amountxp = parseInt(Math.floor(Math.random() * 500) + 1)

            sdb.add(`Users.${message.author.id}.Bank`, amountcoins)
            sdb.add(`Users.${message.author.id}.Xp`, amountxp)
            sdb.set(`Users.${message.author.id}.Timeouts.Daily`, Date.now())

            PushTransaction(
                message.author.id,
                `${e.BagMoney} Recebeu ${amountcoins} Moedas no daily`
            )

            let NoVip = `${e.Check} | Você adquiriu +${amountcoins} ${Moeda(message)} e +${amountxp} ${e.RedStar} XP\n${e.SaphireObs} | Sabia que se você der \`${prefix}daily\` dentro do meu servidor você pode ganhar até 4x a mais?`
            let WithVip = `Bônus ${e.VipStar} | Você adquiriu +${amountcoins} ${Moeda(message)} e +${amountxp} ${e.RedStar} XP\n${e.SaphireObs} | Sabia que se você der \`${prefix}daily\` dentro do meu servidor você pode ganhar até 4x a mais?`

            vip ? message.reply(WithVip) : message.reply(NoVip)

        }

        function DailyInfo() {
            return message.reply({
                embeds: [
                    new MessageEmbed()
                        .setColor(Colors(message.member))
                        .setTitle(`${e.SaphireHi} ${client.user.username} Daily`)
                        .setDescription(`O meu daily é um pouco diferenciado. Tem vários tipos de recompensas e você pode pegar algumas delas com uma pitada de sorte.`)
                        .addFields(
                            {
                                name: '⏱️ Cooldown:',
                                value: `24 horas - Confira seu tempo restante usando \`${prefix}cd\``
                            },
                            {
                                name: `${e.SaphireObs} Servidor Oficial`,
                                value: `Você ganha o seu daily mais um bônus usando o comando dentro do meu [servidor oficial](${config.ServerLink})`
                            },
                            {
                                name: `${e.VipStar} Vip`,
                                value: `Os Vips tem uma vantagem no daily. Eles recebem uma porcentagem aleatória do próprio daily. Se eles pegarem 500 ${Moeda(message)}, o vip irá te adicionar mais um valor aleatório dos 500. Quer saber mais? Use \`${prefix}vip\``
                            },
                            {
                                name: `${e.SaphireTimida} Fora do servidor oficial`,
                                value: `Daily fora do [servidor oficial](${config.ServerLink}) te garante o valor padrão, nada mais.`
                            },
                            {
                                name: `${e.PandaProfit} Recompensas`,
                                value: `O daily te fornece uma quantia aleatória de **1 a 500 ${Moeda(message)}** + **1 a 500 XP ${e.RedStar}**`
                            },
                            {
                                name: `${e.Gear} Comando e atalhos`,
                                value: `\`${prefix}daily\` \`${prefix}d\` \`${prefix}diario\` \`${prefix}diário\``
                            }
                        )
                ]
            })
        }

    }
}
