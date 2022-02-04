const { e } = require('../../../database/emojis.json')

module.exports = {
    name: 'trabalho',
    aliases: ['profissão', 'job', 'profissao', 'setprofissão'],
    category: 'perfil',
    emoji: '👷',
    usage: '<job> ~~ Sua profissão',
    description: 'Defina um trabalho no seu perfil',

    run: async (client, message, args, prefix, db, MessageEmbed, request, sdb) => {

        let Job = sdb.get(`Users.${message.author.id}.Perfil.Trabalho`) || false

        if (!args[0]) return message.channel.send(`${e.SaphireObs} | Escolha uma profissão pro ser perfil. Você pode usar o comando assim: \`${prefix}job Bombeiro\``)

        let NewJob = args.join(' ') || 'Indefinido'

        let BlockWords = ['undefined', 'false', 'null', 'nan']
        for (const word of BlockWords) {
            if (NewJob.toLowerCase() === word)
                return message.channel.send(`${e.Deny} | ${message.author}, somente a palavra **${word}** é proibida neste comando. Escreva algo mais.`)
        }

        if (NewJob === Job) return message.reply(`${e.SaphireEntaoKkk} | Então... Esse já é o seu trabalho definido.`).catch(() => { })
        if (NewJob.length > 20 || NewJob.length < 4) return message.reply(`${e.SaphireRaiva} | O tamanho limite é de **4~~20 caracteres**.`).catch(() => { })

        sdb.set(`Users.${message.author.id}.Perfil.Trabalho`, NewJob)
        return message.reply(`${e.SaphireFeliz} | Trabalhos definido com sucesso! Você pode vê-lo no seu perfil!`).catch(() => { })
    }
}