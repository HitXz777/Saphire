const { e } = require('../../../database/emojis.json')

module.exports = {
    name: 'sonso',
    aliases: ['sonsa'],
    category: 'random',
    emoji: '😏',
    usage: '<sonso(a)> [@user]',
    description: 'Quantos % @user é sonso(a)?',

    run: async (client, message, args, prefix, db, MessageEmbed, request, sdb) => {

        let num = Math.floor(Math.random() * 100) + 1
        let user = message.mentions.members.first() || message.mentions.repliedUser || message.member

        if (user.id === client.user.id) { return message.reply(`${e.SaphireTimida} | Eu não sou gada, sai pra lá.`) }

        return message.reply(`🙃 | Pelo histórico de vida de ${user}, posso falar que é ${num}% sonso*(a)*.`)
    }
}