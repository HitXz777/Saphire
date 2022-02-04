const { DatabaseObj, ServerDb, sdb } = require('../../Routes/functions/database')
const { e } = DatabaseObj
const client = require('../../index')
const { Permissions, MessageEmbed } = require('discord.js')
const Data = require('../../Routes/functions/data')

client.on('guildMemberRemove', async (member) => {

    if (!member.guild.available) return

    if (ServerDb.get(`Servers.${member.guild.id}.AfkSystem.${member.id}`))
        ServerDb.delete(`Servers.${member.guild.id}.AfkSystem.${member.id}`)

    LeaveMember(); Notify()

    async function Notify() {

        if (member.id === client.user.id) return
        if (!member.guild.me.permissions.has(Permissions.FLAGS.VIEW_AUDIT_LOG) || !member.guild) { return }
        const channel = await client.channels.cache.get(ServerDb.get(`Servers.${member.guild.id}.LogChannel`))
        if (!channel) return

        const fetchedLogs = await member.guild.fetchAuditLogs({ limit: 1, type: 'MEMBER_KICK' }),
            banLog = fetchedLogs.entries.first()

        if (!banLog) return
        const { executor, target, reason } = banLog
        if (!banLog || !executor) return

        if (target.id === member.user.id) { ModAuthor = executor.tag } else { return }
        if (target.id !== member.user.id) return
        if (ModAuthor === client.user.tag) return

        const embed = new MessageEmbed()
            .setColor('#246FE0')
            .setTitle(`🛰️ | Global System Notification | Kick`)
            .addFields(
                { name: '👤 Usuário', value: `${member.user.tag} - *\`${member.user.id}\`*` },
                { name: `${e.ModShield} Moderador`, value: `${ModAuthor}` },
                { name: '📝 Razão', value: `${reason || 'Sem motivo informado'}` },
                { name: '📅 Data', value: `${Data()}` }
            )
            .setFooter(`${member.guild.name}`, member.guild.iconURL({ dynamic: true }))

        channel ? channel.send({ embeds: [embed] }).catch(() => { }) : ''
    }

    async function LeaveMember() {
        let LeaveChannel = ServerDb.get(`Servers.${member.guild.id}.LeaveChannel.Canal`)
        sdb.delete(`Client.MuteSystem.${member.guild.id}.${member.id}`)
        return await member.guild.channels.cache.get(LeaveChannel)?.send(`${e.Leave} | ${member.user.username} saiu do servidor.`).catch(() => { })
    }

})