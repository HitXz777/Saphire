const { g } = require('../../../modules/Images/gifs.json')
const { e } = require('../../../JSON/emojis.json')

module.exports = {
    name: 'love',
    aliases: ['teamo', 'amor'],
    category: 'interactions',
    ClientPermissions: ['EMBED_LINKS', 'ADD_REACTIONS'],
    emoji: '❤️',
    usage: '<love> <@user>',
    description: 'O amor é tão lindo',

    run: async (client, message, args, prefix, MessageEmbed, Database) => {

        let rand = g.TeAmo[Math.floor(Math.random() * g.TeAmo.length)],
            user = message.mentions.members.first() || message.mentions.repliedUser

        if (!user) return message.reply(`${e.Info} | Marca alguém.`)

        if (user.id === client.user.id) return message.reply(`${e.Nagatoro} Eu também me amo`)

        if (user.id === message.author.id) return message.reply(`${e.Deny} | Assim... Eu admiro seu amor próprio, mas sabe? Que tal @marcar alguém?`)

        const embed = new MessageEmbed()
            .setColor('#246FE0')
            .setDescription(`❤️ | ${message.author} te ama ${user}`)
            .setImage(rand)
            .setFooter({ text: '❤️ retribuir' })

        return message.reply({ embeds: [embed] }).then(msg => {

            msg.react('❤️').catch(() => { }) // Check

            const filter = (reaction, u) => { return ['❤️'].includes(reaction.emoji.name) && u.id === user.id }

            msg.awaitReactions({ filter, max: 1, time: 15000, errors: ['time'] }).then(collected => {
                const reaction = collected.first()

                if (reaction.emoji.name === '❤️') {

                    const TradeEmbed = new MessageEmbed().setColor('RED').setDescription(`❤️ ${user} também te ama ${message.author} ❤️`).setImage(g.TeAmo[Math.floor(Math.random() * g.TeAmo.length)])
                    msg.edit({ embeds: [TradeEmbed] }).catch(() => { })
                }

            }).catch(() => {

                embed.setColor('RED')
                msg.edit({ embeds: [embed] }).catch(() => { })
            })
        })
    }
}