const { e } = require('../../../database/emojis.json')
const { f } = require('../../../database/frases.json')

module.exports = {
    name: 'cancelar',
    aliases: ['cancel'],
    category: 'random',
    
    
    emoji: `${e.Deny}`,
    usage: '<cancel> <@user>',
    description: 'Cancele os outros',

    run: async (client, message, args, prefix, db, MessageEmbed, request, sdb) => {

        let cancel = f.Cancelamentos[Math.floor(Math.random() * f.Cancelamentos.length)]
        let user = message.mentions.members.first() || message.mentions.repliedUser || message.guild.members.cache.get(args[0])
        if (!user || user.id === message.author.id) return message.reply(`${e.Deny} | Mencione alguém para ser cancelado`)
        if (user.id === client.user.id) { return message.channel.send(`🔇 | ${message.author} foi cancelado por tentar me cancelar.`) }

        return message.channel.send(`🔇 | ${user.user.username} ${cancel}`)
    }
}