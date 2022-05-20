const { e } = require('../../../JSON/emojis.json')

module.exports = {
    name: 'kick',
    aliases: ['expulsar', 'retirar'],
    category: 'moderation',
    UserPermissions: ['KICK_MEMBERS'],
    ClientPermissions: ['KICK_MEMBERS', 'ADD_REACTIONS'],
    emoji: `${e.ModShield}`,
    usage: '<kick> <@user> [ID]',
    description: 'Expulse membros do servidor',

    execute: async (client, message, args, prefix, MessageEmbed, Database) => {

        let toSearch = message.guild.members.cache.get(args[0]) || message.mentions.members.first() || message.mentions.repliedUser
        let member = message.guild.members.cache.get(toSearch?.id)

        if (!member)
            return message.reply(`${e.Info} | Comando Kick/Expulsar\n \n\`${prefix}kick @user [Razão(opicional)]\` - Expulse alguém do servidor.\n\`${prefix}kick ID [Razão(opicional)]\` - Expulse alguém pelo ID`)

        let reason = args.slice(1).join(" ") || 'Sem motivo informado'

        if (!member.kickable || member?.permissions.toArray()?.find(data => ['ADMINISTRATOR', 'KICK_MEMBERS'].includes(data))) return message.reply(`${e.Deny} | Eu não posso expulsar este usuário.`)
        if (member.id === message.author.id) return message.reply(`${e.Deny} | Foi mal, mas eu não vou te expulsar não.`)

        const msg = await message.reply(`${e.QuestionMark} | Você deseja expulsar ${member} do servidor pelo motivo: **${reason}**`)

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

                return member.kick([`Author do Kick: ${message.author.tag} | ${reason}`]).then(async () => {
                    return msg.edit(`${e.Check} | O membro "${member.user.tag}" foi expulso do servidor sob as ordens de "${message.author}" com o motivo: "${reason}"`).catch(() => { })
                }).catch(err => msg.edit(`${e.Deny} | Houve algo incomum na execução da expulsão. Caso não saiba resolver, use o comando \`${prefix}bug\` ou procure ajuda no meu servidor \`${prefix}servers\`\n\`${err}\``).catch(() => { }))

            }

            return msg.edit(`${e.Deny} | Request cancelada | ${message.author.id}`).catch(() => { })

        }).catch(() => msg.edit(`${e.Deny} | Request cancelada: Tempo expirado | ${message.author.id}`).catch(() => { }))

    }
}