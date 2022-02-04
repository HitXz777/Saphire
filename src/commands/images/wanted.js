const { MessageAttachment } = require('discord.js')
const { DatabaseObj: { e } } = require('../../../Routes/functions/database')
const { Canvas } = require('canvacord')
const Error = require('../../../Routes/functions/errors')

module.exports = {
    name: 'wanted',
    aliases: ['procurado'],
    category: 'images',
    ClientPermissions: ['ATTACH_FILES'],
    emoji: `${e.PepePreso}`,
    usage: '<wanted> [@user]',
    description: 'Wanted meme',

    run: async (client, message, args, prefix, db, MessageEmbed, request, sdb) => {

        let user = message.mentions.users.first() || message.mentions.repliedUser || await client.users.cache.get(args[0]) || message.author,
            avatar = user.displayAvatarURL({ format: 'png' }),
            msg = await message.reply(`${e.Loading} | Carregando...`)

        message.reply({ files: [new MessageAttachment(await Canvas.wanted(avatar), 'wanted.png')] }).catch(err => Error(message, err))
        return msg.delete().catch(() => { })
    }
}