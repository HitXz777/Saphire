const { e } = require('../../../JSON/emojis.json'),
    Reminder = require('../../../modules/classes/Reminder')

module.exports = {
    name: 'like',
    aliases: ['curtir', 'laique'],
    category: 'perfil',
    emoji: `${e.Like}`,
    usage: '<like> [@user]',
    description: 'Curta quem você gosta',

    execute: async (client, message, args, prefix, MessageEmbed, Database) => {

        let user = message.mentions.users.first() || client.users.cache.find(data => data.username?.toLowerCase() === args.join(' ')?.toLowerCase() || data.tag?.toLowerCase() === args[0]?.toLowerCase() || data.discriminator === args[0] || data.id === args[0]) || message.mentions.repliedUser

        if (!user || user.id === message.author.id) return message.reply(`${e.Like} | @marca, responda a mensagem ou diga o ID da pessoa que deseja dar like.`)

        let dbData = await Database.User.find({ id: { $in: [message.author.id, user?.id] } }, 'id Timeouts.Rep Likes'),
            data = {},
            author = dbData.find(d => d.id === message.author.id)

        data.timeout = author?.Timeouts?.Rep

        if (client.Timeout(1800000, data.timeout))
            return message.reply(`${e.Nagatoro} | Calminha aí Princesa! \`${client.GetTimeout(1800000, data.timeout)}\``)

        if (user.id === client.user.id) return message.reply(`Olha, eu agradeço... Mas você já viu meu \`${prefix}perfil @Saphire\`?`)
        if (user.bot) return message.reply(`${e.Deny} | Sem likes para bots.`)

        let uData = dbData.find(d => d.id === user?.id)

        if (!uData) {
            Database.registerUser(client.users.cache.get(user.id))
            return message.reply(`${e.Database} | Eu não encontrei **${user.tag} *\`${user.id}\`***. Acabei de efetuar o registro. Por favor, use o comando novamente.`)
        }

        data.userLikes = uData?.Likes || 0
        Database.addItem(user.id, 'Likes', 1)
        Database.SetTimeout(message.author.id, 'Timeouts.Rep')

        let msg = await message.reply(`${e.Check} | Você deu um like para ${user.username}.\nAgora, ${user.username} possui um total de ${e.Like} ${data.userLikes + 1} likes.`)
        
        const dateNow = Date.now()

        return new Reminder(msg, {
            time: 1800000, // 24 hours
            user: message.author,
            client: client,
            confirmationMessage: `⏰ | Entendido, ${message.author}! O seu próximo like é daqui \`ReplaceTIMER\`. Então, vou te avisar aqui quando esse tempo acabar, ok?`,
            reminderData: {
                userId: message.author.id,
                RemindMessage: 'AUTOMATIC REMINDER | Like Disponível',
                Time: 1800000,
                DateNow: dateNow,
                isAutomatic: true,
                ChannelId: message.channel.id
            }
        }).showButton()

    }
}