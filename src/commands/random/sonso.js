const { e } = require('../../../JSON/emojis.json')

module.exports = {
    name: 'sonso',
    aliases: ['sonsa'],
    category: 'random',
    emoji: '😏',
    usage: '<sonso(a)> [@user]',
    description: 'Quantos % @user é sonso(a)?',

    execute: async (client, message, args, prefix, MessageEmbed, Database) => {

        let num = Math.floor(Math.random() * 100) + 1
        let user = client.getUser(client, message, args, 'member') || message.member

        if (user.id === client.user.id) { return message.reply(`${e.SaphireTimida} | Eu não sou gada, sai pra lá.`) }

        return message.reply(`🙃 | Pelo histórico de vida de ${user}, posso falar que é ${num}% sonso*(a)*.`)
    }
}