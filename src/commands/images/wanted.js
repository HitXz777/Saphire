const { MessageAttachment } = require('discord.js')
const { DatabaseObj: { e } } = require('../../../modules/functions/plugins/database')
const { Canvas } = require('canvacord')
const Error = require('../../../modules/functions/config/errors')

module.exports = {
    name: 'wanted',
    aliases: ['procurado'],
    category: 'images',
    ClientPermissions: ['ATTACH_FILES'],
    emoji: `${e.PepePreso}`,
    usage: '<wanted> [@user]',
    description: 'Wanted meme',

    execute: async (client, message, args, prefix, MessageEmbed, Database) => {

        let user = message.mentions.users.first() || message.mentions.repliedUser || await client.users.cache.get(args[0]) || message.author,
            avatar = user.displayAvatarURL({ format: 'png' }),
            msg = await message.reply(`${e.Loading} | Carregando...`)

        message.reply({ files: [new MessageAttachment(await Canvas.wanted(avatar), 'wanted.png')] }).catch(err => Error(message, err))
        return msg.delete().catch(() => { })
    }
}