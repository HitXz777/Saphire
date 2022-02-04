const { MessageAttachment } = require('discord.js')
const { e } = require('../../../database/emojis.json')
const { Canvas } = require('canvacord')
const Error = require('../../../Routes/functions/errors')

// #246FE0 - Azul Saphire
module.exports = {
    name: 'sharpen',
    category: 'images',
    ClientPermissions: ['ATTACH_FILES'],
    emoji: '📸',
    usage: '<sharpen> <@user>',
    description: 'Efeito sharpen',

    run: async (client, message, args, prefix, db, MessageEmbed, request, sdb) => {

        let user = message.mentions.users.first() || message.mentions.repliedUser || await client.users.cache.get(args[0]) || message.author
        let avatar = user.displayAvatarURL({ format: 'png' })

        let number = parseInt(args[1]) || parseInt(args[0]) || 1
        if (isNaN(number)) number = 1

        if (number > 10 || number < 1)
             return message.reply(`${e.Deny} | O número não pode ser maior que **10**`)

        try {
            return message.reply(`${e.Loading} | Carregando...`).then(async msg => {
                msg.delete().catch(() => { })
                message.reply({ files: [new MessageAttachment(await Canvas.sharpen(avatar, number), 'sharpen.png')] })
            })
        } catch (err) {
            Error(message, err)
        }
    }
}