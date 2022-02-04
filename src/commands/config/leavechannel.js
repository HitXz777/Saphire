const { e } = require('../../../database/emojis.json')
const { f } = require('../../../database/frases.json')
const Error = require('../../../Routes/functions/errors')
const { ServerDb } = require('../../../Routes/functions/database')

module.exports = {
    name: 'leavechannel',
    aliases: ['setleave', 'setleavechannel'],
    category: 'config',
    UserPermissions: ['MANAGE_CHANNELS'],
    ClientPermissions: ['SEND_MESSAGES', 'ADD_REACTIONS'],
    emoji: `${e.Loud}`,
    usage: '<leavechannel> [#channel] | [off]',
    description: 'Selecione um canal para eu avisar quem sai do servidor',

    run: async (client, message, args, prefix, db, MessageEmbed, request, sdb) => {

        if (request) return message.reply(`${e.Deny} | ${f.Request}${sdb.get(`Request.${message.author.id}`)}`)
        let channel = message.mentions.channels.first() || message.channel

        let canal = ServerDb.get(`Servers.${message.guild.id}.LeaveChannel.Canal`)
        let WelcomeChannel = ServerDb.get(`Servers.${message.guild.id}.WelcomeChannel.Canal`)

        if (args[0] === 'off') {
            if (canal) {

                return message.reply(`${e.QuestionMark} | Você deseja desativar o sistema de saídas?`).then(msg => {
                    sdb.set(`Request.${message.author.id}`, `${msg.url}`)
                    msg.react('✅').catch(() => { }) // e.Check
                    msg.react('❌').catch(() => { }) // X

                    const filter = (reaction, user) => { return ['✅', '❌'].includes(reaction.emoji.name) && user.id === message.author.id }

                    msg.awaitReactions({ filter, max: 1, time: 15000, errors: ['time'] })
                        .then(collected => {
                            const reaction = collected.first()

                            if (reaction.emoji.name === '✅') {
                                sdb.delete(`Request.${message.author.id}`)
                                ServerDb.delete(`Servers.${message.guild.id}.LeaveChannel`)
                                return msg.edit(`${e.SaphireFeliz} | Prontinho, agora eu não vou dizer mais nada quando alguém sair no servidor.`).catch(() => { })
                            } else {
                                sdb.delete(`Request.${message.author.id}`)
                                msg.edit(`${e.Deny} | Request abortada.`).catch(() => { })
                            }
                        }).catch(() => { sdb.delete(`Request.${message.author.id}`); msg.edit(`${e.Deny} | Tempo expirada.`) })
                }).catch(err => {
                    Error(message, err)
                    message.channel.send(`${e.SaphireCry} | Ocorreu um erro durante o processo. Por favor, reporte o ocorrido usando \`${prefix}bug\`\n\`${err}\``)
                })

            } else {
                return message.reply(`${e.Deny} | O Leave System já está desativado.`)
            }

        } else if (channel.id === canal) {
            return message.reply(`${e.Info} | Este canal já foi definido como Leave Channel!`)
        } else if (channel !== canal) {

            return message.reply(`${e.QuestionMark} | Deseja configurar "${channel}" como canal de saídas?`).then(msg => {
                sdb.set(`Request.${message.author.id}`, `${msg.url}`)
                msg.react('✅').catch(() => { }) // e.Check
                msg.react('❌').catch(() => { }) // X

                const filter = (reaction, user) => { return ['✅', '❌'].includes(reaction.emoji.name) && user.id === message.author.id }

                msg.awaitReactions({ filter, max: 1, time: 15000, errors: ['time'] })
                    .then(collected => {
                        const reaction = collected.first()

                        if (reaction.emoji.name === '✅') {
                            sdb.delete(`Request.${message.author.id}`)
                            ServerDb.set(`Servers.${message.guild.id}.LeaveChannel.Canal`, channel.id)

                            msg.edit(`Aeee ${e.NezukoJump}! De agora em diante, vou falar no canal ${channel} sobre todo mundo que sair do servidor.`).then(() => {

                                if (WelcomeChannel) return
                                return message.channel.send(`${e.QuestionMark} | Ei, ei ${message.author}! Posso ativar o sistema de boas-vindas no canal "${channel}" também?`).then(msg => {
                                    sdb.set(`Request.${message.author.id}`, `${msg.url}`)
                                    msg.react('✅').catch(() => { }) // e.Check
                                    msg.react('❌').catch(() => { }) // X

                                    const filter = (reaction, user) => { return ['✅', '❌'].includes(reaction.emoji.name) && user.id === message.author.id }

                                    msg.awaitReactions({ filter, max: 1, time: 15000, errors: ['time'] })
                                        .then(collected => {
                                            const reaction = collected.first()

                                            if (reaction.emoji.name === '✅') {
                                                sdb.delete(`Request.${message.author.id}`)
                                                ServerDb.set(`Servers.${message.guild.id}.WelcomeChannel`, channel.id)
                                                msg.edit(`${e.NezukoJump} | Nice, nice! Daqui pra frente, eu vou avisar no canal "${channel}" sobre todo mundo que entrar e sair do servidor.`).catch(() => { })
                                            } else {
                                                sdb.delete(`Request.${message.author.id}`)
                                                msg.edit(`${e.Deny} | Indicação abortada | ${client.user.id}`).catch(() => { })
                                            }
                                        }).catch(() => {
                                            sdb.delete(`Request.${message.author.id}`)
                                            msg.edit(`${e.Deny} | Indicação abortada | Tempo expirado`).catch(() => { })
                                        })
                                })
                            }).catch(err => {
                                Error(message, err)
                                message.channel.send(`${e.SaphireCry} | Ocorreu um erro durante o processo de autenticação. Por favor, reporte o ocorrido usando \`${prefix}bug\`\n\`${err}\``)
                            })
                        } else {
                            sdb.delete(`Request.${message.author.id}`)
                            msg.edit(`${e.Deny} | Request abortada.`).catch(() => { })
                        }
                    }).catch(() => {
                        sdb.delete(`Request.${message.author.id}`)
                        msg.edit(`${e.Deny} | Request abortada.`).catch(() => { })
                    })
            })
        }
    }
}