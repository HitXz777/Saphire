const { e } = require('../../../JSON/emojis.json')

module.exports = {
    name: 'unlockcommands',
    aliases: ['unblockcommands'],
    category: 'moderation',
    UserPermissions: ['MANAGE_CHANNELS'],
    ClientPermissions: ['ADD_REACTIONS'],
    emoji: '🔓',
    usage: '<unlockcommands> <channel>',
    description: 'Destranque meus comandos em canais que foram bloqueados.',

    execute: async (client, message, args, prefix, MessageEmbed, Database) => {

        let channel = message.mentions.channels.first() || message.channel,
            guild = await Database.Guild.findOne({ id: message.guild.id }, 'Blockchannels')

        if (!guild?.Blockchannels?.Channels?.includes(channel.id) && !guild?.Blockchannels?.Bots?.includes(channel.id)) return message.reply(`${e.Info} | O canal ${channel} não está desbloqueado.`)

        const msg = await message.reply(`${e.QuestionMark} | Você deseja desbloquear todos os comandos no canal ${channel}?`),
            emojis = ['✅', '❌'],
            filter = (reaction, user) => ['✅', '❌'].includes(reaction.emoji.name) && user.id === message.author.id

        for (const emoji of emojis) msg.react(emoji).catch(() => { })

        return msg.awaitReactions({ filter, max: 1, time: 15000, errors: ['time'] }).then(async collected => {
            const reaction = collected.first()

            if (reaction.emoji.name === emojis[0]) {

                await Database.Guild.updateOne(
                    { id: message.guild.id },
                    {
                        $pull: {
                            'Blockchannels.Channels': channel.id,
                            'Blockchannels.Bots': channel.id
                        }
                    }
                )

                return msg.edit(`🔓 | ${message.author} desbloqueou todos os comandos (meu e de outros bots) no canal ${channel}.`)

            } else { return msg.edit(`${e.Deny} | Request cancelada por: ${message.author}`) }
        }).catch(() => msg.edit(`${e.Deny} | Request cancelada por: Tempo expirado.`))
    }
}