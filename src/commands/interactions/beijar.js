const { g } = require('../../../modules/Images/gifs.json')
const { e } = require('../../../JSON/emojis.json')

module.exports = {
    name: 'beijar',
    aliases: ['kiss', 'beijo'],
    category: 'interactions',
    ClientPermissions: ['EMBED_LINKS', 'ADD_REACTIONS'],
    emoji: '👨‍❤️‍💋‍👨',
    usage: '<beijar> <@user>',
    description: 'Beijos e mais beijos',

    run: async (client, message, args, prefix, MessageEmbed, Database) => {

        let rand = g.Beijar[Math.floor(Math.random() * g.Beijar.length)]
        let user = message.mentions.users.first() || message.mentions.repliedUser

        if (!user) return message.reply(`${e.Info} | Você precisa marcar quem você quer beijar.`)
        if (user.id === client.user.id) return message.reply(`${e.SaphireTimida} | Beija eu naaaum.`)
        if (user.id === message.author.id) return message.reply(`${e.SaphireQ} | Beijar você mesmo é meio impossível, não?`)

        const embed = new MessageEmbed()
            .setColor('#246FE0')
            .setDescription(`${e.BlueHeart} | ${message.author} está beijando ${user}`)
            .setImage(rand)
            .setFooter('🔁 retribuir')

        const msg = await message.reply({ embeds: [embed] })

        msg.react('🔁').catch(() => { }) // Check

        return msg.awaitReactions({
            filter: (reaction, u) => ['🔁'].includes(reaction.emoji.name) && u.id === user.id,
            max: 1,
            time: 15000,
            errors: ['time']
        }).then(() => {

            const TradeEmbed = new MessageEmbed().setColor('RED').setDescription(`${e.BlueHeart} ${user} retribuiu o beijo de ${message.author} ${e.BlueHeart}`).setFooter(`${message.author.id}/${user.id}`).setImage(g.Beijar[Math.floor(Math.random() * g.Beijar.length)])
            return msg.edit({ embeds: [TradeEmbed] }).catch(() => { })

        }).catch(() => {
            embed.setColor('RED').setFooter(`${message.author.id}/${user.id}`)
            return msg.edit({ embeds: [embed] }).catch(() => { })
        })

    }
}