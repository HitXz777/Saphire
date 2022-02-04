const { g } = require('../../../Routes/Images/gifs.json')
const { e } = require('../../../database/emojis.json')
const { f } = require('../../../database/frases.json')

module.exports = {
    name: 'pisar',
    aliases: ['stomp'],
    category: 'interactions',
    ClientPermissions: ['EMBED_LINKS', 'ADD_REACTIONS'],
    emoji: '👞',
    usage: '<pisar> <@user>',
    description: 'Pisa, pisa, pisa!',

    run: async (client, message, args, prefix, db, MessageEmbed, request, sdb) => {

        if (request) return message.reply(`${e.Deny} | ${f.Request}${sdb.get(`Request.${message.author.id}`)}`)

        let NoReactAuthor = sdb.get(`Users.${message.author.id}.NoReact`)
        if (NoReactAuthor) return message.reply(`${e.Deny} | Você está com o \`${prefix}noreact\` ativado.`)

        let rand = g.Pisar[Math.floor(Math.random() * g.Pisar.length)]
        let user = message.mentions.users.first() || message.member

        if (user.id === client.user.id) return message.reply({
            content: 'Baka, baka, baka!',
            embeds: [
                new MessageEmbed()
                    .setColor('#246FE0')
                    .setDescription(`${user} está pisando em ${message.author}`)
                    .setImage(rand)
            ]
        })

        if (user.id === message.author.id) { return message.reply(`${e.Deny} | Não faça isso com você!`) }

        let NoReact = sdb.get(`Users.${user.id}.NoReact`)
        if (NoReact) return message.reply(`${e.Deny} | Este usuário está com o \`${prefix}noreact\` ativado.`)

        const embed = new MessageEmbed()
            .setColor('#246FE0')
            .setDescription(`👞 ${message.author} pisou em você ${user}`)
            .setImage(rand)

        return message.reply({ embeds: [embed] })
    }
}