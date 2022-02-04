const { MessageAttachment } = require('discord.js')
const { e } = require('../../../database/emojis.json')
const { Canvas } = require('canvacord')
const Error = require('../../../Routes/functions/errors')

// #246FE0 - Azul Saphire
module.exports = {
    name: 'bed',
    aliases: ['cama'],
    category: 'images',
    ClientPermissions: ['ATTACH_FILES'],
    emoji: '🛏️',
    usage: '<bed> [@user] [@user]',
    description: 'Vai uma caminha?',

    run: async (client, message, args, prefix, db, MessageEmbed, request, sdb) => {

        let user1 = message.mentions.users.first()
        if (!user1) return message.reply(`${e.Info} | Tenta assim: \`${prefix}cama @user1 @user2\``)
        let avatar1 = user1.displayAvatarURL({ format: 'png' })

        let user2 = message.mentions.users.last()
        if (!user2) return message.reply(`${e.Info} | Tenta assim: \`${prefix}cama @user1 @user2\``)
        let avatar2 = user2.displayAvatarURL({ format: 'png' })

        if (user1.id === user2.id)
            if (!user2) return message.reply(`${e.Info} | Tenta assim: \`${prefix}cama @user1 @user2\``)

        try {
            return message.reply(`${e.Loading} | Carregando...`).then(async msg => {
                message.reply({ files: [new MessageAttachment(await Canvas.bed(avatar1, avatar2), 'bed.png')] })
                msg.delete().catch(() => { })
            })
        } catch (err) {
            Error(message, err)
        }
    }
}