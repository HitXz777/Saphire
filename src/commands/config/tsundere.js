const { e } = require('../../../database/emojis.json')
const { f } = require('../../../database/frases.json')
const { ServerDb } = require('../../../Routes/functions/database')

module.exports = {
    name: 'tsundere',
    aliases: ['bipolar'],
    category: 'config',
    ClientPermissions: ['SEND_MESSAGES', 'ADD_REACTIONS'],
    emoji: `${e.Hmmm}`,
    usage: '<tsundere>',
    description: 'Ative meu lado bipolar se tiver coragem',

    run: async (client, message, args, prefix, db, MessageEmbed, request, sdb) => {

        if (request) return message.reply(`${e.Deny} | ${f.Request}${sdb.get(`Request.${message.author.id}`)}`)

        if (message.author.id !== message.guild.ownerId) return message.reply(`${e.Deny} | Este comando tem impacto direto a todos os meus comandos dentro desse servidor. Somente o*(a)* dono*(a)* do servidor **${await message.guild.members.cache.get(message.guild.ownerId).user.tag}** pode ativa-lo.`)
        if (!args[0]) return message.reply(`${e.SaphireObs} | Opa opa, pra ativar o lado Tsundere da ${client.user.username}, você tem que usar \`ON/OFF\` logo depois do comando.\nFique ciente, de que a ${client.user.username} vai se recusar a fazer alguns comandos. Então, pense bem.\n\`${prefix}tsundere ON/OFF\``)

        if (['on', 'ligar', 'ativar'].includes(args[0]?.toLowerCase())) return TurnOn()
        if (['off', 'desligar', 'desativar'].includes(args[0]?.toLowerCase())) return TurnOff()
        return message.reply(`${e.Info} | Tenta usar assim: \`${prefix}tsundere ON/OFF\``)

        function TurnOff() {
            if (!ServerDb.get(`Servers.${message.guild.id}.Tsundere`)) return message.reply(`${e.Info} | Meu lado tsundere já está desativado.`)

            return message.reply(`${e.Hmmm} | Quer desativar meu lado Tsundere`).then(msg => {
                sdb.set(`Request.${message.author.id}`, `${msg.url}`)
                msg.react('✅').catch(() => { }) // Check
                msg.react('❌').catch(() => { }) // X

                const filter = (reaction, user) => { return ['✅', '❌'].includes(reaction.emoji.name) && user.id === message.author.id }

                msg.awaitReactions({ filter: filter, max: 1, time: 15000, errors: ['max'] }).then(collected => {
                    const reaction = collected.first()

                    if (reaction.emoji.name === '✅') {
                        sdb.delete(`Request.${message.author.id}`)
                        ServerDb.delete(`Servers.${message.guild.id}.Tsundere`)
                        return msg.edit(`${e.Loli} Wooah, desativaduu`).catch(() => { })
                    } else {
                        sdb.delete(`Request.${message.author.id}`)
                        return msg.edit(`${e.Deny} Comando cancelado.`).catch(() => { })
                    }
                }).catch(() => {
                    sdb.delete(`Request.${message.author.id}`)
                    return msg.edit(`${e.Deny} Comando cancelado por tempo expirado.`).catch(() => { })
                })

            })
        }

        function TurnOn() {
            if (ServerDb.get(`Servers.${message.guild.id}.Tsundere`)) return message.reply(`${e.Info} | Meu lado tsundere já está ativado.`)
            
            return message.reply(`${e.Hmmm} | Certeza que quer ativar meu lado tsundere? Eu vou recusar uns comandos de vez em quando... ${e.SaphireFeliz}`).then(msg => {
                sdb.set(`Request.${message.author.id}`, `${msg.url}`)
                msg.react('✅').catch(() => { }) // Check
                msg.react('❌').catch(() => { }) // X

                const filter = (reaction, user) => { return ['✅', '❌'].includes(reaction.emoji.name) && user.id === message.author.id }

                msg.awaitReactions({ filter: filter, max: 1, time: 15000, errors: ['max'] }).then(collected => {
                    const reaction = collected.first()

                    if (reaction.emoji.name === '✅') {
                        sdb.delete(`Request.${message.author.id}`)
                        ServerDb.set(`Servers.${message.guild.id}.Tsundere`, true)
                        return msg.edit(`${e.Loli} Wooah.`).catch(() => { })
                    } else {
                        sdb.delete(`Request.${message.author.id}`)
                        return msg.edit(`${e.Deny} Comando cancelado.`).catch(() => { })
                    }
                }).catch(() => {
                    sdb.delete(`Request.${message.author.id}`)
                    return msg.edit(`${e.Deny} Comando cancelado por tempo expirado.`).catch(() => { })
                })

            })
        }

    }
}