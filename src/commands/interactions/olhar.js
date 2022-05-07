const { g } = require('../../../modules/Images/gifs.json')

module.exports = {
    name: 'olhar',
    aliases: ['todeolho', 'olho'],
    category: 'interactions',
    ClientPermissions: ['EMBED_LINKS', 'ADD_REACTIONS'],
    emoji: '👀',
    usage: '<olhar> <@user>',
    description: '👀',

    run: async (client, message, args, prefix, MessageEmbed, Database) => {

        let rand = g.Dedo[Math.floor(Math.random() * g.Dedo.length)],
            user = message.mentions.members.first() || message.mentions.repliedUser

        if (!user) return message.reply(`${e.Info} | Marca alguém.`)

        if (user.id === client.user.id) return message.reply(`👀`)

        if (user.id === message.author.id) { return message.reply(`Ué... Melhor @marcar alguém`) }

        const embed = new MessageEmbed()
            .setColor('#246FE0')
            .setDescription(`👀 | ${message.author} está de olho em você ${user}`)
            .setImage(rand)
            .setFooter({ text: '🔁 retribuir' })

        return message.reply({ embeds: [embed] }).then(msg => {
            
            msg.react('🔁').catch(() => { }) // Check

            const filter = (reaction, u) => { return ['🔁'].includes(reaction.emoji.name) && u.id === user.id }

            msg.awaitReactions({ filter, max: 1, time: 15000, errors: ['time'] }).then(collected => {
                const reaction = collected.first()

                if (reaction.emoji.name === '🔁') {
                    
                    const TradeEmbed = new MessageEmbed().setColor('RED').setDescription(`👀 ${user} também está de olho em você 👀`).setImage(g.Dedo[Math.floor(Math.random() * g.Dedo.length)])
                    msg.edit({ embeds: [TradeEmbed] }).catch(() => { })
                }

            }).catch(() => {
                
                embed.setColor('RED')
                msg.edit({ embeds: [embed] }).catch(() => { })
            })
        })
    }
}