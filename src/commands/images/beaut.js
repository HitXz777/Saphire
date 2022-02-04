const canvacord = require('canvacord/src/Canvacord')
const Discord = require("discord.js")

module.exports = {
        name: 'beauty',
        aliases: ['beaut'],
        category: 'images',
        ClientPermissions: ['EMBED_LINKS', 'ATTACH_FILES'],
        emoji: '📷',
        usage: '<beaut> [@user]',
        description: 'Simplesmente bonito/a',

        run: async (client, message, args, prefix, db, MessageEmbed, request, sdb) => {

                let user = message.mentions.members.first() || message.member

                const memberAvatar = user.user.displayAvatarURL({ dynamic: false, format: 'png' })
                const image = await canvacord.beautiful(memberAvatar)
                const beautiful = new Discord.MessageAttachment(image, 'beautiful.png')
                return message.reply({ files: [beautiful] })
        }
}