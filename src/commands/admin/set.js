const { e } = require('../../../JSON/emojis.json'),
    { config } = require('../../../JSON/config.json')

module.exports = {
    name: 'set',
    aliases: ['setar'],
    category: 'admin',
    admin: true,
    emoji: e.Admin,
    usage: '<set> <class> <user> <value>',
    description: 'Permite meus administradores setar valores nos meus sistemas',

    run: async (client, message, args, prefix, MessageEmbed, Database) => {

        let user = client.users.cache.get(args[1]) || message.mentions.users.first() || message.mentions.repliedUser

        if (!user) return message.reply(`${e.Deny} | Nenhum usuário mencionado`)

        if (['level', 'l', 'lvl'].includes(args[0]?.toLowerCase())) return SetNewLevel()
        if (['adm', 'administrator', 'administrador'].includes(args[0]?.toLowerCase())) return setNewAdministrator()
        if (['money', 'm', 'cash', 'bal', 'balance', 'dinheiro'].includes(args[0]?.toLowerCase())) return setBalance()
        return message.reply(`${e.Info} | Comando não encontrado na lista de opções.\n> Opções: level | money`)

        async function setNewAdministrator() {

            if (message.author.id !== config.ownerId)
                return message.reply(`${e.Deny} | Este comando é restrito apenas para meu criador.`)

            let clientData = await Database.Client.findOne({ id: client.user.id }, 'Administradores'),
                adms = clientData?.Administradores || []

            if (adms.includes(user.id))
                return message.reply(`${e.Deny} | ${user.tag} já é um administrador.`)

            await Database.Client.updateOne(
                { id: client.user.id },
                { $push: { Administradores: user.id } },
                { upsert: true }
            )

            user.send(`Parabéns! Você agora é um **${e.Admin} Official Administrator** do meu sistema.`).catch(err => {
                if (err.code === 50007)
                    return message.reply(`${e.Deny} | Não foi possível contactar este usuário.`)

                Error(message, err)
            })
            return message.reply(`${e.Check} | **${user.username} *\`${user.id}\`*** agora é um ${e.Admin} Administrador*(a)*.`)

        }

        async function SetNewLevel() {

            let NewLevel = parseInt(args[2]) || parseInt(args[1])

            if (!NewLevel || isNaN(NewLevel))
                return message.reply(`${e.Deny} | O argumento "New Level" não foi dado ou não é um número.`)

            await Database.User.updateOne(
                { id: user.id },
                { Level: NewLevel }
            )

            return message.reply(`${e.Check} | O level de ${user.tag} foi reconfigurado para **${NewLevel}**`)

        }

        async function setBalance() {

            let NewBalance = parseInt(args[2]) || parseInt(args[1])

            if (!NewBalance || isNaN(NewBalance))
                return message.reply(`${e.Deny} | O argumento "New Balance" não foi dado ou não é um número.`)

            await Database.User.updateOne(
                { id: user.id },
                { Balance: NewBalance }
            )
            Database.PushTransaction(user.id, `${e.Admin} Um administrador reconfigurou o dinheiro para ${NewBalance} Safiras.`)

            return message.reply(`${e.Check} | O dinheiro de ${user.tag} foi reconfigurado para **${NewBalance}**`)
        }

    }
}