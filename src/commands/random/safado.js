const { e } = require('../../../database/emojis.json')

module.exports = {
    name: 'safado',
    aliases: ['safada'],
    category: 'random',
    emoji: '😏',
    usage: '<safado(a)> [@user]',
    description: 'Quantos % @user é safado(a)?',

    run: async (client, message, args, prefix, db, MessageEmbed, request, sdb) => {

        let num = Math.floor(Math.random() * 100) + 1
        let user = message.mentions.members.first() || message.mentions.repliedUser || message.member

        if (user.id === client.user.id) { return message.reply(`${e.SaphireTimida} | Eu não sou gada, sai pra lá.`) }

        return message.reply(`😏 | Posso falar com certeza, que ${user} é ${num}% safado*(a)*.`)
    }
}