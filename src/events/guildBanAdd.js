const { MessageEmbed, Permissions } = require('discord.js')
const { e } = require('../../database/emojis.json')
const client = require('../../index')
const Data = require('../../Routes/functions/data')
const { ServerDb } = require('../../Routes/functions/database')

client.on('guildBanAdd', async ban => {

    if (!ban.guild.available) return
    if (!ban.guild || !ban.guild.me.permissions.has(Permissions.FLAGS.VIEW_AUDIT_LOG)) return

    const channel = await ban.guild.channels.cache.get(ServerDb.get(`Servers.${ban.guild.id}.LogChannel`))
    if (!channel) return

    const fetchedLogs = await ban.guild.fetchAuditLogs({ limit: 1, type: 'MEMBER_BAN_ADD', })
    const banLog = fetchedLogs.entries.first()
    const { executor, target, reason } = banLog
    if (!banLog) return

    if (target.id === ban.user.id) ModAuthor = executor.tag
    if (target.id !== ban.user.id) ModAuthor = 'Indefinido'
    if (ModAuthor === client.user.tag) return

    const embed = new MessageEmbed()
        .setColor('RED')
        .setTitle(`🛰️ | Global System Notification | Banimento`)
        .addFields(
            { name: '👤 Usuário', value: `${ban.user.tag} - *\`${ban.user.id}\`*` },
            { name: `${e.ModShield} Moderador`, value: `${ModAuthor}` },
            { name: '📝 Razão', value: `${reason || 'Sem motivo informado'}` },
            { name: '📅 Data', value: `${Data()}` }
        )
        .setThumbnail(ban.user.displayAvatarURL({ dynamic: true }))
        .setFooter(`${ban.guild.name}`, ban.guild.iconURL({ dynamic: true }))
    channel ? channel.send({ embeds: [embed] }).catch(() => { }) : ''
})