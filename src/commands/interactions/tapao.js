const canvacord = require('canvacord/src/Canvacord')
const Discord = require("discord.js")
const { e } = require('../../../database/emojis.json')

module.exports = {
    name: 'tapão',
    aliases: ['slaap', 'tapao'],
    category: 'interactions',
    ClientPermissions: ['ATTACH_FILES'],
    emoji: '🖐️',
    usage: '<tapão> [@user]',
    description: 'Tapão',

    run: async (client, message, args, prefix, db, MessageEmbed, request, sdb) => {

        let user = message.mentions.users.first() || message.mentions.repliedUser || message.author
        let avatar = user.displayAvatarURL({ dynamic: false, format: "png", size: 1024 })
        let MsgAuthorAvatar = message.author.displayAvatarURL({ dynamic: false, format: "png", size: 1024 })

        if (user.id === message.author.id) return message.reply(`${e.Deny} | Marca @alguem`)
        if (user.id === client.user.id) {
            const image = await canvacord.slap(avatar, MsgAuthorAvatar)
            let slap = new Discord.MessageAttachment(image, "slap.png")
            return message.reply({ content: 'Baaaaka!', files: [slap] })
        } else {
            const image = await canvacord.slap(MsgAuthorAvatar, avatar)
            let slap = new Discord.MessageAttachment(image, "slap.png")
            message.reply({ files: [slap] })
        }
    }
}