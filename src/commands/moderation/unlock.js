const { e } = require('../../../database/emojis.json')
const { Permissions } = require('discord.js')

module.exports = {
    name: 'unlock',
    aliases: ['destrancar', 'abrir'],
    category: 'moderation',
    UserPermissions: ['MANAGE_CHANNELS', 'MANAGE_ROLES'],
    ClientPermissions: ['MANAGE_CHANNELS', 'MANAGE_ROLES'],
    emoji: '🔓',
    usage: 'unlock <#channel>/<@user>',
    description: 'Abra o canal para todos/user falarem',

    run: async (client, message, args, prefix, db, MessageEmbed, request, sdb) => {

        let channel = message.mentions.channels.first() || message.channel,
            user = message.mentions.members.first() || message.mentions.repliedUser || message.guild.members.cache.get(args[0]),
            Role = channel.guild.roles.cache.get(message.mentions.roles.first()?.id)

        if (['info', 'help', 'ajuda'].includes(args[0]?.toLowerCase())) return LockInfo()

        if (args[1]) return message.reply(`${e.Deny} | Por favor, mencione apenas o canal/user que deseja desbloquear.`)

        if (channel && !user && !Role) {
            channel.permissionOverwrites.delete(channel.guild.roles.everyone)
            return message.channel.send(`🔓 | ${message.author} abriu o canal ${channel}!`)
        }

        if (Role && !message.mentions.members.first() && !message.mentions.channels.first())
            channel.permissionsFor(Role).has(Permissions.FLAGS.SEND_MESSAGES) ? AnswerRole() : UnlockRole()

        if (user && !message.mentions.channels.first() && !Role) {
            if (user.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
                return message.reply(`${e.SaphireQ} | Um administrador pode falar neste canal mesmo bloqueado, sabia? Mas vou liberar mesmo assim.`).then(() => {

                    setTimeout(() => {
                        channel.permissionOverwrites.delete(user)
                        message.channel.send(`🔓 | ${message.author} liberou ${user}||(adm kkk)|| para falar no canal ${channel}.`)
                    }, 2000)

                })
            } else {
                channel.permissionOverwrites.delete(user)
                message.channel.send(`🔓 | ${message.author} liberou ${user} para falar no canal ${channel}`)
            }
        }

        function UnlockRole() {
            channel.permissionOverwrites.delete(Role)
            return message.channel.send(`🔓 | ${message.author} liberou o canal para o cargo ${Role}.`)
        }

        function AnswerRole() {
            return message.reply(`${e.Check} | Este canal já está aberto para este cargo.`)
        }

        function LockInfo() {
            return message.reply({
                embeds: [
                    new MessageEmbed()
                        .setColor(client.blue)
                        .setTitle('🔓 Un/Lock Info')
                        .setDescription(`Trave e destrave os canais/cargos/usuários.`)
                        .addFields(
                            {
                                name: '🔓 Des/trave canais',
                                value: `\`${prefix}un/lock [#channel]\` - Des/Trave um canal para ninguém mandar mensagem`
                            },
                            {
                                name: '🔓 Des/trave cargos',
                                value: `\`${prefix}un/lock <@role>\` - Des/Trave um cargo e todos os membros que possuem o cargo não poderam mandar mensagem no canal em que o comando foi dado`
                            },
                            {
                                name: '🔓 Des/trave membros',
                                value: `\`${prefix}un/lock <@membro/id/replyMessage>\` - Des/Trave um membros para bloquea-lo de mandar mensagem no canal.`
                            }
                        )
                ]
            })
        }

    }
}