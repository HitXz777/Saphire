const { e } = require('../../../database/emojis.json'),
    yuricanvas = require('yuri-canvas'),
    { MessageAttachment } = require('discord.js')

module.exports = {
    name: 'deletar',
    aliases: ['excluir', 'pagar'],
    category: 'images',
    ClientPermissions: ['ATTACH_FILES'],
    emoji: `${e.Deny}`,
    usage: '<deletar> [@user]',
    description: 'Delete alguém',

    run: async (client, message, args, prefix, db, MessageEmbed, request, sdb) => {

        let user = message.mentions.members.first() || message.guild.members.cache.get(args[0]) || message.mentions.repliedUser || message.author,
            avatar = user.displayAvatarURL({ dynamic: false, format: 'png' }),
            image = await yuricanvas.delete(avatar),
            msg = await message.channel.send(`${e.Loading} | Carregando imagem...`)

        if (user.id === client.user.id) user = message.author

        message.channel.send({ files: [new MessageAttachment(image, "deleted.png")] })
        return msg.delete(() => { })

    }
}