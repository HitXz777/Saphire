const { MessageAttachment } = require('discord.js')
const { e } = require('../../../database/emojis.json')
const { Canvas } = require('canvacord')
const Error = require('../../../Routes/functions/errors')

// #246FE0 - Azul Saphire
module.exports = {
    name: 'changemymind',
    aliases: ['cmm'],
    category: 'images',
    ClientPermissions: ['ATTACH_FILES'],
    emoji: `${e.Drinking}`,
    usage: '<changemymind> <texto da foto>',
    description: 'Change my mind meme',

    run: async (client, message, args, prefix, db, MessageEmbed, request, sdb) => {

        let text = args.join(' ')
        if (!text)
            return message.reply(`${e.Info} | Forneça um texto para a produção da imagem. Limite: 30 caracteres`)

        if (text.length > 30)
            return message.reply(`${e.Deny} | O texto não pode ultrapassar **30 caracteres**`)

        try {
            return message.reply(`${e.Loading} | Carregando...`).then(async msg => {
                msg.delete().catch(() => { })
                message.reply({ files: [new MessageAttachment(await Canvas.changemymind(text), 'changemymind.png')] })
            })
        } catch (err) {
            Error(message, err)
        }
    }
}