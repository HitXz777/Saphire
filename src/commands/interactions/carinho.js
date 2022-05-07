const { g } = require('../../../modules/Images/gifs.json')
const { e } = require('../../../JSON/emojis.json')

module.exports = {
    name: 'carinho',
    aliases: ['pat'],
    category: 'interactions',
    ClientPermissions: ['EMBED_LINKS', 'ADD_REACTIONS'],
    emoji: e.PatNezuko,
    usage: '<carinho> <@user>',
    description: 'Huuuum',

    run: async (client, message, args, prefix, MessageEmbed, Database) => {

        let rand = g.Carinho[Math.floor(Math.random() * g.Carinho.length)],
            user = message.mentions.members.first() || message.mentions.repliedUser

        if (!user) return message.reply(`${e.Info} | Marca alguém.`)

        if (user.id === client.user.id) return message.reply(`${e.MaikaAngry} Não ouse!`)

        if (user.id === message.author.id) { return message.reply(`${e.Deny} | Não faça isso com você!`) }

        const embed = new MessageEmbed()
            .setColor('#246FE0')
            .setDescription(`${message.author} está dando carinho em você ${user}`)
            .setImage(rand)
            .setFooter({ text: '🔁 retribuir' })

        return message.reply({ embeds: [embed] }).then(msg => {

            msg.react('🔁').catch(() => { }) // Check

            const filter = (reaction, u) => { return ['🔁'].includes(reaction.emoji.name) && u.id === user.id }

            msg.awaitReactions({ filter, max: 1, time: 15000, errors: ['time'] }).then(collected => {
                const reaction = collected.first()

                if (reaction.emoji.name === '🔁') {

                    const TradeEmbed = new MessageEmbed().setColor('RED').setDescription(`${message.author} e ${user} estão se acariciando`).setImage(g.Carinho[Math.floor(Math.random() * g.Carinho.length)])
                    msg.edit({ embeds: [TradeEmbed] }).catch(() => { })
                }

            }).catch(() => {

                embed.setColor('RED')
                msg.edit({ embeds: [embed] }).catch(() => { })
            })
        })
    }
}