const { e } = require('../../../JSON/emojis.json')

module.exports = {
    name: 'howbig',
    aliases: ['tamanho'],
    category: 'random',
    ClientPermissions: ['EMBED_LINKS'],
    emoji: '🍆',
    usage: '<howbig> [@user]',
    description: 'Confira o tamanho do brinquedo',

    run: async (client, message, args, prefix, MessageEmbed, Database) => {

        let user = message.mentions.users.first() || client.users.cache.find(data => data.username?.toLowerCase() === args.join(' ')?.toLowerCase() || data.tag?.toLowerCase() === args[0]?.toLowerCase() || data.discriminator === args[0] || data.id === args[0]) || message.mentions.repliedUser || message.author
        if (!user) return message.reply(`${e.Deny} | Não achei ninguém...`)
        if (user.id === client.user.id) return message.reply(`${e.Deny} | Eu não tenho essa coisa, para com isso!`)

        let array = [
            '3====================D',
            '3===================D',
            '3==================D',
            '3=================D',
            '3================D',
            '3===============D',
            '3==============D',
            '3=============D',
            '3============D',
            '3===========D',
            '3==========D',
            '3=========D',
            '3========D',
            '3=======D',
            '3======D',
            '3=====D',
            '3====D',
            '3===D',
            '3==D',
            '3=D',
            'Não achei nada aqui :cry:'
        ]

        return message.reply({
            embeds: [
                new MessageEmbed()
                    .setColor('#246FE0')
                    .setTitle(`🍆 | Tamanho do brinquedo de ${user.username}`)
                    .setDescription(array[Math.floor(Math.random() * array.length)])
            ]
        })
    }
}