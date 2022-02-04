const { e } = require('../../../database/emojis.json')

module.exports = {
    name: 'gay',
    aliases: ['gai', 'guey', 'guei', 'yag'],
    category: 'random',
    emoji: '🏳️‍🌈',
    usage: '<gay> [@user]',
    description: 'Quanto % @user é gay?',

    run: async (client, message, args, prefix, db, MessageEmbed, request, sdb) => {

        let num = Math.floor(Math.random() * 100) + 1,
            user = message.mentions.members.first() || message.member,
            Emoji = num > 60 ? e.PepeLgbt : '🏳️‍🌈'

        if (user.id === client.user.id) return message.reply('Eu não tenho gênero, eu acho.')

        return message.reply(`${Emoji} | Pela minha análise, ${user} é ${num}% gay.`)
    }
}