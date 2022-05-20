const { e } = require('../../../JSON/emojis.json')

module.exports = {
    name: 'trabalho',
    aliases: ['profissão', 'job', 'profissao', 'setprofissão'],
    category: 'perfil',
    emoji: '👷',
    usage: '<job> ~~ Sua profissão',
    description: 'Defina um trabalho no seu perfil',

    execute: async (client, message, args, prefix, MessageEmbed, Database) => {

        let data = await Database.User.findOne({ id: message.author.id }, 'Perfil.Trabalho'),
            Job = data.Perfil?.Trabalho

        if (['off', 'deletar', 'del', 'excluir', 'apagar'].includes(args[0]?.toLowerCase())) return delData()

        if (!args[0]) return message.channel.send(`${e.SaphireObs} | Escolha uma profissão para o seu perfil. Você pode usar o comando assim: \`${prefix}job Bombeiro\``)

        let NewJob = args.join(' ') || 'Indefinido'

        let BlockWords = ['undefined', 'false', 'null', 'nan', '@everyone', '@here']
        for (const word of BlockWords)
            if (NewJob.includes(word))
                return message.channel.send(`${e.Deny} | ${message.author}, a palavra **${word}** é proibida neste comando. Escreva algo mais.`)

        if (NewJob === Job) return message.reply(`${e.SaphireEntaoKkk} | Então... Esse já é o seu trabalho definido.`).catch(() => { })
        if (NewJob.length > 20 || NewJob.length < 4) return message.reply(`${e.SaphireRaiva} | O tamanho limite é de **4~~20 caracteres**.`).catch(() => { })

        Database.updateUserData(message.author.id, 'Perfil.Trabalho', NewJob)
        return message.reply(`${e.SaphireFeliz} | Trabalhos definido com sucesso! Você pode vê-lo no seu perfil!`).catch(() => { })

        async function delData() {

            if (!Job) return message.reply(`${e.Deny} | Você não tem nenhum trabalho definido para apaga-lo do seu perfil.`)

            await Database.User.updateOne(
                { id: message.author.id },
                {
                    $unset: { ['Perfil.Trabalho']: 1 }
                }
            )

            return message.reply(`${e.Check} | Seu trabalho anterior "**${Job}**" foi deletado com sucesso do seu perfil.`)

        }
    }
}