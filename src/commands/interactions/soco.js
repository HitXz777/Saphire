const { e } = require('../../../JSON/emojis.json')
const { g } = require('../../../modules/Images/gifs.json')
const Moeda = require('../../../modules/functions/public/moeda')

module.exports = {
    name: 'soco',
    aliases: ['punch', 'socar'],
    category: 'interactions',
    
    ClientPermissions: ['EMBED_LINKS', 'ADD_REACTIONS'],
    emoji: `${e.SaphireQ}`,
    usage: '<soco> [@user]',
    description: 'Dê um soco em quem merece',
    execute: async (client, message, args, prefix, MessageEmbed, Database) => {

        let rand = g.Soco[Math.floor(Math.random() * g.Soco.length)],
            user = message.mentions.members.first() || message.mentions.repliedUser

        if (!user) return message.reply(`${e.Info} | Marca alguém.`)

        if (user.id === client.user.id) {
            Database.subtract(message.author.id, 40);
            return message.reply(`${e.Deny} | Por tentar me bater, você perdeu 40 ${await Moeda(message)}, baka!`)
        }

        if (user.id === message.author.id) { return message.reply(`${e.Deny} | Não bata em você mesmo, poxa...`) }

        const embed = new MessageEmbed()
            .setColor('#246FE0')
            .setDescription(`${e.GunRight} | ${message.author} está dando socos em você ${user}`)
            .setImage(rand)
            .setFooter({ text: '🔁 retribuir' })

        return message.reply({ embeds: [embed] }).then(msg => {
            
            msg.react('🔁').catch(() => { }) // Check

            const filter = (reaction, u) => { return ['🔁'].includes(reaction.emoji.name) && u.id === user.id }

            msg.awaitReactions({ filter, max: 1, time: 15000, errors: ['time'] }).then(collected => {
                const reaction = collected.first()

                if (reaction.emoji.name === '🔁') {
                    
                    const TradeEmbed = new MessageEmbed().setColor('RED').setDescription(`${message.author} e ${user} estão trocando socos!`).setImage(g.Soco[Math.floor(Math.random() * g.Soco.length)])
                    msg.edit({ embeds: [TradeEmbed] }).catch(() => { })
                }

            }).catch(() => {
                
                embed.setColor('RED').setDescription(`${e.Deny} | ${message.author} deu socos em ${user} e ele(a) saiu correndo.`)
                msg.edit({ embeds: [embed] }).catch(() => { })
            })
        })
    }
}