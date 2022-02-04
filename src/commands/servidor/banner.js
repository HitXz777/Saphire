const { e } = require('../../../database/emojis.json')

module.exports = {
    name: 'banner',
    aliases: ['serverbanner'],
    category: 'servidor',
    emoji: '🌌',
    usage: '<banner>',
    description: 'Veja o banner do servidor (se tiver)',

    run: async (client, message, args, prefix, db, MessageEmbed, request, sdb) => {

        let banner = message.guild.bannerURL({ format: 'jpeg', size: 1024 })

        const BannerEmbed = new MessageEmbed()
            .setColor('#246FE0')
            .setDescription(`${e.Download} [Baixar](${banner}) banner do servidor`  )
            .setImage(`${banner}`)

        banner ? message.channel.send({ embeds: [BannerEmbed] }) : message.reply(`${e.SaphireObs} | Este servidor não possui um banner.`)

    }
}