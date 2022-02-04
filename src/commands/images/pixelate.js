const { MessageAttachment } = require('discord.js')
const { e } = require('../../../database/emojis.json')
const { Canvas } = require('canvacord')
const Error = require('../../../Routes/functions/errors')

// #246FE0 - Azul Saphire
module.exports = {
    name: 'pixelate',
    aliases: ['pixel', 'px'],
    category: 'images',
    ClientPermissions: ['ATTACH_FILES'],
    emoji: '🔲',
    usage: '<pixelate> [@user]',
    description: 'Pixel nas fotos',

    run: async (client, message, args, prefix, db, MessageEmbed, request, sdb) => {

        let user = message.mentions.users.first() || message.mentions.repliedUser  || message.author
        let avatar = user.displayAvatarURL({ format: 'png' })

        let pixels = parseInt(args[1]) || parseInt(args[0]) || 7
        if (pixels > 100 || pixels < 1)
            return message.reply(`${e.Deny} | A quantidade de pixels deve estar entre **1 e 100**`)

        try {
            const msg = await message.reply(`${e.Loading} | Carregando...`)
            message.reply({ files: [new MessageAttachment(await Canvas.pixelate(avatar, pixels), 'pixelate.png')] })
            msg.delete().catch(() => { })
        } catch (err) {
            Error(message, err)
        }
    }
}