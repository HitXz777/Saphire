const { g } = require('../../../Routes/Images/gifs.json')
const { e } = require('../../../database/emojis.json')
const { f } = require('../../../database/frases.json')
const Moeda = require('../../../Routes/functions/moeda')

module.exports = {
    name: 'chutar',
    aliases: ['chute'],
    category: 'interactions',
    ClientPermissions: ['EMBED_LINKS', 'ADD_REACTIONS'],
    emoji: '🦶',
    usage: '<chutar> <@user>',
    description: 'Chute alguém',

    run: async (client, message, args, prefix, db, MessageEmbed, request, sdb) => {

        if (request) return message.reply(`${e.Deny} | ${f.Request}${sdb.get(`Request.${message.author.id}`)}`)

        if (sdb.get(`Users.${message.author.id}.NoReact`)) return message.reply(`${e.Deny} | Você está com o \`${prefix}noreact\` ativado.`)

        let rand = g.Chutar[Math.floor(Math.random() * g.Chutar.length)]
        let user = message.mentions.users.first() || message.member

        if (user.id === client.user.id)
            return message.reply(`${e.Deny} | Ta querendo morrer?`)

        if (user.id === message.author.id) return message.reply(`${e.Deny} | Chutar você mesmo? Você é estranho`)

        if (sdb.get(`Users.${user.id}.NoReact`)) return message.reply(`${e.Deny} | Este usuário está com o \`${prefix}noreact\` ativado.`)

        const embed = new MessageEmbed()
            .setColor('#246FE0')
            .setDescription(`🦶 | ${message.author} está chutando você ${user}`)
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
                    const TradeEmbed = new MessageEmbed().setColor('RED').setDescription(`🦶 ${message.author} e ${user} estão trocando chutes! 🦶`).setFooter(`${message.author.id}/${user.id}`).setImage(g.Chutar[Math.floor(Math.random() * g.Chutar.length)])
                    msg.edit({ embeds: [TradeEmbed] }).catch(() => { })
                }

            }).catch(() => {
                sdb.delete(`Request.${message.author.id}`)
                embed.setColor('RED').setFooter(`${message.author.id}/${user.id}`)
                msg.edit({ embeds: [embed] }).catch(() => { })
            })
        })
    }
}