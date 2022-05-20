const { g } = require('../../../modules/Images/gifs.json')
const { e } = require('../../../JSON/emojis.json')

module.exports = {
    name: 'dedo',
    aliases: ['dedodomeio'],
    category: 'interactions',
    
    ClientPermissions: ['EMBED_LINKS', 'ADD_REACTIONS'],
    emoji: '🖕',
    usage: '<dedo> <@user>',
    description: 'Dedo do meio, bem feio',

    execute: async (client, message, args, prefix, MessageEmbed, Database) => {

        let rand = g.Dedo[Math.floor(Math.random() * g.Dedo.length)],
            user = message.mentions.members.first() || message.mentions.repliedUser

        if (!user) return message.reply(`${e.Info} | Marca alguém.`)

        if (user.id === client.user.id) return message.reply(`... ${e.SadPanda}`)

        if (user.id === message.author.id) { return message.reply(`${e.SaphireQ} | Pqe faria isso?`) }

        const embed = new MessageEmbed()
            .setColor('#246FE0')
            .setDescription(`🖕 | ${message.author} está mostrando o dedo pra você ${user}`)
            .setImage(rand)
            .setFooter({ text: '🔁 retribuir' })

        return message.reply({ embeds: [embed] }).then(msg => {
            
            msg.react('🔁').catch(() => { }) // Check

            const filter = (reaction, u) => { return ['🔁'].includes(reaction.emoji.name) && u.id === user.id }

            msg.awaitReactions({ filter, max: 1, time: 15000, errors: ['time'] }).then(collected => {
                const reaction = collected.first()

                if (reaction.emoji.name === '🔁') {
                    
                    const TradeEmbed = new MessageEmbed().setColor('RED').setDescription(`🖕 ${message.author} e ${user} estão trocando dedos! 🖕`).setImage(g.Dedo[Math.floor(Math.random() * g.Dedo.length)])
                    msg.edit({ embeds: [TradeEmbed] }).catch(() => { })
                }

            }).catch(() => {
                
                embed.setColor('RED')
                msg.edit({ embeds: [embed] }).catch(() => { })
            })
        })
    }
}