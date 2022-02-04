const { Permissions } = require('discord.js')
const { e } = require('../../../database/emojis.json')
const { f } = require('../../../database/frases.json')
const Error = require('../../../Routes/functions/errors')

module.exports = {
    name: 'hide',
    aliases: ['esconder'],
    category: 'moderation',
    UserPermissions: ['MANAGE_CHANNELS', 'MANAGE_ROLES'],
    ClientPermissions: ['MANAGE_CHANNELS', 'MANAGE_ROLES'],
    emoji: '🔒',
    usage: 'hide <#channel>/<user>',
    description: 'Esconda o canal de todos (Exceto de quem tem permissão)',

    run: async (client, message, args, prefix, db, MessageEmbed, request, sdb) => {

        if (request) return message.reply(`${e.Deny} | ${f.Request}${sdb.get(`Request.${message.author.id}`)}`)
        let channel = message.mentions.channels.first() || message.channel
        let user = message.mentions.members.first() || message.mentions.roles.first() || message.mentions.repliedUser || message.guild.members.cache.get(args[0])

        if (args[1]) { return message.reply(`${e.Deny} | Por favor, mencione apenas o canal/user que deseja esconder.`) }

        if (channel && !user) {
            channel.permissionOverwrites.create(channel.guild.roles.everyone, { VIEW_CHANNEL: false })
            return message.channel.send(`🔒 | ${message.author} escondeu o canal ${channel}! -> \`${prefix}unhide\``)
        }

        if (user) {
            if (user.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) return message.reply(`${e.SaphireQ} | Por qual motivo você esconderia esse canal de um Administrador?`)
            message.channel.send(`${e.QuestionMark} | ${message.author}, ao esconder o canal de ${user}, você precisará entrar nas configurações do canal para reverter o ato ou responder qualquer mensagem do usuário e digitar o comando \`${prefix}unhide\``).then(msg => {
                sdb.set(`Request.${message.author.id}`, `${msg.url}`)
                msg.react('✅').catch(() => { }) // Check
                msg.react('❌').catch(() => { }) // X

                const filter = (reaction, user) => { return ['✅', '❌'].includes(reaction.emoji.name) && user.id === message.author.id }

                msg.awaitReactions({ filter, max: 1, time: 15000, errors: ['time'] })
                    .then(collected => {
                        const reaction = collected.first()

                        if (reaction.emoji.name === '✅') {
                            sdb.delete(`Request.${message.author.id}`)
                            message.channel.permissionOverwrites.create(user, { VIEW_CHANNEL: false }).then(() => {
                                message.channel.send(`🔒 | ${message.author} escondeu o canal de ${user}`)
                            }).catch(err => {
                                Error(message, err)
                                message.channel.send(`${e.Deny} | Houve um erro ao esconder o canal. Caso não saiba resolver, peça ajuda no meu servidor principal, o link está no \`${prefix}help\`.\n \nErro: \`${err}\``)
                            })
                        } else {
                            sdb.delete(`Request.${message.author.id}`)
                            msg.edit(`${e.NezukoDance} | Comando cancelado.`)
                            msg.reactions.removeAll().catch(() => { })
                        }
                    }).catch(() => {
                        sdb.delete(`Request.${message.author.id}`)
                        msg.edit(`${e.Deny} | Comando cancelado por: Tempo Expirado.`)
                    })
            })
        } else {
            return message.reply(`${Info} | Copia e cola, assim é mais rápido -> \`${prefix}hide\``)
        }
    }
}