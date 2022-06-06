const { MessageEmbed, Permissions } = require('discord.js'),
    { e } = require('../../JSON/emojis.json'),
    client = require('../../index'),
    Data = require('../../modules/functions/plugins/data'),
    Database = require('../../modules/classes/Database')

client.on('guildBanAdd', async ban => {

    if (!ban.guild.available) return
    if (!ban.guild || !ban.guild.me.permissions.has(Permissions.FLAGS.VIEW_AUDIT_LOG)) return

    let guild = await Database.Guild.findOne({ id: ban.guild.id }, 'LogChannel banGif'),
        { LogChannel, banGif } = guild

    if (!guild)
        return Database.registerServer(ban.guild, client)

    const channel = await ban.guild.channels.cache.get(LogChannel)
    if (!channel) return

    const fetchedLogs = await ban.guild.fetchAuditLogs({ limit: 1, type: 'MEMBER_BAN_ADD', }),
        banLog = fetchedLogs.entries.first(),
        { executor, target, reason } = banLog

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
        .setImage(banGif || null)
        .setThumbnail(ban.user.displayAvatarURL({ dynamic: true }))
        .setFooter({ text: ban.guild.name, iconURL: ban.guild.iconURL({ dynamic: true }) })

    channel.send({ embeds: [embed] }).catch(() => { })
})