const { MessageEmbed, Permissions } = require('discord.js'),
    { e } = require('../../JSON/emojis.json'),
    client = require('../../index'),
    Data = require('../../modules/functions/plugins/data'),
    Database = require('../../modules/classes/Database')

client.on('guildBanRemove', async ban => {

    if (!ban.guild.me.permissions.has(Permissions.FLAGS.VIEW_AUDIT_LOG) || !ban.guild) { return }

    let guild = await Database.Guild.findOne({ id: ban.guild.id })

    if (!guild)
        return Database.registerServer(ban.guild, client)

    const channel = await ban.guild.channels.cache.get(guild?.LogChannel)
    if (!channel) return

    const fetchedLogs = await ban.guild.fetchAuditLogs({ limit: 1, type: 'MEMBER_BAN_REMOVE', })
    const banLog = fetchedLogs.entries.first()
    const { executor, target, reason } = banLog
    if (!banLog) return

    executor ? executor : executor === 'Indefinido'
    if (target.id === ban.user.id) ModAuthor = executor.tag
    if (target.id !== ban.user.id) ModAuthor = 'Indefinido'
    if (ModAuthor === client.user.tag) return

    const embed = new MessageEmbed()
        .setColor('GREEN')
        .setTitle(`🛰️ | Global System Notification | Desbanimento`)
        .addFields(
            { name: '👤 Usuário', value: `${ban.user.tag} - *\`${ban.user.id}\`*` },
            { name: `${e.ModShield} Moderador`, value: `${ModAuthor}` },
            { name: '📝 Razão', value: `${reason || 'Sem motivo informado'}` },
            { name: '📅 Data', value: `${Data()}` }
        )
        .setFooter({ text: ban.guild.name, iconURL: ban.guild.iconURL({ dynamic: true }) })

    channel ? channel.send({ embeds: [embed] }).catch(() => { }) : ''
})