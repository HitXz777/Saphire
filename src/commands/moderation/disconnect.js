const { e } = require('../../../database/emojis.json')
const { Permissions } = require('discord.js')

module.exports = {
    name: 'disconnect',
    aliases: ['dc', 'kickvoice', 'desconectar'],
    category: 'moderation',
    ClientPermissions: ['MOVE_MEMBERS'],
    emoji: `${e.ModShield}`,
    usage: '<disconnect> <@user/id>',
    description: 'Tire alguém da chamada',

    run: async (client, message, args, prefix, db, MessageEmbed, request, sdb) => {

        let user = message.mentions.members.first() || message.mentions.repliedUser || message.guild.members.cache.get(args[0]) || message.member
        if (user.id === message.author.id) return AutoDisconnect()
        if (!message.member.permissions.has(Permissions.FLAGS.MOVE_MEMBERS)) return message.reply(`${e.Deny} | Permissão necessária: **\`MOVER MEMBROS\`**`)

        if (!user.voice.channel) { return message.reply(`${e.Deny} | ${user.user.username} não está em nenhum canal de voz.`) }

        if (user.permissions.has([Permissions.FLAGS.MOVE_MEMBERS, Permissions.FLAGS.ADMINISTRATOR, Permissions.FLAGS.KICK_MEMBERS, Permissions.FLAGS.BAN_MEMBERS, Permissions.FLAGS.MANAGE_ROLES]))
            return message.reply(`${e.Deny} | Eu não posso desconectar ${user.user.username}. Permissões são poderosas...`)

        user.voice.disconnect([`Author: ${message.author.tag}`])

        return message.reply(`${e.Check} | ${user.user.username} foi desconectado*(a)* do com sucesso do canal de voz.`)

        function AutoDisconnect() {
            if (!user.voice.channel) { return message.reply(`${e.Deny} | Você não está em nenhum canal de voz.`) }
            user.voice.disconnect([`Author: ${message.author.tag}`])
            return message.reply(`${e.Check} | Você foi desconectado*(a)* do canal de voz.`)
        }
    }
}