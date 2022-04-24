const
    { e } = require('../../../JSON/emojis.json'),
    ms = require('ms'),
    parsems = require('parse-ms')

module.exports = {
    name: 'mute',
    aliases: ['mutar', 'silence', 'castigo', 'castigar', 'punishment'],
    category: 'moderation',
    UserPermissions: ['MODERATE_MEMBERS'],
    ClientPermissions: ['MODERATE_MEMBERS'],
    emoji: '🔇',
    usage: '<mute> <@user> [Tempo] [Motivo]',
    description: 'Mutar membros do servidor',
    run: async (client, message, args, prefix, MessageEmbed, Database) => {

        let user = message.guild.members.cache.get(args[0]) || message.mentions.members.first() || message.mentions.repliedUser,
            emojis = ['✅', '❌'],
            member = message.guild.members.cache.get(user?.id)
            whoIs = message.author.id === user?.id ? 'Você' : user?.user?.username || user?.username

        if (!member)
            return message.reply(`${e.Deny} | Você deve me dizer o tempo do castigo/mute **e** o usuário a ser mutado.\n${e.Info} | Exemplo: \`${prefix}mute @user 1h 10m\` *(d, h, m - Dias, Horas, Minutos)*`)

        if (member.id === message.author.id)
            return message.reply(`${e.Deny} | Você não pode mutar você mesmo, não é?`)

        if (!member.moderatable)
            return message.reply(`${e.Deny} | Ops... ${whoIs} tem muito poder...`)

        if (member.id === client.user.id)
            return message.reply(`${e.Deny} | Não me muta... Que coisa feia!`)

        if (member.permissions.toArray().includes('ADMINISTRATOR'))
            return message.reply(`${e.Deny} | Eu não posso castigar administradores...`)

        let time = validateTime(args),
            validateReactionCollectorCancel = false

        if (time <= 0)
            return message.reply(`${e.Deny} | Tempo inválido. O tempo mínimo suportado é de 1 minuto.\n\`Timeout Bad Formated: ${time}\``)

        const msg = await message.reply(`${e.QuestionMark} | Deseja mutar o usuário **${user?.user?.username || 'Nome indefinido'}** por **${GetTimeout(time)}**`)

        for (const i of emojis) msg.react(i).catch(() => { })

        return msg.createReactionCollector({
            filter: (reaction, u) => emojis.includes(reaction.emoji.name) && u.id === message.author.id,
            time: 30000
        })
            .on('collect', (reaction) => {

                validateReactionCollectorCancel = true

                if (reaction.emoji.name === emojis[0]) {

                    try {

                        member.timeout(time, `Castigo efetuado por ${message.author.tag}`)

                        return msg.edit(`${e.Check} | Mute efetuado com sucesso!`).catch(() => message.channel.send(`${e.Check} | Mute efetuado com sucesso!`))

                    } catch (err) {
                        return msg.edit(`${e.Warn} | Falha ao executar o castigo.\n\`${err}\``).catch(() => `${e.Warn} | Falha ao executar o castigo.\n\`${err}\``)
                    }

                } else {
                    return msg.delete().catch(() => { })
                }

            })

            .on('end', () => {

                if (validateReactionCollectorCancel)
                    return msg.edit(`${e.Deny} | Comando cancelado`).catch(() => { })
                else return

            })

    }
}

function GetTimeout(TimeToCooldown = 0) {

    let Time = parsems(TimeToCooldown),
        Day = Time.days > 0 ? `${Time.days} dias` : '',
        Hours = Time.hours > 0 ? ` ${Time.hours} horas` : '',
        Minutes = Time.minutes > 0 ? ` ${Time.minutes} minutos` : '',
        Seconds = Time.seconds > 0 ? ` ${Time.seconds} segundos` : '',
        Nothing = !Day && !Hours && !Minutes && !Seconds ? 'Invalid Cooldown Acess Bad Formated' : ''

    return `${Day}${Hours}${Minutes}${Seconds}${Nothing}`

}

function validateTime(args) {

    let count = 0,
        letter

    for (const i of args) {

        let number = i?.replace(/d|h|m/g, '')

        if (isNaN(number))
            continue

        for (const b of ['d', 'h', 'm']) {

            if (i.slice(-1).includes(b)) {
                letter = b
                break
            } else { continue }

        }

        if (!letter) continue

        if (['d', 'h', 'm'].includes(letter)) count += ms(`${i}`)

        continue

    }

    return count
}