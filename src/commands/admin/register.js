const { e } = require('../../../JSON/emojis.json')

module.exports = {
    name: 'register',
    aliases: ['registro', 'registrar', 'regis'],
    category: 'admin',
    admin: true,
    emoji: e.Admin,
    usage: '<register> <user/guild> <@user/guild>',
    description: 'Registra um usuário ou servidor na minha database',

    run: async (client, message, args, prefix, MessageEmbed, Database) => {

        if (!args[0]) return message.reply(`${e.Info} | Para registar um usuário na database, diga o \`id, @marque, responda a mensagem\` do usuário.\n${e.Info} | Para registar um servidor, mande uma mensagem no servidor ou diga o ID.\n \n> Comando: \`${prefix}register user/server <id>\``)

        if (['user', 'membro', 'usuário', 'usuario'].includes(args[0]?.toLowerCase())) return registerUser()
        if (['guild', 'server', 'servidor'].includes(args[0]?.toLowerCase())) return registerServer()
        return message.reply(`${e.Deny} | Comando inválido. Tente assim: \`${prefix}register user/server <id>\``)

        async function registerUser() {

            let user = client.users.cache.get(args[1]) || message.mentions.users.first() || message.mentions.repliedUser

            if (!user) return message.reply(`${e.Deny} | Nenhum usuário encontrado.`)
            if (user.bot) return message.reply(`${e.Deny} | Bots não são registrados no banco de dados.`)

            let userData = await Database.User.findOne({ id: user.id }),
                clientData = await Database.Client.findOne({ id: client.user.id }, 'Blacklist.Users'),
                blocksArray = clientData?.Blacklist?.Users || []

            if (blocksArray.some(data => data?.id === user.id))
                return message.reply(`${e.Deny} | Este usuário está na blacklist.`)

            if (userData) return message.reply(`${e.Deny} | Este usuário já foi registrado na minha database.`)

            Database.registerUser(user)
            return message.reply(`${e.Check} | **${user.tag} *\`(${user.id})\`*** foi registrado com sucesso no banco de dados.`)
        }

        async function registerServer() {

            let guild = client.guilds.cache.get(args[1])

            if (!guild) return message.reply(`${e.Deny} | Nenhum servidor encontrado.`)

            let guildData = await Database.Guild.findOne({ id: guild.id })

            if (guildData) return message.reply(`${e.Deny} | Este servidor já foi registrado na minha database.`)

            Database.registerServer(guild, client)
            return message.reply(`${e.Check} | **${guild.name} *\`(${guild.id})\`*** foi registrado com sucesso no banco de dados.`)
        }
    }
}
