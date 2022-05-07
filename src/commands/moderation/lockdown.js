module.exports = {
    name: 'lockdown',
    category: 'moderation',
    UserPermissions: ['ADMINISTRATOR'],
    ClientPermissions: ['MANAGE_CHANNELS'],
    emoji: '🔒',
    usage: '<lockdown> <info>',
    description: 'Tranque todos os canais do servidor em caso de emergência.',

    run: async (client, message, args, prefix, MessageEmbed, Database) => {

        let e = Database.Emojis,
            user = message.mentions.members.first()
                || message.mentions.repliedUser
                || message.guild.members.cache.find(data => {
                    return data.displayName?.toLowerCase() === args.join(' ')?.toLowerCase()
                        || [args[0]?.toLowerCase()].includes(data.user.tag?.toLowerCase())
                        || [args[0]].includes(data.user.discriminator)
                        || [args[0]].includes(data.id)
                        || [args[0]?.toLowerCase()].includes(data.displayName?.toLowerCase())
                        || data.user.username === args.join(' ')
                })

        if (user) return lockdownUser()

        if (['info', 'help', 'ajuda'].includes(args[0]?.toLowerCase())) return lockdownInfo()
        if (['on', 'ligar', 'ativar'].includes(args[0]?.toLowerCase())) return turnOnLockdown()
        if (['off', 'desligar', 'desativar'].includes(args[0]?.toLowerCase())) return turnOffLockdown()
        return lockdownInfo()

        function lockdownInfo() {
            return message.reply(
                {
                    embeds: [
                        new MessageEmbed()
                            .setColor(client.blue)
                            .setTitle(`🔒 ${client.user.username} Lockdown System`)
                            .setDescription('Com esse comando você consegue trancar todos os canais do servidor, bloqueando assim, todos de falar.\n**Obs: Este comando apenas desativa a permissão de `Enviar Mensagens` do cargo `everyone`. Caso algum cargo tenha esta permissão ativa, este comando não irá funcionar.**')
                            .addFields(
                                {
                                    name: `${e.On} Ative`,
                                    value: `\`${prefix}lockdown on\``
                                },
                                {
                                    name: `${e.Off} Desative`,
                                    value: `\`${prefix}lockdown off\``
                                }
                            )
                            .setFooter({ text: 'Canais já trancados são imunes ao \'lockdown off\', fique tranquilo. Não abrirei eles.' })
                    ]
                }
            )
        }

        async function turnOnLockdown() {

            let channels = message.guild.channels.cache.filter(channel => channel.type === 'GUILD_TEXT'),
                arrayControl = [],
                everyone = message.channel.guild.roles.everyone

            let noBlocked = channels.filter(channel => channel.permissionsFor(everyone).has('SEND_MESSAGES')).map(data => data.id)

            if (!noBlocked || noBlocked.length === 0)
                return message.reply(`${e.Deny} | Nenhum canal do servidor está aberto para everyone.`)

            channels.forEach(channel => {

                if (channel && channel.manageable) {
                    channel.permissionsFor(everyone).has('SEND_MESSAGES')
                        ? channel.permissionOverwrites.edit(everyone, { SEND_MESSAGES: false }).catch(() => { })
                        : arrayControl.push(channel.id)
                }

            })

            if (arrayControl.length > 0)
                await Database.Guild.updateOne(
                    { id: message.guild.id },
                    { $push: { LockdownChannels: { $each: [...arrayControl] } } }
                )

            return message.channel.send(`${e.Check} | ${message.author} decretou lockdown neste servidor e todos os canais foram trancados para o cargo everyone.\n${arrayControl.length > 0 ? `${e.Info} | Canais ignorados por já estarem bloqueados: \n${arrayControl.length > 0 ? arrayControl.map(d => message.guild.channels.cache.get(d) || 'Não encontrado').join(', ') : 'Nenhum'}` : ''}`).catch(() => {
                return message.channel.send(`${e.Check} | ${message.author} decretou lockdown neste servidor e todos os canais foram trancados para o cargo everyone.\n${e.Info} | Canais ignorados por já estarem bloqueados: \n${arrayControl.length > 0 ? arrayControl.map(d => d.id).length : 'Nenhum'} Canais`)
            })
        }

        async function turnOffLockdown() {

            let data = await Database.Guild.findOne({ id: message.guild.id }, 'LockdownChannels'),
                channelAtDatabase = data.LockdownChannels || [],
                everyone = message.channel.guild.roles.everyone,
                channels = message.guild.channels.cache.filter(channel => channel.type === 'GUILD_TEXT' && !channel.permissionsFor(everyone).has('SEND_MESSAGES'))

            channels.forEach(channel => {
                if (channel && channel.manageable && !channelAtDatabase.includes(channel.id))
                    channel.permissionOverwrites.edit(everyone, { SEND_MESSAGES: null }).catch(() => { })
            })

            deleteChannelsFromDatabase()
            return message.reply(`${e.Check} | ${message.author} pôs fim ao lockdown no servidor e todos os canais foram liberados para everyone.\n${channelAtDatabase.length > 0 ? `${e.Info} | *Todos os canais imunizados presentes na minha database foram ignorados e não foram liberados.*` : ''}`)

            async function deleteChannelsFromDatabase() {
                await Database.Guild.updateOne(
                    { id: message.guild.id },
                    { $unset: { LockdownChannels: 1 } }
                )
            }

        }

        function lockdownUser() {

            let disable = false

            if (['off', 'desligar', 'desativar'].includes(args[0]?.toLowerCase()) || ['off', 'desligar', 'desativar'].includes(args[1]?.toLowerCase())) disable = true

            let channels = message.guild.channels.cache,
                arrayControl = []

            channels.forEach(channel => {

                if (channel && channel.manageable) {

                    if (disable) {
                        channel.permissionOverwrites.edit(user, { VIEW_CHANNEL: null }).catch(() => { })
                    } else {
                        channel.permissionsFor(user).has('VIEW_CHANNEL')
                            ? channel.permissionOverwrites.edit(user, { VIEW_CHANNEL: false }).catch(() => { })
                            : arrayControl.push(channel.id)
                    }

                }

            })

            let msg = disable
                ? `${e.Check} | ${user} foi desbloqueado em todos os canais do servidor.`
                : `${e.Check} | ${message.author} decretou lockdown sob ${user} e todos os canais foram escondidos do mesmo.\n${arrayControl.length > 0 ? `${e.Info} | Canais ignorados por já estarem escondidos: \n${arrayControl.length > 0 ? arrayControl.map(d => message.guild.channels.cache.get(d) || 'Não encontrado').join(', ') : 'Nenhum'}` : ''}`

            return message.channel.send(`${msg}`).catch(() => { })

        }

    }
}