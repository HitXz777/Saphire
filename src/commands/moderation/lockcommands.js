const { e } = require('../../../JSON/emojis.json'),
    Database = require('../../../modules/classes/Database')

module.exports = {
    name: 'lockcommands',
    aliases: ['nocommands', 'blockcommands', 'bloquearcomandos', 'blockbots'],
    category: 'moderation',
    UserPermissions: ['MANAGE_CHANNELS'],
    ClientPermissions: ['MANAGE_MESSAGES', 'ADD_REACTIONS'],
    emoji: '🔒',
    usage: '<lockcommands> <channel>',
    description: 'Tranque meus comandos em canais específicos para que não seja usados. (ADM\'s são imunes)',

    run: async (client, message, args, prefix, MessageEmbed, Database) => {

        let channel = message.mentions.channels.first() || message.channel

        if (['info', 'informações', 'informação', 'help', 'ajuda'].includes(args[0]?.toLowerCase()))
            return message.reply({
                embeds: [
                    new MessageEmbed()
                        .setColor('#246FE0')
                        .setTitle(`${e.Deny} Bloqueio de Comandos`)
                        .setDescription('Com este comando, torna-se possível o bloqueio dos meus comandos ou comandos de outros bots em canais específicos.')
                        .addField(`${e.On} Bloqueie meus comandos`, `\`${prefix}lockcommands\``)
                        .addField(`${e.On} Bloqueie todos os bots`, `\`${prefix}lockcommands bots\``)
                        .addField(`${e.Off} Desative`, `\`${prefix}unlockcommands\``)

                ]
            })

        let guild = await Database.Guild.findOne({ id: message.guild.id }, 'Blockchannels')

        if (['bots', 'bot'].includes(args[0]?.toLowerCase())) return BloquearBots()

        if (guild?.Blockchannels.Channels?.includes(channel.id)) return message.reply(`${e.Info} | O canal ${channel} já está bloqueado. \`${prefix}lockcommands info\``)

        const msg = await message.reply(`${e.QuestionMark} | Você deseja bloquear todos os meus comandos no canal ${channel}?`),
            emojis = ['✅', '❌'],
            filter = (reaction, user) => ['✅', '❌'].includes(reaction.emoji.name) && user.id === message.author.id

        for (const emoji of emojis) msg.react(emoji).catch(() => { })

        return msg.awaitReactions({ filter, max: 1, time: 15000, errors: ['time'] }).then(async collected => {
            const reaction = collected.first()

            if (reaction.emoji.name === emojis[0]) {

                await Database.Guild.updateOne(
                    { id: message.guild.id },
                    { $push: { 'Blockchannels.Channels': channel.id } },
                    { upsert: true }
                )

                return msg.edit(`✅ | ${message.author} bloqueou todos os meus comandos no canal ${channel}.`)

            } else { return msg.edit(`${e.Deny} | Request cancelada por: ${message.author}`) }
        }).catch(() => msg.edit(`${e.Deny} | Request cancelada por: Tempo expirado.`))

        async function BloquearBots() {

            if (guild?.Blockchannels.Bots?.includes(channel.id)) return message.reply(`${e.Check} | ${channel} já está bloqueado. \`${prefix}lockcommands info\``)

            const msg = await message.channel.send(`${e.QuestionMark} | ${message.author}, você quer bloquear todos os comandos de todos os bots neste canal?\n${e.SaphireObs} | Vale lembrar que Administradores **NÃO** são imunes a esse bloqueio.`),
                emojis = ['✅', '❌'],
                filter = (reaction, user) => ['✅', '❌'].includes(reaction.emoji.name) && user.id === message.author.id

            for (const emoji of emojis) msg.react(emoji).catch(() => { })

            return msg.awaitReactions({ filter, max: 1, time: 15000, errors: ['time'] }).then(async collected => {
                const reaction = collected.first()

                if (reaction.emoji.name === emojis[0]) {

                    await Database.Guild.updateOne(
                        { id: message.guild.id },
                        { $push: { 'Blockchannels.Bots': channel.id } },
                        { upsert: true }
                    )
                    return msg.edit(`✅ | ${message.author} bloqueou todos comandos de todos os bots canal ${channel}.`).catch(() => { })

                } else { return msg.edit(`${e.Deny} | Request cancelada por: ${message.author}`) }
            }).catch(() => msg.edit(`${e.Deny} | Request cancelada por: Tempo expirado.`))
        }

    }
}