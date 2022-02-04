const { MessageAttachment } = require('discord.js')
const { e } = require('../../../database/emojis.json')
const { Canvas } = require('canvacord')
const Error = require('../../../Routes/functions/errors')

// #246FE0 - Azul Saphire
module.exports = {
    name: 'bjo',
    category: 'images',
    ClientPermissions: ['ATTACH_FILES'],
    emoji: '👨‍❤️‍💋‍👨',
    usage: '<bjo> [@user] [@user]',
    description: 'bjo meme',

    run: async (client, message, args, prefix, db, MessageEmbed, request, sdb) => {

        let user1 = message.mentions.users.first()
        if (!user1) return message.reply(`${e.Info} | Tenta assim: \`${prefix}bjo @user1 @user2\``)
        let avatar1 = user1.displayAvatarURL({ format: 'png' })

        let user2 = message.mentions.users.last()
        if (!user2) return message.reply(`${e.Info} | Tenta assim: \`${prefix}bjo @user1 @user2\``)
        let avatar2 = user2.displayAvatarURL({ format: 'png' })

        if (sdb.get(`Users.${message.author.id}.NoReact`)) return message.reply(`${e.Deny} | Você está com o \`${prefix}noreact\` ativado.`)
        if (sdb.get(`Users.${user1.id}.NoReact`)) return message.reply(`${e.Deny} | ${user1.tag} está com o \`${prefix}noreact\` ativado.`)
        if (sdb.get(`Users.${user2.id}.NoReact`)) return message.reply(`${e.Deny} | ${user2.tag} está com o \`${prefix}noreact\` ativado.`)

        if (user1.id === user2.id)
            return message.reply(`${e.Info} | Tenta assim: \`${prefix}bjo @user1 @user2\``)

        try {
            return message.reply(`${e.Loading} | Carregando...`).then(async msg => {
                message.reply({ files: [new MessageAttachment(await Canvas.kiss(avatar1, avatar2), 'kiss.png')] })
                msg.delete().catch(() => { })
            })
        } catch (err) {
            Error(message, err)
        }
    }
}