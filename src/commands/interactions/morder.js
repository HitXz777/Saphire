const { g } = require('../../../modules/Images/gifs.json')
const { e } = require('../../../JSON/emojis.json')

module.exports = {
    name: 'morder',
    aliases: ['bite', 'mordida'],
    category: 'interactions',
    ClientPermissions: ['EMBED_LINKS', 'ADD_REACTIONS'],
    emoji: '😁',
    usage: '<morder> <@user>',
    description: 'Morder de jeitinho é bom',

    execute: async (client, message, args, prefix, MessageEmbed, Database) => {

        let rand = g.Morder[Math.floor(Math.random() * g.Morder.length)],
            user = client.getUser(client, message, args, 'member')

        if (!user) return message.reply(`${e.Info} | Marca alguém.`)

        if (user.id === client.user.id) return message.reply(`${e.MaikaAngry} Morde eu não.`)

        if (user.id === message.author.id) return message.reply(`${e.SaphireQ} | Morder você mesmo é meio estranho.`)

        const embed = new MessageEmbed()
            .setColor('#246FE0')
            .setDescription(`${e.Bite} | ${message.author} está mordendo ${user}`)
            .setImage(rand)
            .setFooter({ text: '🔁 retribuir' })

        return message.reply({ embeds: [embed] }).then(msg => {
            
            msg.react('🔁').catch(() => { }) // Check

            const filter = (reaction, u) => { return ['🔁'].includes(reaction.emoji.name) && u.id === user.id }

            msg.awaitReactions({ filter, max: 1, time: 15000, errors: ['time'] }).then(collected => {
                const reaction = collected.first()

                if (reaction.emoji.name === '🔁') {
                    
                    const TradeEmbed = new MessageEmbed().setColor('RED').setDescription(`${e.Bite} ${user} retribuiu a mordida de ${message.author} ${e.Bite}`).setImage(g.Morder[Math.floor(Math.random() * g.Morder.length)])
                    msg.edit({ embeds: [TradeEmbed] }).catch(() => { })
                }

            }).catch(() => {
                
                embed.setColor('RED')
                msg.edit({ embeds: [embed] }).catch(() => { })
            })
        })
    }
}