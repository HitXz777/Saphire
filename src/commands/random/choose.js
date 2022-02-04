const { e } = require('../../../database/emojis.json')

module.exports = {
    name: 'choose',
    aliases: ['escolhar', 'escolha'],
    category: 'random',
    emoji: `${e.QuestionMark}`,
    usage: '<escolha> <opções...>',
    description: 'Deixa que eu escolho pra você',

    run: async (client, message, args, prefix, db, MessageEmbed, request, sdb) => {

        if (!args[0]) return message.channel.send(`${e.Info} | Me de opções que eu escolho uma delas.\n> \`${prefix}choose opção1, opção2, opção3\``)
        if (!args[1]) return message.channeel.send(`${e.Deny} | Eu preciso de mais de 1 opção pra fazer uma escolha...`)

        let answer = args[Math.floor(Math.random() * options.length)]

        return message.channel.send(`${e.Hmmm}... Eu escolho: ${answer.replace(/,|-/g, '')}`)

    }
}