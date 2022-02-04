const { e } = require('../../../database/emojis.json')

module.exports = {
    name: 'servericon',
    aliases: ['fotoserver'],
    category: 'servidor',
    emoji: '🌌',
    usage: '<servericon>',
    description: 'Veja o icone do servidor',

    run: async (client, message, args, prefix, db, MessageEmbed, request, sdb) => {

        let icon = message.guild.iconURL({ dynamic: true })

        const IconEmbed = new MessageEmbed()
            .setColor('#246FE0')
            .setDescription(`
             [Baixar](${icon}) icone do servidor`)
            .setImage(`${icon}`)

        icon ? message.channel.send({ embeds: [IconEmbed] }) : message.reply(`${e.Deny} | Este servidor não possui um icone.`)

    }
}