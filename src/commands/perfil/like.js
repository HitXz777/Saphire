const { e } = require('../../../database/emojis.json'),
    ms = require("parse-ms")
const Timeout = require('../../../Routes/functions/Timeout')

module.exports = {
    name: 'like',
    aliases: ['curtir', 'laique'],
    category: 'perfil',
    emoji: `${e.Like}`,
    usage: '<like> [@user]',
    description: 'Curta quem você gosta',

    run: async (client, message, args, prefix, db, MessageEmbed, request, sdb) => {

        let user = message.mentions.users.first() || client.users.cache.get(args[0]) || client.users.cache.find(user => user.username?.toLowerCase() == args[0]?.toLowerCase() || user.tag?.toLowerCase() == args[0]?.toLowerCase()) || message.mentions.repliedUser,
            rptimeout = sdb.get(`Users.${message.author.id}.Timeouts.Rep`)

        if (!user || user.id === message.author.id) return message.reply(`${e.Like} | @marca, responda a mensagem ou diga o ID da pessoa que deseja dar like.`)
        if (user.id === client.user.id) return message.reply(`Olha, eu agradeço... Mas você já viu meu \`${prefix}perfil @Saphire\`?`)
        if (user.bot) return message.reply(`${e.Deny} | Sem likes para bots.`)

        let time = ms(1800000 - (Date.now() - rptimeout))

        if (Timeout(1800000, rptimeout))
            return message.reply(`${e.Nagatoro} | Calminha aí Princesa! \`${time.minutes}m, e ${time.seconds}s\``)

        const likes = sdb.add(`Users.${user.id}.Likes`, 1)
        sdb.set(`Users.${message.author.id}.Timeouts.Rep`, Date.now())

        message.reply(`${e.Check} | Você deu um like para ${user.username}.\nAgora, ${user.username} possui um total de ${e.Like} ${likes} likes.`)

    }
}