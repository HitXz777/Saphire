const { g } = require('../../../modules/Images/gifs.json')
const { e } = require('../../../JSON/emojis.json')

module.exports = {
    name: 'chupar',
    aliases: ['suck'],
    category: 'interactions',
    ClientPermissions: ['EMBED_LINKS', 'ADD_REACTIONS'],
    emoji: '😏',
    usage: '<chupar> <@user>',
    description: 'Huuuum',

    run: async (client, message, args, prefix, MessageEmbed, Database) => {

        let rand = g.Chupar[Math.floor(Math.random() * g.Chupar.length)],
            user = message.mentions.members.first() || message.mentions.repliedUser

        if (!user) return message.reply(`${e.Info} | Marca alguém.`)

        if (user.id === client.user.id) return message.reply(`${e.MaikaAngry} Sai pra lá, HENTAI!!!`)

        if (user.id === message.author.id) { return message.reply(`${e.Deny} | Você é esquisito(a)`) }

        const embed = new MessageEmbed()
            .setColor('#246FE0')
            .setDescription(`😏 | ${message.author} está chupando você ${user}`)
            .setImage(rand)
            .setFooter('🔁 retribuir')

        return message.reply({ embeds: [embed] }).then(msg => {

            msg.react('🔁').catch(() => { }) // Check

            const filter = (reaction, u) => { return ['🔁'].includes(reaction.emoji.name) && u.id === user.id }

            msg.awaitReactions({ filter, max: 1, time: 15000, errors: ['time'] }).then(collected => {
                const reaction = collected.first()

                if (reaction.emoji.name === '🔁') {

                    const TradeEmbed = new MessageEmbed().setColor('RED').setDescription(`${message.author}, ${user} retribuiu a chupada`).setFooter(`${message.author.id}/${user.id}`).setImage(g.Chupar[Math.floor(Math.random() * g.Chupar.length)])
                    msg.edit({ embeds: [TradeEmbed] }).catch(() => { })
                }

            }).catch(() => {

                embed.setColor('RED').setFooter(`${message.author.id}/${user.id}`)
                msg.edit({ embeds: [embed] }).catch(() => { })
            })
        })
    }
}