const { e } = require('../../../database/emojis.json')
const { Permissions } = require('discord.js')

module.exports = {
    name: 'move',
    aliases: ['mover', 'puxar'],
    category: 'moderation',
    UserPermissions: ['MOVE_MEMBERS'],
    ClientPermissions: ['MOVE_MEMBERS'],
    emoji: `${e.ModShield}`,
    usage: '<move> <@membro/Id>',
    description: 'Mova membros para a sua call',

    run: async (client, message, args, prefix, db, MessageEmbed, request, sdb) => {

        let member = message.mentions.members.first() || message.mentions.repliedUser || message.guild.members.cache.get(args[0])

        if (!message.member.voice.channel) return message.reply(`${e.Deny} | Você não está em nenhum canal de voz.`)
        if (!member) return message.reply(`${e.Info} | Informe o @user/Id ou responde a mensagem da pessoa que você quer mover para ${message.member.voice.channel}`)
        if (member.permissions.has([Permissions.FLAGS.MOVE_MEMBERS, Permissions.FLAGS.ADMINISTRATOR, Permissions.FLAGS.KICK_MEMBERS, Permissions.FLAGS.BAN_MEMBERS, Permissions.FLAGS.MANAGE_ROLES])) return message.reply(`${e.Deny} | Eu não posso desconectar ${member.user.username}. Permissões muitos fortes, entende?`)
        if (!member.voice.channel) return message.reply(`${e.Deny} | ${member.user.username} não está em nenhum canal de voz.`)

        member.voice.setChannel(message.member.voice.channel).catch(err => {
            return message.reply(`${e.Deny} | Não foi possível mover ${member.user.username} para o seu canal de voz.\n\`${err}\``)
        })
        message.reply(`${e.Check} | Feito!`)
    }
}