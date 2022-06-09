const { g } = require('../../../modules/Images/gifs.json')
const { e } = require('../../../JSON/emojis.json')

module.exports = {
    name: 'explodir',
    aliases: ['boom'],
    category: 'interactions',
    
    ClientPermissions: ['EMBED_LINKS', 'ADD_REACTIONS'],
    emoji: '💥',
    usage: '<explodir> <@user>',
    description: 'Explooooooooosion',

    execute: async (client, message, args, prefix, MessageEmbed, Database) => {

        let rand = g.Explodir[Math.floor(Math.random() * g.Explodir.length)],
            user = client.getUser(client, message, args, 'member')

        if (!user) return message.reply(`${e.Info} | Marca alguém.`)

        if (user.id === client.user.id) return message.reply(e.Deidara)

        if (user.id === message.author.id) return message.reply(`Vou te pegar de madrugada viu... Fica de graça`)

        const embed = new MessageEmbed()
            .setColor('#246FE0')
            .setDescription(`💥 | ${message.author} está te explodindo ${user}`)
            .setImage(rand)
            .setFooter({ text: '🔁 retribuir' })

        return message.reply({ embeds: [embed] }).then(msg => {
            
            msg.react('🔁').catch(() => { }) // Check

            const filter = (reaction, u) => { return ['🔁'].includes(reaction.emoji.name) && u.id === user.id }

            msg.awaitReactions({ filter, max: 1, time: 15000, errors: ['time'] }).then(collected => {
                const reaction = collected.first()

                if (reaction.emoji.name === '🔁') {
                    
                    const TradeEmbed = new MessageEmbed().setColor('RED').setDescription(`💥 ${user} e ${message.author} estão se explodindo 💥`).setImage(g.Explodir[Math.floor(Math.random() * g.Explodir.length)])
                    msg.edit({ embeds: [TradeEmbed] }).catch(() => { })
                }

            }).catch(() => {
                
                embed.setColor('RED')
                msg.edit({ embeds: [embed] }).catch(() => { })
            })
        })
    }
}