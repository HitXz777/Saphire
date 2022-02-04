const { DatabaseObj } = require('../../../Routes/functions/database')
const { e, config } = DatabaseObj
const ms = require("parse-ms")
const Moeda = require('../../../Routes/functions/moeda')
const Colors = require('../../../Routes/functions/colors')
const Vip = require('../../../Routes/functions/vip')
const { PushTransaction } = require('../../../Routes/functions/transctionspush')

module.exports = {
    name: 'monthly',
    aliases: ['mensal'],
    category: 'economy2',
    emoji: `${e.Coin}`,
    usage: '<monthy>',
    description: 'Pegue uma recompensa mensal',

    run: async (client, message, args, prefix, db, MessageEmbed, request, sdb) => {

        if (['info', 'help', 'ajuda'].includes(args[0]?.toLowerCase()))
            return WeekInfo()

        // 2592000000 ---> 1 mês
        let time = ms(2592000000 - (Date.now() - sdb.get(`Users.${message.author.id}.Timeouts.Monthly`)))
        if (sdb.get(`Users.${message.author.id}.Timeouts.Monthly`) !== null && 2592000000 - (Date.now() - sdb.get(`Users.${message.author.id}.Timeouts.Monthly`)) > 0) {
            return message.reply(`${e.Deny} | Epa! Espere mais \`${time.days}d ${time.hours}h, ${time.minutes}m, e ${time.seconds}s\``)
        } else { sdb.delete(`Users.${message.author.id}.Timeouts.Monthly`) }

        let vip = Vip(`${message.author.id}`)
        message.guild.id === config.guildId ? InsideGuild() : OutsideGuild()

        function InsideGuild() {
            let amountcoins = parseInt(Math.floor(Math.random() * 1000000) + 1)
            let amountxp = parseInt(Math.floor(Math.random() * 5000) + 1)
            let Bonus1 = parseInt(Math.floor(Math.random() * 1000000) + 1)
            let Bonus2 = parseInt(Math.floor(Math.random() * 5000) + 1)

            if (vip) {
                let MoneyVipBonus = parseInt(Math.floor(Math.random() * amountcoins))
                let XpVipBonus = parseInt(amountxp + Math.floor(Math.random() * 100))
                amountcoins = (amountcoins + MoneyVipBonus)
                amountxp = (amountxp + XpVipBonus)
            }

            sdb.add(`Users.${message.author.id}.Bank`, amountcoins)
            sdb.add(`Users.${message.author.id}.Xp`, amountxp)
            sdb.add(`Users.${message.author.id}.Balance`, Bonus1)
            sdb.add(`Users.${message.author.id}.Xp`, Bonus2)
            sdb.set(`Users.${message.author.id}.Timeouts.Monthly`, Date.now())

            PushTransaction(
                message.author.id,
                `${e.BagMoney} Recebeu ${amountcoins + Bonus1} Moedas no mensal`
            )

            let ComVip = `Bônus ${e.VipStar} | Você adquiriu +${amountcoins} ${Moeda(message)} e +${amountxp} ${e.RedStar} XP\n${e.SaphireHi} | Bônus: +${Bonus1} ${Moeda(message)} e +${Bonus2} ${e.RedStar} XP`
            let NoVip = `${e.Check} | Você adquiriu +${amountcoins} ${Moeda(message)} e +${amountxp} ${e.RedStar} XP\n${e.SaphireHi} | Bônus: +${Bonus1} ${Moeda(message)} e +${Bonus2} ${e.RedStar} XP`

            vip ? message.reply(ComVip) : message.reply(NoVip)
        }

        function OutsideGuild() {
            let amountcoins = parseInt(Math.floor(Math.random() * 500000) + 1)
            let amountxp = parseInt(Math.floor(Math.random() * 3000) + 1)

            if (vip) {
                let BonusVipMoney = Math.floor(Math.random() * amountcoins)
                let BonusVipXp = Math.floor(Math.random() * amountxp)

                prizemoney = amountcoins + BonusVipMoney
                prizexp = amountxp + BonusVipXp
            }

            sdb.add(`Users.${message.author.id}.Bank`, amountcoins)
            sdb.add(`Users.${message.author.id}.Xp`, amountxp)
            sdb.set(`Users.${message.author.id}.Timeouts.Monthly`, Date.now())


            PushTransaction(
                message.author.id,
                `${e.BagMoney} Recebeu ${amountcoins} Moedas no mensal`
            )

            let NoVip = `${e.Check} | Você adquiriu +${amountcoins} ${Moeda(message)} e +${amountxp} ${e.RedStar} XP\n${e.SaphireObs} | Sabia que se você der \`${prefix}monthly\` dentro do meu servidor você pode ganhar até 4x a mais?`
            let WithVip = `Bônus ${e.VipStar} | Você adquiriu +${amountcoins} ${Moeda(message)} e +${amountxp} ${e.RedStar} XP\n${e.SaphireObs} | Sabia que se você der \`${prefix}monthly\` dentro do meu servidor você pode ganhar até 4x a mais?`

            vip ? message.reply(WithVip) : message.reply(NoVip)

        }

        function WeekInfo() {
            return message.reply({
                embeds: [
                    new MessageEmbed()
                        .setColor(Colors(message.member))
                        .setTitle(`${e.SaphireHi} ${client.user.username} Monthy`)
                        .setDescription(`O meu Monthly é um pouco diferenciado. Tem vários tipos de recompensas e você pode pegar algumas delas com uma pitada de sorte.`)
                        .addFields(
                            {
                                name: '⏱️ Cooldown:',
                                value: `1 mês - Confira seu tempo restante usando \`${prefix}cd\``
                            },
                            {
                                name: `${e.SaphireObs} Servidor Oficial`,
                                value: `Você ganha o seu monthy mais um bônus usando o comando dentro do meu [servidor oficial](${config.ServerLink})`
                            },
                            {
                                name: `${e.VipStar} Vip`,
                                value: `Os Vips tem uma vantagem no monthy. Eles recebem uma porcentagem aleatória do próprio monthy. Se eles pegarem 100000 ${Moeda(message)}, o vip irá te adicionar mais um valor aleatório dos 1000000. Quer saber mais? Use \`${prefix}vip\``
                            },
                            {
                                name: `${e.SaphireTimida} Fora do servidor oficial`,
                                value: `Monthly fora do [servidor oficial](${config.ServerLink}) te garante o valor padrão, nada mais.`
                            },
                            {
                                name: `${e.PandaProfit} Recompensas`,
                                value: `O monthy te fornece uma quantia aleatória de **1 a 500000 ${Moeda(message)}** + **1 a 3000 XP ${e.RedStar}**`
                            },
                            {
                                name: `${e.Gear} Comando e atalhos`,
                                value: `\`${prefix}monthy\` \`${prefix}mensal\``
                            }
                        )
                ]
            })
        }

    }
}
