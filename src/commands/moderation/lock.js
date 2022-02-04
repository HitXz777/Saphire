
const { Permissions } = require('discord.js')
const { e } = require('../../../database/emojis.json')

module.exports = {
    name: 'lock',
    aliases: ['trancar', 'fechar', 'clbc'],
    category: 'moderation',
    UserPermissions: ['MANAGE_CHANNELS', 'MANAGE_ROLES'],
    ClientPermissions: ['MANAGE_CHANNELS', 'MANAGE_ROLES'],
    emoji: '🔒',
    usage: 'lock <#channel>/<@user>/<@cargo>',
    description: 'Tranque o canal para que ninguém/user fale nele',

    run: async (client, message, args, prefix, db, MessageEmbed, request, sdb) => {

        let channel = message.mentions.channels.first() || message.channel,
            user = message.mentions.members.first() || message.mentions.repliedUser || message.guild.members.cache.get(args[0]),
            Role = channel.guild.roles.cache.get(message.mentions.roles.first()?.id)

        if (['info', 'help', 'ajuda'].includes(args[0]?.toLowerCase())) return LockInfo()

        if (args[1]) { return message.reply(`${e.Deny} | Por favor, mencione apenas o canal/user que deseja bloquear.`) }

        if (channel && !user && !Role)
            return channel.permissionsFor(channel.guild.roles.everyone).has(Permissions.FLAGS.SEND_MESSAGES) ? LockChannel() : AnswerChannel()

        if (user && !message.mentions.channels.first() && !Role)
            return channel.permissionsFor(user).has(Permissions.FLAGS.SEND_MESSAGES) ? LockUser() : AnswerUser()

        if (Role && !message.mentions.members.first() && !message.mentions.channels.first())
            return channel.permissionsFor(Role).has(Permissions.FLAGS.SEND_MESSAGES) ? LockRole() : AnswerRole()

        function LockUser() {
            if (user.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) return message.reply(`${e.SaphireQ} | Por qual motivo você bloquearia esse canal de um Administrador?`)
            channel.permissionOverwrites.create(user, { SEND_MESSAGES: false })
            return message.channel.send(`🔒 | ${message.author} proibiu ${user.user.username} de falar neste canal. -> \`${prefix}unlock @${user.displayName}\``)
        }

        function LockChannel() {
            channel.permissionOverwrites.create(channel.guild.roles.everyone, { SEND_MESSAGES: false })
            return message.channel.send(`🔒 | ${message.author} fechou o canal ${channel}! -> \`${prefix}unlock\``)
        }

        function LockRole() {
            channel.permissionOverwrites.create(Role, { SEND_MESSAGES: false })
            return message.channel.send(`🔒 | ${message.author} fechou o canal para o cargo ${Role}! -> \`${prefix}unlock @${Role.name}\``)
        }

        function AnswerChannel() {
            return message.reply(`${e.Check} | Este canal já está trancado para everyone.`)
        }

        function AnswerUser() {
            return message.reply(`${e.Check} | Este usuário já está bloqueado.`)
        }

        function AnswerRole() {
            return message.reply(`${e.Check} | Este canal já está trancado para este cargo.`)
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