const { e } = require('../../../database/emojis.json')
const ms = require("parse-ms")
const { f } = require('../../../database/frases.json')
const Moeda = require('../../../Routes/functions/moeda')
const { PushTransaction } = require('../../../Routes/functions/transctionspush')

module.exports = {
    name: 'pig',
    aliases: ['porco'],
    category: 'economy',
    ClientPermissions: ['ADD_REACTIONS'],
    emoji: `${e.Pig}`,
    usage: '<pig> [coins/status]',
    description: 'Tente obter toda a grana do porquinho',

    run: async (client, message, args, prefix, db, MessageEmbed, request, sdb) => {

        let PorquinhoMoney = sdb.get('Porquinho.Money') || 0
        let LastWinner = sdb.get('Porquinho.LastWinner') || 'Ninguém por enquanto'
        let LastPrize = sdb.get('Porquinho.LastPrize') || 0

        if (['coins', 'moedas', 'moeda', 'status'].includes(args[0]?.toLowerCase())) {
            const StatusPigEmbed = new MessageEmbed().setColor('#BA49DA').setTitle(`${e.Pig} Status`).setDescription(`Tente quebrar o Pig e ganhe todo o dinheiro dele`).addField('Último ganhador', `${LastWinner}\n${LastPrize}${Moeda(message)}`, true).addField('Montante', `${PorquinhoMoney}${Moeda(message)}`, true)
            return message.reply({ embeds: [StatusPigEmbed] })
        }

        if (args[1]) { return message.reply(`${e.Deny} | Por favor, digite apenas \`${prefix}pig\` ou \`${prefix}pig status\``) }

        let time = ms(30000 - (Date.now() - sdb.get(`Users.${message.author.id}.Timeouts.Porquinho`)))
        if (sdb.get(`Users.${message.author.id}.Timeouts.Porquinho`) !== null && 30000 - (Date.now() - sdb.get(`Users.${message.author.id}.Timeouts.Porquinho`)) > 0) {
            return message.reply(`${e.Deny} | Tente quebrar o ${e.Pig} novamente em: \`${time.seconds}s\``)
        } else {

            if (request) return message.reply(`${e.Deny} | ${f.Request}${sdb.get(`Request.${message.author.id}`)}`)

            let money = sdb.get(`Users.${message.author.id}.Balance`) || 0
            let bank = sdb.get(`Users.${message.author.id}.Bank`) || 0

            if (money < 10000 && bank < 10000) return message.reply(`${e.Deny} | Você não possui dinheiro.`)
            if (money >= 10000) return Pig()
            if (bank >= 10000) return Question()

            function Pig() {
                sdb.set(`Users.${message.author.id}.Timeouts.Porquinho`, Date.now()); sdb.add('Porquinho.Money', 10000);
                sdb.subtract(`Users.${message.author.id}.Balance`, 10000)

                PushTransaction(
                    message.author.id,
                    `${e.Pig} Apostou 10000 no porquinho.`
                )

                let luck = ['win', 'lose', 'lose', 'lose', 'lose', 'lose', 'lose', 'lose', 'lose', 'lose', 'lose', 'lose', 'lose', 'lose', 'lose', 'lose', 'lose', 'lose', 'lose', 'lose', 'lose', 'lose', 'lose', 'lose', 'lose', 'lose', 'lose', 'lose', 'lose', 'lose', 'lose', 'lose', 'lose', 'lose', 'lose', 'lose', 'lose', 'lose', 'lose', 'lose', 'lose', 'lose', 'lose', 'lose', 'lose', 'lose', 'lose', 'lose', 'lose', 'lose', 'lose', 'lose', 'lose', 'lose', 'lose', 'lose', 'lose', 'lose', 'lose', 'lose', 'lose', 'lose', 'lose', 'lose', 'lose', 'lose', 'lose', 'lose', 'lose', 'lose', 'lose', 'lose', 'lose', 'lose', 'lose', 'lose', 'lose', 'lose', 'lose', 'lose', 'lose', 'lose', 'lose', 'lose', 'lose', 'lose', 'lose', 'lose', 'lose', 'lose', 'lose', 'lose', 'lose', 'lose', 'lose', 'lose', 'lose', 'lose', 'lose', 'lose'] // 1% de chance de vitória
                let result = luck[Math.floor(Math.random() * luck.length)]
                result === "win" ? PigBroken() : message.reply(`${e.Deny} | Não foi dessa vez! Veja o status: \`${prefix}pig coins\`\n-10000 ${Moeda(message)}!`)
            }

            function PigBroken() {
                const PigMoney = sdb.get('Porquinho.Money') || 0
                sdb.add(`Users.${message.author.id}.Balance`, PigMoney)
                message.reply(`${e.Check} | ${message.author} quebrou o porquinho e conseguiu +${PigMoney} ${Moeda(message)}!`)
                sdb.set('Porquinho', {
                    LastPrize: PigMoney,
                    LastWinner: `${message.author.tag}\n*(${message.author.id})*`,
                    Money: 10000
                })
                PushTransaction(
                    message.author.id,
                    `${e.Pig} Ganhou ${PigMoney} quebrando o porquinho.`
                )
            }

            function Question() {
                message.reply(`${e.QuestionMark} | Você não tem dinheiro na carteira, deseja retirar -10000 ${Moeda(message)} do banco? `).then(msg => {
                    sdb.set(`Request.${message.author.id}`, `${msg.url}`)
                    msg.react('✅').catch(() => { }) // Check
                    msg.react('❌').catch(() => { }) // X

                    const filter = (reaction, user) => { return ['✅', '❌'].includes(reaction.emoji.name) && user.id === message.author.id }

                    msg.awaitReactions({ filter, max: 1, time: 15000, errors: ['time'] }).then(collected => {
                        const reaction = collected.first()

                        if (reaction.emoji.name === '✅') {
                            sdb.delete(`Request.${message.author.id}`)
                            sdb.add(`Users.${message.author.id}.Balance`, 10000)
                            sdb.subtract(`Users.${message.author.id}.Bank`, 10000)
                            Pig()
                            msg.delete().catch(() => { })
                        } else {
                            sdb.delete(`Request.${message.author.id}`)
                            return msg.edit(`${e.Deny} | Comando cancelado | ${message.author.id}`)
                        }
                    }).catch(() => {
                        sdb.delete(`Request.${message.author.id}`)
                        return msg.edit(`${e.Deny} | Comando cancelado: Tempo expirado | ${message.author.id}`)
                    })
                })
            }
        }
    }
}