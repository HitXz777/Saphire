const { MessageAttachment } = require('discord.js')
const { Canvas } = require("canvacord")
const { e } = require('../../../database/emojis.json')
const Error = require('../../../Routes/functions/errors')

module.exports = {
    name: 'triggered',
    aliases: ['trigger', 'trig'],
    category: 'images',
    ClientPermissions: ['ATTACH_FILES'],
    emoji: `${e.Trig}`,
    usage: '<trig> [@user]',
    description: 'Triggeeeeered!',

    run: async (client, message, args, prefix, db, MessageEmbed, request, sdb) => {

        let user = message.mentions.users.first() || await message.guild.members.cache.get(args[0]) || message.mentions.repliedUser || message.author
        let avatar = user.displayAvatarURL({ dynamic: true, format: "png", size: 1024 })

        try {
            return message.reply(`${e.Loading} | Carregando...`).then(async msg => {
                msg.delete().catch(() => { })
                message.reply({ files: [new MessageAttachment(await Canvas.trigger(avatar), "triggered.gif")] })
            })
        } catch (err) {
            Error(message, err)
        }
    }
}