const { e } = require('../../../JSON/emojis.json'),
    yuricanvas = require('yuri-canvas'),
    { MessageAttachment } = require('discord.js')

module.exports = {
    name: 'deletar',
    aliases: ['excluir', 'apagar'],
    category: 'images',
    ClientPermissions: ['ATTACH_FILES'],
    emoji: `${e.Deny}`,
    usage: '<deletar> [@user]',
    description: 'Delete alguém',

    execute: async (client, message, args, prefix, MessageEmbed, Database) => {

        let user = message.mentions.members.first() || message.guild.members.cache.get(args[0]) || message.mentions.repliedUser || message.author
        
        if (user.id === client.user.id) user = message.author
        
        let avatar = user.displayAvatarURL({ dynamic: false, format: 'png' }),
            image = await yuricanvas.delete(avatar),
            msg = await message.channel.send(`${e.Loading} | Carregando imagem...`)

        if (user.id === client.user.id) user = message.author

        message.channel.send({ files: [new MessageAttachment(image, "deleted.png")] })
        return msg.delete(() => { })

    }
}