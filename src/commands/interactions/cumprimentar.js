const { g } = require('../../../modules/Images/gifs.json')
const { e } = require('../../../JSON/emojis.json')

module.exports = {
    name: 'cumprimentar',
    aliases: ['bv', 'bemvindo', 'bemvinda', 'bem-vindo', 'bem-vinda', 'welcome', 'saudar', 'acenar', 'oi'],
    category: 'interactions',

    ClientPermissions: ['EMBED_LINKS', 'ADD_REACTIONS'],
    emoji: '👋',
    usage: '<cumprimentar> <@user>',
    description: 'Cumprimente alguém',

    run: async (client, message, args, prefix, MessageEmbed, Database) => {

        let rand = g.Cumprimentar[Math.floor(Math.random() * g.Cumprimentar.length)],
            user = message.mentions.members.first() || message.mentions.repliedUser

        if (!user) return message.reply(`${e.Info} | Marca alguém.`)

        if (user.id === client.user.id) {
            return message.reply({
                embeds: [
                    new MessageEmbed()
                        .setColor('#246FE0')
                        .setDescription(`👋 | Oieee`)
                        .setImage(rand)
                ]
            })
        }
        if (user.id === message.author.id) return message.reply(`${e.Deny} | Só faltou @alguém`)

        const embed = new MessageEmbed()
            .setColor('#246FE0')
            .setDescription(`👋 | ${message.author} está acenando pra você ${user}`)
            .setImage(rand)
            .setFooter('🔁 retribuir')

        return message.reply({ embeds: [embed] }).then(msg => {

            msg.react('🔁').catch(() => { }) // Check

            const filter = (reaction, u) => { return ['🔁'].includes(reaction.emoji.name) && u.id === user.id }

            msg.awaitReactions({ filter, max: 1, time: 15000, errors: ['time'] }).then(collected => {
                const reaction = collected.first()

                if (reaction.emoji.name === '🔁') {

                    const TradeEmbed = new MessageEmbed().setColor('RED').setDescription(`👋 ${user} acenou de volta ${message.author} 👋`).setFooter(`${message.author.id}/${user.id}`).setImage(g.Cumprimentar[Math.floor(Math.random() * g.Cumprimentar.length)])
                    msg.edit({ embeds: [TradeEmbed] }).catch(() => { })
                }

            }).catch(() => {

                embed.setColor('RED').setFooter(`${message.author.id}/${user.id}`)
                msg.edit({ embeds: [embed] }).catch(() => { })
            })
        })
    }
}