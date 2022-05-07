const { e } = require('../../../JSON/emojis.json')

module.exports = {
    name: 'banner',
    aliases: ['serverbanner'],
    category: 'servidor',
    emoji: '🌌',
    usage: '<banner>',
    description: 'Veja o banner do servidor (se tiver)',

    run: async (client, message, args, prefix, MessageEmbed, Database) => {

        return message.reply(`${e.Deny} |  Comando temporáriamente fechado.`)

        let banner = message.guild.banner

        return banner
            ? message.channel.send({
                embeds: [
                    new MessageEmbed()
                        .setColor('#246FE0')
                        .setDescription(`${e.Download} [Baixar](${banner}) banner do servidor`)
                        .setImage(`${banner}`)
                ]
            })
            : message.reply(`${e.SaphireObs} | Este servidor não possui um banner.`)

    }
}