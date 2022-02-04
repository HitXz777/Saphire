const { f } = require('../../../database/frases.json')
const { e } = require('../../../database/emojis.json')
const { ServerDb } = require('../../../Routes/functions/database')

module.exports = {
    name: 'lockcommands',
    aliases: ['nocommands', 'blockcommands', 'bloquearcomandos', 'blockbots'],
    category: 'moderation',
    UserPermissions: ['MANAGE_CHANNELS'],
    ClientPermissions: ['MANAGE_MESSAGES', 'ADD_REACTIONS'],
    emoji: '🔒',
    usage: '<lockcommands> <channel>',
    description: 'Tranque meus comandos em canais específicos para que não seja usados. (ADM\'s são imunes)',

    run: async (client, message, args, prefix, db, MessageEmbed, request, sdb) => {

        if (request) return message.reply(`${e.Deny} | ${f.Request}${sdb.get(`Request.${message.author.id}`)}`)
        let channel = message.mentions.channels.first() || message.channel

        const InfoEmbed = new MessageEmbed()
            .setColor('#246FE0')
            .setTitle(`${e.Deny} Bloqueio de Comandos`)
            .setDescription('Com este comando, torna-se possível o bloqueio dos meus comandos ou comandos de outros bots em canais específicos.')
            .addField(`${e.On} Bloqueie meus comandos`, `\`${prefix}lockcommands\``)
            .addField(`${e.On} Bloqueie todos os bots`, `\`${prefix}lockcommands bots\``)
            .addField(`${e.Off} Desative`, `\`${prefix}unlockcommands\``)

        if (['info', 'informações', 'informação', 'help', 'ajuda'].includes(args[0]?.toLowerCase())) return message.reply({ embeds: [InfoEmbed] })
        if (['bots', 'bot'].includes(args[0]?.toLowerCase())) return BloquearBots()

        if (ServerDb.get(`Servers.${message.guild.id}.Blockchannels.${channel.id}`)) { return message.reply(`${e.Check} | ${channel} já está bloqueado. \`${prefix}lockcommands info\``) }

        return message.reply(`${e.QuestionMark} | Você deseja bloquear todos os meus comandos no canal ${channel}?`).then(msg => {
            sdb.set(`Request.${message.author.id}`, `${msg.url}`)
            msg.react('✅').catch(() => { }) // e.Check
            msg.react('❌').catch(() => { }) // X

            const filter = (reaction, user) => { return ['✅', '❌'].includes(reaction.emoji.name) && user.id === message.author.id }

            msg.awaitReactions({ filter, max: 1, time: 15000, errors: ['time'] }).then(collected => {
                const reaction = collected.first()

                if (reaction.emoji.name === '✅') {
                    sdb.delete(`Request.${message.author.id}`)
                    ServerDb.set(`Servers.${message.guild.id}.Blockchannels.${message.channel.id}`, true)
                    return msg.edit(`✅ | ${message.author} bloqueou todos os meus comandos no canal ${channel}.`).then(msg => {
                        ServerDb.get(`Servers.${message.guild.id}.Blockchannels.Bots.${channel.id}`) ? '' : BloquearBots()
                    }).catch(() => { })
                } else {
                    sdb.delete(`Request.${message.author.id}`)
                    msg.edit(`${e.Deny} | Request cancelada por: ${message.author}`).then(msg => {
                        ServerDb.get(`Servers.${message.guild.id}.Blockchannels.Bots.${channel.id}`) ? '' : BloquearBots()
                    }).catch(() => { })
                }
            }).catch(err => {
                sdb.delete(`Request.${message.author.id}`)
                msg.edit(`${e.Deny} | Request cancelada por: Tempo expirado.`)
            })
        })

        function BloquearBots() {
            if (ServerDb.get(`Servers.${message.guild.id}.Blockchannels.Bots.${channel.id}`)) { return message.reply(`${e.Check} | ${channel} já está bloqueado. \`${prefix}lockcommands info\``) }
            
            setTimeout(() => {
                message.channel.send(`${e.QuestionMark} | ${message.author}, você quer bloquear todos os comandos de todos os bots neste canal?\n${e.SaphireObs} | Vale lembrar que Administradores **NÃO** são imunes a esse bloqueio.`).then(msg => {
                    sdb.set(`Request.${message.author.id}`, `${msg.url}`)
                    msg.react('✅').catch(() => { }) // e.Check
                    msg.react('❌').catch(() => { }) // X

                    const filter = (reaction, user) => { return ['✅', '❌'].includes(reaction.emoji.name) && user.id === message.author.id }

                    msg.awaitReactions({ filter, max: 1, time: 15000, errors: ['time'] }).then(collected => {
                        const reaction = collected.first()

                        if (reaction.emoji.name === '✅') {
                            sdb.delete(`Request.${message.author.id}`)
                            ServerDb.set(`Servers.${message.guild.id}.Blockchannels.Bots.${message.channel.id}`, true)
                            return msg.edit(`✅ | ${message.author} bloqueou todos comandos de todos os bots canal ${channel}.`).catch(() => { })
                        } else {
                            sdb.delete(`Request.${message.author.id}`)
                            msg.edit(`${e.Deny} | Request cancelada por: ${message.author}`)
                        }
                    }).catch(err => {
                        sdb.delete(`Request.${message.author.id}`)
                        msg.edit(`${e.Deny} | Request cancelada por: Tempo expirado.`)
                    })
                })
            }, 2500)
        }

    }
}