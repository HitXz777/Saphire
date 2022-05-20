const { MessageAttachment } = require('discord.js')
const { e } = require('../../../JSON/emojis.json')
const { Canvas } = require('canvacord')
const Error = require('../../../modules/functions/config/errors')


module.exports = {
    name: 'opinion',
    aliases: ['opinião'],
    category: 'images',
    ClientPermissions: ['ATTACH_FILES'],
    emoji: '🗣️',
    usage: '<opinion> [@user] [msg]',
    description: 'Opinion meme',

    execute: async (client, message, args, prefix, MessageEmbed, Database) => {

        let user = message.mentions.users.first()
        if (!user) return message.reply(`${e.Info} | Tenta assim: \`${prefix}opinion @user O texto em diante\` *(Limite de 25 caracteres)*`)
        let avatar = user.displayAvatarURL({ format: 'png' })

        let text = args.slice(1).join(' ')
        if (!text)
            return message.reply(`${e.Deny} | Tenta assim: \`${prefix}opinion @user Texto\` *(Limite de 25 caracteres)*`)

        if (text.length > 25)
            return message.reply(`${e.Deny} | O limite do texto é de **25 caracteres**`)

        try {
            return message.reply(`${e.Loading} | Carregando...`).then(async msg => {
                message.reply({ files: [new MessageAttachment(await Canvas.opinion(avatar, text), 'opinion.png')] })
                msg.delete().catch(() => { })
            })
        } catch (err) {
            Error(message, err)
        }
    }
}