const { e } = require('../../../JSON/emojis.json')

module.exports = {
    name: 'block',
    aliases: ['nosend'],
    category: 'admin',
    ClientPermissions: ['ADD_REACTIONS'],
    emoji: `${e.OwnerCrow}`,
    admin: true,
    usage: '<block> <ID> | <remove>',
    description: 'Permite meus administradores des/bloquear usuários que abusam do comando bug',

    execute: async (client, message, args, prefix, MessageEmbed, Database) => {

        let data = await Database.Client.findOne({ id: client.user.id }, 'BlockedUsers'),
            bloqueados = data.BlockedUsers || [],
            emojis = ['✅', '❌']

        if (['remove', 'del', 'tirar', 'off'].includes(args[0]?.toLowerCase())) {

            let id = args[1]

            if (!bloqueados.includes(id))
                return message.reply(`${e.Deny} | Este ID não está na lista de usuários bloqueados.`)

            await Database.Client.updateOne(
                { id: client.user.id },
                { $pull: { BlockedUsers: args[1] } }
            )

            return message.react(emojis[0]).catch(() => { message.reply(`${e.Check} | Ok`) })
        }

        let id = args[0]
        if (!id) return message.reply(`${e.Deny} | Forneça um ID.`)
        if (id.length !== 18) return message.reply(`${e.Deny} | ID Inválido.`)
        if (isNaN(id)) return message.reply(`${e.Deny} | ID's não possuem letras.`)
        if (args[1]) return message.reply(`${e.Deny} | Nada além do ID.`)

        let user = await client.users.cache.get(id)

        if (!user) {

            const msg = await message.reply(`${e.Deny} | Eu não achei este usuário em nenhum servidor, deseja forçar o block?`)
            for (let i of emojis) msg.react(i).catch(() => { })

            return msg.awaitReactions({
                filter: (reaction, user) => emojis.includes(reaction.emoji.name) && user.id === message.author.id,
                max: 1,
                time: 15000,
                errors: ['time']
            }).then(async collected => {
                const reaction = collected.first()

                if (reaction.emoji.name === emojis[0]) {

                    await Database.Client.updateOne(
                        { id: client.user.id },
                        { $push: { BlockedUsers: id } }
                    )

                    return msg.edit(`${e.Check} | Bloqueio do usuário *\`${id}\`* efetuado sucesso!`).catch(() => { })
                }

                return msg.edit(`${e.Deny} | Request abortada.`).catch(() => { })


            }).catch(() => msg.edit(`${e.Deny} | Request abortada. | Tempo expirado.`).catch(() => { }))

        }

        const msg = await message.reply(`${e.QuestionMark} | Deseja bloquear este usuário dos meus comandos inter-servidor?`)
        for (let i of emojis) msg.react(i).catch(() => { })

        return msg.awaitReactions({
            filter: (reaction, user) => emojis.includes(reaction.emoji.name) && user.id === message.author.id,
            max: 1,
            time: 15000,
            errors: ['time']
        }).then(async collected => {
            const reaction = collected.first()

            if (reaction.emoji.name === emojis[0]) {

                await Database.Client.updateOne(
                    { id: client.user.id },
                    { $push: { BlockedUsers: id } }
                )
                return msg.edit(`${e.Check} | Bloqueio do usuário *\`${id}\`* efetuado sucesso!`).catch(() => { })
            }

            return msg.edit(`${e.Deny} | Request abortada.`).catch(() => { })


        }).catch(() => msg.edit(`${e.Deny} | Request abortada. | Tempo expirado.`).catch(() => { }))



    }
}