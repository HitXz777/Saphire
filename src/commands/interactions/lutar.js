const { g } = require('../../../modules/Images/gifs.json')
const { e } = require('../../../JSON/emojis.json')

module.exports = {
    name: 'lutar',
    aliases: ['fight', 'brigar', 'briga', 'luta'],
    category: 'interactions',
    ClientPermissions: ['EMBED_LINKS', 'ADD_REACTIONS'],
    emoji: 'vs',
    usage: '<lutar> <@user>',
    description: 'Treta, treta',

    execute: async (client, message, args, prefix, MessageEmbed, Database) => {

        let rand = g.Lutar[Math.floor(Math.random() * g.Lutar.length)],
            user = message.mentions.members.first() || message.mentions.repliedUser

        if (!user) return message.reply(`${e.Info} | Marca alguém.`)

        if (user.id === client.user.id) return message.reply(`${e.Drinking} | Vou nem responder, eu ganharia facilmente...`)

        if (user.id === message.author.id) { return message.reply(`Você é estranho... Quer um psicólogo?`) }

        const embed = new MessageEmbed()
            .setColor('#246FE0')
            .setDescription(`${message.author} está lutando contra ${user}`)
            .setImage(rand)

        return message.reply({ embeds: [embed] }).then(msg => {
            
            msg.react('🔁').catch(() => { }) // Check

            const filter = (reaction, u) => { return ['🔁'].includes(reaction.emoji.name) && u.id === user.id }

            msg.awaitReactions({ filter, max: 1, time: 15000, errors: ['time'] }).then(collected => {
                const reaction = collected.first()

                if (reaction.emoji.name === '🔁') {
                    
                    const TradeEmbed = new MessageEmbed().setColor('RED').setDescription(`${message.author} e ${user} estão lutando`).setImage(g.Lutar[Math.floor(Math.random() * g.Lutar.length)])
                    msg.edit({ embeds: [TradeEmbed] }).catch(() => { })
                }

            }).catch(() => {
                
                embed.setColor('RED')
                msg.edit({ embeds: [embed] }).catch(() => { })
            })
        })
    }
}