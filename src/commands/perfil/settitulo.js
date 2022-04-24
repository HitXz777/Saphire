const { e } = require('../../../JSON/emojis.json')

module.exports = {
    name: 'settitulo',
    aliases: ['titulo', 'settitle', 'title', 'título'],
    category: 'perfil',
    ClientPermissions: ['ADD_REACTIONS'],
    emoji: '🔰',
    usage: '<setitulo> <Seu Título>',
    description: 'Escolha um título grandioso',

    run: async (client, message, args, prefix, MessageEmbed, Database) => {

        let data = await Database.User.findOne({ id: message.author.id }, 'Perfil.TitlePerm Perfil.Titulo'),
            perm = data.Perfil?.TitlePerm,
            title = data.Perfil?.Titulo

        return perm ? AlterarTitulo() : message.reply(`${e.Deny} | Você não tem a permissão 🔰 **Título**. Você pode compra-la na \`${prefix}loja\``)

        async function AlterarTitulo() {

            if (!args[0]) return message.reply(`${e.SaphireObs} | Você precisa me dizer qual o seu novo título.`)

            let NewTitle = args.join(' ') || 'Indefinido'
            if (NewTitle.length > 20) return message.reply(`${e.Deny} | O título não pode ultrapassar **20 caracteres**`)

            let BlockWords = ['undefined', 'false', 'null', 'nan']
            for (const word of BlockWords)
                if (NewTitle.toLowerCase() === word)
                    return message.channel.send(`${e.Deny} | ${message.author}, somente a palavra **${word}** é proibida neste comando. Escreva algo mais.`)

            if (NewTitle === title) return message.reply(`${e.Info} | Este já é o seu Título atual.`)

            const msg = await message.reply(`${e.QuestionMark} | Deseja alterar seu título para: **${NewTitle}** ?`)

            msg.react('✅').catch(() => { }) // Check
            msg.react('❌').catch(() => { }) // X

            return msg.awaitReactions({
                filter: (reaction, user) => ['✅', '❌'].includes(reaction.emoji.name) && user.id === message.author.id,
                max: 1,
                time: 15000,
                errors: ['time']
            }).then(collected => {
                const reaction = collected.first()

                if (reaction.emoji.name === '✅') {
                    Database.updateUserData(message.author.id, 'Perfil.Titulo', NewTitle)
                    return msg.edit(`${e.Check} | Você alterou seu título com sucesso! Confira usando \`${prefix}perfil\``)
                }

                return msg.edit(`${e.Deny} | Request cancelada.`)

            }).catch(() => msg.edit(`${e.Deny} | Request cancelada por tempo expirado.`))

        }

    }
}