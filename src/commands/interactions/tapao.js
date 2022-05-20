const canvacord = require('canvacord/src/Canvacord'),
    { MessageAttachment } = require("discord.js"),
    { e } = require('../../../JSON/emojis.json')

module.exports = {
    name: 'tapão',
    aliases: ['slaap', 'tapao'],
    category: 'interactions',
    ClientPermissions: ['ATTACH_FILES'],
    emoji: '🖐️',
    usage: '<tapão> [@user]',
    description: 'Tapão',

    execute: async (client, message, args, prefix, MessageEmbed, Database) => {

        let user = message.mentions.users.first() || message.mentions.repliedUser || message.author,
            avatar = user.displayAvatarURL({ dynamic: false, format: "png", size: 1024 }),
            MsgAuthorAvatar = message.author.displayAvatarURL({ dynamic: false, format: "png", size: 1024 })

        if (user.id === message.author.id) return message.reply(`${e.Deny} | Marca @alguem`)

        const msg = await message.reply(`${e.Loading} | Carregando...`)

        if (user.id === client.user.id) {
            const image = await canvacord.slap(avatar, MsgAuthorAvatar)
            let slap = new MessageAttachment(image, "slap.png")
            return msg.edit({ content: 'Baaaaka!', files: [slap] }).catch(() => { })
        } else {
            const image = await canvacord.slap(MsgAuthorAvatar, avatar)
            let slap = new MessageAttachment(image, "slap.png")
            msg.delete().catch(() => { })
            return message.reply({ files: [slap] })
        }
    }
}