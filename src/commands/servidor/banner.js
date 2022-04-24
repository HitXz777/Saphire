const { e } = require('../../../JSON/emojis.json')

module.exports = {
    name: 'banner',
    aliases: ['serverbanner'],
    category: 'servidor',
    emoji: '🌌',
    usage: '<banner>',
    description: 'Veja o banner do servidor (se tiver)',

    run: async (client, message, args, prefix, MessageEmbed, Database) => {

        let banner = message.guild.bannerURL({ format: 'gif', size: 1024, dynamic: true })

        const BannerEmbed = new MessageEmbed()
            .setColor('#246FE0')
            .setDescription(`${e.Download} [Baixar](${banner}) banner do servidor`  )
            .setImage(`${banner}`)

        banner ? message.channel.send({ embeds: [BannerEmbed] }) : message.reply(`${e.SaphireObs} | Este servidor não possui um banner.`)

    }
}