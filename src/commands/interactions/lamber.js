const { g } = require('../../../modules/Images/gifs.json')
const { e } = require('../../../JSON/emojis.json')

module.exports = {
    name: 'lamber',
    aliases: ['lick'],
    category: 'interactions',
    
    ClientPermissions: ['EMBED_LINKS', 'ADD_REACTIONS'],
    emoji: '👅',
    usage: '<lamber> <@user>',
    description: 'Vai um lambidinha?',

    execute: async (client, message, args, prefix, MessageEmbed, Database) => {

        let rand = g.Lamber[Math.floor(Math.random() * g.Lamber.length)],
            user = client.getUser(client, message, args, 'member')

        if (!user) return message.reply(`${e.Info} | Marca alguém.`)

        if (user.id === client.user.id) return message.reply('Sai pra lá bixo feio.')

        if (user.id === message.author.id) { return message.reply(`${e.SaphireQ} | Lamber você mesmo é meio estranho... Faz isso não`) }

        const embed = new MessageEmbed()
            .setColor('#246FE0')
            .setDescription(`👅 | ${message.author} está te lambendo ${user}`)
            .setImage(rand)
            .setFooter({ text: '🔁 retribuir' })

        return message.reply({ embeds: [embed] }).then(msg => {
            
            msg.react('🔁').catch(() => { }) // Check

            const filter = (reaction, u) => { return ['🔁'].includes(reaction.emoji.name) && u.id === user.id }

            msg.awaitReactions({ filter, max: 1, time: 15000, errors: ['time'] }).then(collected => {
                const reaction = collected.first()

                if (reaction.emoji.name === '🔁') {
                    
                    const TradeEmbed = new MessageEmbed().setColor('RED').setDescription(`👅 | ${user} retribuiu a lambida de ${message.author}`).setImage(g.Lamber[Math.floor(Math.random() * g.Lamber.length)])
                    msg.edit({ embeds: [TradeEmbed] }).catch(() => { })
                }

            }).catch(() => {
                
                embed.setColor('RED')
                msg.edit({ embeds: [embed] }).catch(() => { })
            })
        })
    }
}