const { e } = require('../../../database/emojis.json')

module.exports = {
    name: 'howbig',
    aliases: ['tamanho'],
    category: 'random',
    ClientPermissions: ['EMBED_LINKS'],
    emoji: '🍆',
    usage: '<howbig> [@user]',
    description: 'Confira o tamanho do brinquedo',

    run: async (client, message, args, prefix, db, MessageEmbed, request, sdb) => {

        let user = message.mentions.users.first() || await client.users.cache.get(args[0]) || message.mentions.repliedUser || message.author
        if (!user) return message.reply(`${e.Deny} | Não achei ninguém...`)
        if (user.id === client.user.id) return message.reply(`${e.Deny} | Eu não tenho essa coisa, para com isso!`)
        if (sdb.get(`Users.${message.author.id}.NoReact`)) return message.reply(`${e.Deny} | Você está com o \`${prefix}noreact\` ativado.`)
        if (sdb.get(`Users.${user.id}.NoReact`)) return message.reply(`${e.Deny} | ${user.tag} está com o \`${prefix}noreact\` ativado.`)

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

        let piiiinto = array[Math.floor(Math.random() * array.length)],
            Piiinto = new MessageEmbed()
                .setColor('#246FE0')
                .setTitle(`🍆 | Tamanho do brinquedo de ${user.username}`)
                .setDescription(piiiinto)

        return message.reply({ embeds: [Piiinto] })
    }
}