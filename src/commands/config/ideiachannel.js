const { e } = require("../../../database/emojis.json")
const { f } = require('../../../database/frases.json')
const Error = require('../../../Routes/functions/errors')
const { ServerDb } = require('../../../Routes/functions/database')

module.exports = {
    name: 'ideiachannel',
    aliases: ['setideiachannel', 'canaldeideias'],
    category: 'config',
    UserPermissions: ['MANAGE_GUILD'],
    ClientPermissions: ['ADD_REACTIONS', 'EMBED_LINKS'],
    emoji: `${e.ModShield}`,
    usage: '<ideichannel> [#channel]',
    description: 'Selecione um canal para envio de ideias',

    run: async (client, message, args, prefix, db, MessageEmbed, request, sdb) => {

        if (request) return message.reply(`${e.Deny} | ${f.Request}${sdb.get(`Request.${message.author.id}`)}`)
        if (['desligar', 'off'].includes(args[0]?.toLowerCase())) {

            let canal = ServerDb.get(`Servers.${message.guild.id}.IdeiaChannel`)
            if (!canal) return message.reply(`${e.Deny} | O sistema de ideias já está desativado`)

            await message.guild.channels.fetch(canal).then(channel => {

                return message.channel.send(`${e.QuestionMark} | Deseja desativar o sistema de ideias? Canal atual: ${channel}`).then(msg => {
                    sdb.set(`Request.${message.author.id}`, `${msg.url}`)
                    msg.react('✅').catch(() => { }) // e.Check
                    msg.react('❌').catch(() => { }) // X

                    const filter = (reaction, user) => { return ['✅', '❌'].includes(reaction.emoji.name) && user.id === message.author.id }

                    msg.awaitReactions({ filter, max: 1, time: 15000, errors: ['time'] }).then(collected => {
                        const reaction = collected.first()

                        if (reaction.emoji.name === '✅') {
                            sdb.delete(`Request.${message.author.id}`)
                            ServerDb.delete(`Servers.${message.guild.id}.IdeiaChannel`)
                            return msg.edit(`${e.SaphireFeliz} | Prontinho, sistema de ideias desativado.`).catch(() => { })
                        } else {
                            sdb.delete(`Request.${message.author.id}`)
                            return message.channel.send(`${e.Deny} | Request cancelada.`)
                        }
                    }).catch(() => {
                        sdb.delete(`Request.${message.author.id}`)
                        msg.edit(`${e.Deny} | Request cancelada: Tempo expirado.`).catch(() => { })
                    })
                })
            }).catch(() => {
                sdb.delete(`Request.${message.author.id}`)
                return message.reply(`${e.Deny} | O sistema de ideias já está desativado`)
            })

        } else {

            let channel = message.mentions.channels.first() || message.channel
            let atual = ServerDb.get(`Servers.${message.guild.id}.IdeiaChannel`)

            if (channel.id === atual) {
                return message.reply(`${e.Info} | Este já é o canal de ideias atual`)
            } else {

                return message.reply(`${e.QuestionMark} | Deseja autenticar o canal ${channel} como canal de ideias?`).then(msg => {
                    sdb.set(`Request.${message.author.id}`, `${msg.url}`)
                    msg.react('✅').catch(() => { }) // e.Check
                    msg.react('❌').catch(() => { }) // X

                    const filter = (reaction, user) => { return ['✅', '❌'].includes(reaction.emoji.name) && user.id === message.author.id }

                    msg.awaitReactions({ filter, max: 1, time: 15000, errors: ['time'] }).then(collected => {
                        const reaction = collected.first()

                        if (reaction.emoji.name === '✅') {
                            sdb.delete(`Request.${message.author.id}`)
                            ServerDb.set(`Servers.${message.guild.id}.IdeiaChannel`, channel.id)
                            return msg.edit(`${e.NezukoJump} | Prontinho, sistema de ideias ativado.\nO comando é simples --> \`${prefix}ideia a sua ideia em diante\``).catch(() => { })
                        } else {
                            sdb.delete(`Request.${message.author.id}`)
                            return message.channel.send(`${e.Deny} | Request cancelada.`)
                        }
                    }).catch(() => {
                        sdb.delete(`Request.${message.author.id}`)
                        msg.edit(`${e.Deny} | Request cancelada: Tempo expirado.`).catch(() => { })
                    })
                })
            }
        }
    }
}