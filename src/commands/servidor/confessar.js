const { Permissions } = require('discord.js')
const { e } = require('../../../database/emojis.json')
const { f } = require('../../../database/frases.json')
const Error = require('../../../Routes/functions/errors')
const ms = require('parse-ms')
const { ServerDb } = require('../../../Routes/functions/database')

module.exports = {
    name: 'confessar',
    aliases: ['confess', 'confes'],
    category: 'servidor',
    ClientPermissions: ['MANAGE_MESSAGES', 'MANAGE_CHANNELS'],
    emoji: '📝',
    usage: '<confessar> <sua confissão>',
    description: 'Confesse algo para o servidor. É anônimo.',

    run: async (client, message, args, prefix, db, MessageEmbed, request, sdb) => {

        if (['set', 'on'].includes(args[0]?.toLowerCase())) return SetNewChannel()
        if (['off', 'desligar'].includes(args[0]?.toLowerCase())) return SetOffChannel()
        if (['info', 'help', 'ajuda'].includes(args[0]?.toLowerCase())) return message.channel.send({
            embeds: [
                new MessageEmbed()
                    .setColor('#246FE0')
                    .setTitle(`📝 ${client.user.username} Confessionário`)
                    .setDescription(`Confesse tudo o que você quiser com este comando. É simples, fácil e anônimo.`)
                    .addFields(
                        {
                            name: `${e.Gear} Comando`,
                            value: `\`${prefix}confessar <Sua confissão e diante>\`\nAtalhos: \`confess | confes\``
                        },
                        {
                            name: `${e.On} Ativação do Canal`,
                            value: `\`${prefix}confessar set <#channel>\``
                        },
                        {
                            name: `${e.Off} Desativação`,
                            value: `\`${prefix}confessar off\``
                        }
                    )
                    .setFooter(`A ${client.user.username} não se responsabiliza por quaisquer mensagem enviada atráves deste comando.`)
            ]
        })

        message.delete().catch(() => { return message.channel.send(`${e.Deny} | Houve um erro na execução deste comando. Verifique se eu tenho a permissão **GERENCIAR MENSAGENS** ativada.\n\`${err}\``) })

        const channelDB = ServerDb.get(`Servers.${message.guild.id}.ConfessChannel`)
        const channel = await message.guild.channels.cache.get(channelDB)
        let Mensagem = args.join(' ')

        let time = ms(60000 - (Date.now() - sdb.get(`Users.${message.author.id}.Timeouts.Confess`)))
        if (sdb.get(`Users.${message.author.id}.Timeouts.Confess`) !== null && 60000 - (Date.now() - sdb.get(`Users.${message.author.id}.Timeouts.Confess`)) > 0)
            return message.channel.send(`⏱️ | Envie outra confissão após \`${time.minutes}m e ${time.seconds}s\``)

        if (!channelDB) return message.channel.send(`${e.Deny} | Este comando precisa de um canal específico. use \`${prefix}confessar info\` para mais informações.`)
        if (!channel) return message.channel.send(`${e.Info} | Parece que o canal de report foi excluido. Use \`${prefix}confessar info\` para mais informações.`)

        if (!Mensagem) return message.channel.send(`${e.Info} | Confesse algo para todos sem ninguém saber que foi você! É completamente anônimo. Basta usar \`${prefix}confessar <Sua mensagem em diante>\` que eu envio ela no canal ${channel}`)

        const ConfessEmbed = new MessageEmbed()
            .setColor('#246FE0')
            .setDescription(`📝 ${Mensagem}`)
            .setFooter(`${prefix}confessar`)

        try {
            if (channel.permissionsFor(channel.guild.roles.everyone).has(Permissions.FLAGS.SEND_MESSAGES))
                channel.permissionOverwrites.create(channel.guild.roles.everyone, { SEND_MESSAGES: false })
            sdb.set(`Users.${message.author.id}.Timeouts.Confess`, Date.now())
            channel.send({ embeds: [ConfessEmbed] })
            return message.channel.send(`${e.Check} | Confissão enviada com sucesso!`)
        } catch (err) {
            return message.channel.send(`${e.Deny} | Ocorreu um erro ao enviar a confissão... Caso não saiba resolver, utilize o comando \`${prefix}bug\` e relate o problema.\n\`${err}\``)
        }

        async function SetNewChannel() {

            if (!message.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR))
                return message.reply(`${e.Deny} | Você precisa ser um **Administrador** para ativar o canal deste comando.`)

            let channelDB = ServerDb.get(`Servers.${message.guild.id}.ConfessChannel`)
            const channel = await message.guild.channels.cache.get(channelDB)
            let NewChannel = message.mentions.channels.first() || message.channel

            if (channelDB && !channel)
                ServerDb.delete(`Servers.${message.guild.id}.ConfessChannel`)

            if (channel)
                return message.reply(`${e.Info} | Já existe um canal de confissão neste servidor. Ele está aqui: ${channel}\n${e.SaphireObs} | Caso deseje desativar este comando, só usar \`${prefix}confessar off\` ou deletar o canal.`)

            if (!NewChannel)
                return message.reply(`${e.Info} | É necessário que você informe o canal para que eu possa configurar tudo certinho.\n${e.SaphireObs} Olha um exemplo: \`${prefix}confessar set #canal\``)

            if (!CheckChannel(NewChannel))
                return message.reply(`${e.Deny} | Canal inválido!`)

            if (NewChannel.deleted)
                return message.reply(`${e.Deny} | Este canal foi deletado. Que tal tentar um que existe no servidor?`)

            if (CheckChannel(NewChannel)) {

                return message.reply(`${e.QuestionMark} | Deseja configurar o canal ${NewChannel} como Canal de Confissões?`).then(async msg => {
                    sdb.set(`Request.${message.author.id}`, `${msg.url}`)
                    msg.react('✅').catch(() => { }) // Check
                    msg.react('❌').catch(() => { }) // X

                    const filter = (reaction, user) => { return ['✅', '❌'].includes(reaction.emoji.name) && user.id === message.author.id }

                    msg.awaitReactions({ filter, max: 1, time: 15000, errors: ['time'] }).then(async collected => {
                        const reaction = collected.first()

                        if (reaction.emoji.name === '✅') {
                            sdb.delete(`Request.${message.author.id}`)

                            try {
                                await message.guild.channels.cache.get(`${NewChannel.id}`).send(`${e.Check} | Este canal foi configurado como **Confessionário**. Para enviar sua confissão, basta usar o comando \`${prefix}confessar <Sua confissão em diante>\``)
                                NewChannel.permissionOverwrites.create(NewChannel.guild.roles.everyone, { SEND_MESSAGES: false })
                                ServerDb.set(`Servers.${message.guild.id}.ConfessChannel`, NewChannel.id)
                                return message.reply(`${e.Check} | Feito! Canal configurado com sucesso!`)
                            } catch (err) {
                                message.channel.send(`${err}`)
                                return message.channel.send(`${e.Deny} | Eu não tenho permissão para enviar mensagens neste canal. Eu tirei ele da minha database :D`)
                            }
                        } else {
                            sdb.delete(`Request.${message.author.id}`)
                            msg.edit(`${e.Deny} | Comando cancelado.`).catch(() => { })
                        }
                    }).catch(() => {
                        sdb.delete(`Request.${message.author.id}`)
                        msg.edit(`${e.Deny} | Comando cancelado por tempo expirado.`).catch(() => { })
                    })

                }).catch(err => {
                    Error(message, err)
                    message.channel.send(`${e.SaphireCry} | Ocorreu um erro durante o processo. Por favor, reporte o ocorrido usando \`${prefix}bug\`\n\`${err}\``)
                })


            } else {
                return message.reply(`${e.SaphireQ} | Certeza que você está fazendo isso certo? \`${prefix}confessar set #canal\``)
            }

            async function CheckChannel(channel) {
                return await message.guild.channels.cache.get(channel.id) ? true : false
            }

        }

        async function SetOffChannel() {

            if (!message.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR))
                return message.reply(`${e.Deny} | Você precisa ser um **Administrador** para desativar o canal deste comando.`)

            let channelDB = ServerDb.get(`Servers.${message.guild.id}.ConfessChannel`)
            const channel = await message.guild.channels.cache.get(channelDB)

            if (!channel || !channelDB)
                return message.reply(`${e.Info} | Este servidor não tem nenhum canal de confissão ativado.`)


            if (request) return message.reply(`${e.Deny} | ${f.Request}${sdb.get(`Request.${message.author.id}`)}`)

            return message.reply(`${e.QuestionMark} | Você realmente deseja desativar este comando? Canal configurado: ${channel}`).then(msg => {
                sdb.set(`Request.${message.author.id}`, `${msg.url}`)
                msg.react('✅').catch(() => { }) // Check
                msg.react('❌').catch(() => { }) // X

                const filter = (reaction, user) => { return ['✅', '❌'].includes(reaction.emoji.name) && user.id === message.author.id }

                msg.awaitReactions({ filter, max: 1, time: 15000, errors: ['time'] }).then(collected => {
                    const reaction = collected.first()

                    if (reaction.emoji.name === '✅') {
                        sdb.delete(`Request.${message.author.id}`)
                        ServerDb.delete(`Servers.${message.guild.id}.ConfessChannel`)
                        return msg.edit(`${e.Check} | Canal e comando desativado com sucesso!`)

                    } else {
                        sdb.delete(`Request.${message.author.id}`)
                        msg.edit(`${e.Deny} | Comando cancelado.`).catch(() => { })
                    }
                }).catch(() => {
                    sdb.delete(`Request.${message.author.id}`)
                    msg.edit(`${e.Deny} | Comando cancelado por tempo expirado.`).catch(() => { })
                })

            }).catch(err => {
                Error(message, err)
                message.channel.send(`${e.SaphireCry} | Ocorreu um erro durante o processo. Por favor, reporte o ocorrido usando \`${prefix}bug\`\n\`${err}\``)
            })

        }

    }
}