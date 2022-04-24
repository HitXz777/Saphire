const { e } = require('../../../JSON/emojis.json')
const { f } = require('../../../JSON/frases.json')

module.exports = {
    name: 'setstatus',
    aliases: ['status'],
    category: 'perfil',
    ClientPermissions: ['ADD_REACTIONS'],
    emoji: '✍️',
    usage: '<setstatus> <Seu Novo Status>',
    description: 'Defina seu status no perfil',

    run: async (client, message, args, prefix, MessageEmbed, Database) => {

        if (!args[0]) return message.reply(`${e.SaphireObs} | Você precisa me dizer qual o seu novo status.`)

        let NewStatus = args.join(' ') || 'Indefinido'
        if (NewStatus.length > 140) return message.reply(`${e.Deny} | O status não pode ultrapassar **140 caracteres**`)

        let BlockWords = ['undefined', 'false', 'null', 'nan', '@everyone', '@here']
        for (const word of BlockWords)
            if (NewStatus.includes(word))
                return message.channel.send(`${e.Deny} | ${message.author}, O seu status tem palavras proibidas pelo meu sistema.`)

        let data = await Database.User.findOne({ id: message.author.id }, 'Perfil.Status')

        let status = data.Perfil?.Status
        if (status === NewStatus) return message.reply(`${e.Info} | Este é exatamente o seu status atual.`)

        const msg = await message.reply(`${e.QuestionMark} | Deseja alterar seu status para:\n**${NewStatus}**`)
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

                Database.updateUserData(message.author.id, 'Perfil.Status', NewStatus)
                return msg.edit(`${e.Check} | Você alterou seu status com sucesso! Confira usando \`${prefix}perfil\``)
            }

            return msg.edit(`${e.Deny} | Request cancelada.`)

        }).catch(() => msg.edit(`${e.Deny} | Request cancelada por tempo expirado.`))

    }

}