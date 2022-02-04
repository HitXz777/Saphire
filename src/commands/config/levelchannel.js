const { e } = require('../../../database/emojis.json')
const { f } = require('../../../database/frases.json')
const Error = require('../../../Routes/functions/errors')
const { ServerDb } = require('../../../Routes/functions/database')

module.exports = {
    name: 'levelchannel',
    aliases: ['setlevelchannel', 'setlevel', 'xpchannel'],
    category: 'config',
    UserPermissions: ['MANAGE_GUILD'],
    ClientPermissions: ['ADD_REACTIONS'],
    emoji: `${e.ModShield}`,
    usage: '<levelchannel> [on/off]',
    description: 'Escolha um canal para eu notificar todos que passam de nível',

    run: async (client, message, args, prefix, db, MessageEmbed, request, sdb) => {

        if (request) return message.reply(`${e.Deny} | ${f.Request}${sdb.get(`Request.${message.author.id}`)}`)
        let channel = message.mentions.channels.first() || message.channel
        let CanalAtual = await message.guild.channels.cache.get(ServerDb.get(`Servers.${message.guild.id}.XPChannel`))

        if (ServerDb.get(`Servers.${message.guild.id}.XPChannel`) && !CanalAtual) {
            ServerDb.delete(`Servers.${message.guild.id}.XPChannel`)
            return message.reply(`${e.Deny} | O canal atual de Notificações de Level Up não foi encontrado. Eu desabilitei o Xp Channel neste servidor no meu banco de dados.`)
        }

        if (['off', 'desligar', 'desativar'].includes(args[0]?.toLowerCase())) return DisableLevelChannel()
        if (['info', 'help', 'ajuda'].includes(args[0]?.toLowerCase())) return LevelChannelInfo()
        return EnableLevelChannel()

        async function DisableLevelChannel() {

            if (!ServerDb.get(`Servers.${message.guild.id}.XPChannel`))
                return message.reply(`${e.Deny} | Este servidor não tem um canal de Level Up definido. Use \`${prefix}levelchannel [#canal]\` para ativa-lo.`)

            return message.reply(`${e.QuestionMark} | Você deseja desativar o canal de Notificações de Level Up? Canal atual: ${CanalAtual}`).then(msg => {
                sdb.set(`Request.${message.author.id}`, `${msg.url}`)
                msg.react('✅').catch(() => { }) // Check
                msg.react('❌').catch(() => { }) // X

                const filter = (reaction, user) => { return ['✅', '❌'].includes(reaction.emoji.name) && user.id === message.author.id }

                msg.awaitReactions({ filter, max: 1, time: 15000, errors: ['time'] }).then(collected => {
                    const reaction = collected.first()

                    if (reaction.emoji.name === '✅') {
                        sdb.delete(`Request.${message.author.id}`)
                        ServerDb.delete(`Servers.${message.guild.id}.XPChannel`)
                        return msg.edit(`${e.Check} | O canal de notificações de level up foi desabilitado.`).catch(() => { })

                    } else {
                        sdb.delete(`Request.${message.author.id}`)
                        return msg.edit(`${e.Deny} | Comando cancelado.`).catch(() => { })
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

        async function EnableLevelChannel() {

            if (channel.id === ServerDb.get(`Servers.${message.guild.id}.XPChannel`)) return message.reply(`${e.Info} | Este já é o canal de level up.`).catch(() => { })

            return message.reply(`${e.QuestionMark} | Você deseja autenticar o canal ${channel} como Canal de Notificações de Level Up?`).then(msg => {
                sdb.set(`Request.${message.author.id}`, `${msg.url}`)
                msg.react('✅').catch(() => { }) // Check
                msg.react('❌').catch(() => { }) // X

                const filter = (reaction, user) => { return ['✅', '❌'].includes(reaction.emoji.name) && user.id === message.author.id }

                msg.awaitReactions({ filter, max: 1, time: 15000, errors: ['time'] }).then(collected => {
                    const reaction = collected.first()

                    if (reaction.emoji.name === '✅') {
                        sdb.delete(`Request.${message.author.id}`)
                        ServerDb.set(`Servers.${message.guild.id}.XPChannel`, channel.id)
                        msg.edit(`${e.CatJump} | Pode deixar comigo! Eu vou avisar no canal ${channel} sempre que alguém passar de level.`).catch(() => { })

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

        async function LevelChannelInfo() {
            return message.reply({
                embeds: [
                    new MessageEmbed()
                        .setColor('#246FE0')
                        .setTitle(`${e.Tada} Canal de Level Up`)
                        .setDescription('O canal de level up, pertece ao meu sistema de experiência. Sempre que um membro passar de level, eu vou avisar no canal configurado.')
                        .addFields(
                            {
                                name: `${e.Gear} Comandos`,
                                value: `\`${prefix}levelchannel [#Canal]\` Ative o canal de level up\n\`${prefix}levelchannel off\` Desative o canal\n\`${prefix}channel levelup\` Se quiser, eu crio e configuro o canal e deixo tudo pronto`
                            },
                            {
                                name: 'Mensagem',
                                value: `${e.Tada} ${message.author} alcançou o level ${sdb.get(`Users.${message.author.id}.Level`) || 1} ${e.RedStar}`
                            },
                            {
                                name: 'Observações',
                                value: `O canal será desativado no meu sistema se: O canal for excluído. Eu for bloqueada de enviar mensagens.`
                            }
                        )
                ]
            })
        }
    }
}