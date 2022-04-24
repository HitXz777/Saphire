const { MessageAttachment } = require('discord.js')
const { e } = require('../../../JSON/emojis.json')
const { Canvas } = require('canvacord')
const Error = require('../../../modules/functions/config/errors')


module.exports = {
    name: 'youtube',
    aliases: ['ytb'],
    category: 'images',
    ClientPermissions: ['ATTACH_FILES'],
    emoji: '📺',
    usage: '<tby> [@user] <Text>',
    description: 'Youtube comentário',

    run: async (client, message, args, prefix, MessageEmbed, Database) => {

        let user = message.mentions.users.first()
        if (!user) return message.reply(`${e.Info} | Tenta assim: \`${prefix}ytb @user O texto em diante\` *(Limite de 60 caracteres)*`)

        let avatar = user.displayAvatarURL({ format: 'png' })

        let text = args.slice(1).join(" ")
        if (!text) return message.reply(`${e.Info} | Tenta assim: \`${prefix}ytb @user O texto em diante\` *(Limite de 60 caracteres)*`)
        if (text.length > 60) return message.reply(`${e.Deny} | O limite do texto é de **60 caracteres**`)

        try {

            return message.reply(`${e.Loading} | Carregando`).then(async msg => {
                let image = new MessageAttachment(await Canvas.youtube(options = { username: user.username, content: text, avatar: avatar, dark: true }), 'youtube.png')

                msg.delete().catch(() => { })
                message.channel.send({ files: [image] })
                message.delete().catch(() => { })
            })

        } catch (err) {
            Error(message, err)
        }
    }
}