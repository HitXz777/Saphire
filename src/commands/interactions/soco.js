const { e } = require('../../../database/emojis.json')
const { g } = require('../../../Routes/Images/gifs.json')
const { f } = require('../../../database/frases.json')
const Moeda = require('../../../Routes/functions/moeda')

module.exports = {
    name: 'soco',
    aliases: ['punch', 'socar'],
    category: 'interactions',
    
    ClientPermissions: ['EMBED_LINKS', 'ADD_REACTIONS'],
    emoji: `${e.SaphireQ}`,
    usage: '<soco> [@user]',
    description: 'Dê um soco em quem merece',
    run: async (client, message, args, prefix, db, MessageEmbed, request, sdb) => {

        if (request) return message.reply(`${e.Deny} | ${f.Request}${sdb.get(`Request.${message.author.id}`)}`)

        let NoReactAuthor = sdb.get(`Users.${message.author.id}.NoReact`)
        if (NoReactAuthor) return message.reply(`${e.Deny} | Você está com o \`${prefix}noreact\` ativado.`)

        let rand = g.Soco[Math.floor(Math.random() * g.Soco.length)]
        let user = message.mentions.users.first() || message.member

        if (user.id === client.user.id) {
            sdb.subtract(`Users.${message.author.id}.Balance`, 40);
            return message.reply(`${e.Deny} | Por tentar me bater, você perdeu 40 ${Moeda(message)}, baka!`)
        }

        if (user.id === message.author.id) { return message.reply(`${e.Deny} | Não bata em você mesmo, poxa...`) }

        let NoReact = sdb.get(`Users.${user.id}.NoReact`)
        if (NoReact) return message.reply(`${e.Deny} | Este usuário está com o \`${prefix}noreact\` ativado.`)

        const embed = new MessageEmbed()
            .setColor('#246FE0')
            .setDescription(`${e.GunRight} | ${message.author} está dando socos em você ${user}`)
            .setImage(rand)
            .setFooter('🔁 retribuir')

        return message.reply({ embeds: [embed] }).then(msg => {
            sdb.set(`Request.${message.author.id}`, `${msg.url}`)
            msg.react('🔁').catch(() => { }) // Check

            const filter = (reaction, u) => { return ['🔁'].includes(reaction.emoji.name) && u.id === user.id }

            msg.awaitReactions({ filter, max: 1, time: 15000, errors: ['time'] }).then(collected => {
                const reaction = collected.first()

                if (reaction.emoji.name === '🔁') {
                    sdb.delete(`Request.${message.author.id}`)
                    const TradeEmbed = new MessageEmbed().setColor('RED').setDescription(`${message.author} e ${user} estão trocando socos!`).setFooter(`${message.author.id}/${user.id}`).setImage(g.Soco[Math.floor(Math.random() * g.Soco.length)])
                    msg.edit({ embeds: [TradeEmbed] }).catch(() => { })
                }

            }).catch(() => {
                sdb.delete(`Request.${message.author.id}`)
                embed.setColor('RED').setDescription(`${e.Deny} | ${message.author} deu socos em ${user} e ele(a) saiu correndo.`).setFooter(`${message.author.id}/${user.id}`)
                msg.edit({ embeds: [embed] }).catch(() => { })
            })
        })
    }
}