const { g } = require('../../../modules/Images/gifs.json')
const { e } = require('../../../JSON/emojis.json')

module.exports = {
    name: 'hug',
    aliases: ['abraçar', 'abraço'],
    category: 'interactions',
    
    ClientPermissions: ['EMBED_LINKS', 'ADD_REACTIONS'],
    emoji: '🫂',
    usage: '<hug> <@user>',
    description: 'Abraçar é tããão bom',

    execute: async (client, message, args, prefix, MessageEmbed, Database) => {

        let rand = g.Hug[Math.floor(Math.random() * g.Hug.length)],
            user = client.getUser(client, message, args, 'member')

        if (!user) return message.reply(`${e.Info} | Marca alguém.`)

        if (user.id === client.user.id) {
            return message.reply({
                embeds: [
                    new MessageEmbed()
                        .setColor('#246FE0')
                        .setDescription(`🫂 | Meu abraço é o melhor do mundo`)
                        .setImage(rand)
                ]
            })
        }
        if (user.id === message.author.id) {
            return message.reply({
                embeds: [
                    new MessageEmbed()
                        .setColor('#246FE0')
                        .setDescription(`🫂 | ${message.author} se abraçando`)
                        .setImage(rand)
                ]
            })
        }

        const embed = new MessageEmbed()
            .setColor('#246FE0')
            .setDescription(`🫂 | ${message.author} está abraçando você ${user}`)
            .setImage(rand)
            .setFooter({ text: '🔁 retribuir' })

        return message.reply({ embeds: [embed] }).then(msg => {
            
            msg.react('🔁').catch(() => { }) // Check

            const filter = (reaction, u) => { return ['🔁'].includes(reaction.emoji.name) && u.id === user.id }

            msg.awaitReactions({ filter, max: 1, time: 15000, errors: ['time'] }).then(collected => {
                const reaction = collected.first()

                if (reaction.emoji.name === '🔁') {
                    
                    const TradeEmbed = new MessageEmbed().setColor('RED').setDescription(`🫂 ${user} retribuiu o abraço de ${message.author} 🫂`).setImage(g.Hug[Math.floor(Math.random() * g.Hug.length)])
                    msg.edit({ embeds: [TradeEmbed] }).catch(() => { })
                }

            }).catch(() => {
                
                embed.setColor('RED')
                msg.edit({ embeds: [embed] }).catch(() => { })
            })
        })
    }
}