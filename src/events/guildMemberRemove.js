const { DatabaseObj: { e } } = require('../../modules/functions/plugins/database'),
    client = require('../../index'),
    { Permissions, MessageEmbed } = require('discord.js'),
    Data = require('../../modules/functions/plugins/data'),
    Database = require('../../modules/classes/Database')

client.on('guildMemberRemove', async (member) => {

    if (!member || !member.guild || !member.guild.available) return

    let guild = await Database.Guild.findOne({ id: member.guild.id }, 'AfkSystem LogChannel LeaveChannel')

    if (guild?.AfkSystem?.find(arr => arr.MemberId === member.id))
        await Database.Guild.updateOne(
            { id: member.guild.id },
            { $pull: { 'AfkSystem': { MemberId: member.id } } }
        )

    LeaveMember(); Notify()

    async function Notify() {

        if (member.id === client.user.id) return
        if (!member.guild.me.permissions.has(Permissions.FLAGS.VIEW_AUDIT_LOG) || !member.guild) { return }
        const channel = await client.channels.cache.get(guild?.LogChannel)
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
            .setFooter({ text: member.guild.name, iconURL: member.guild.iconURL({ dynamic: true }) })

        return channel ? channel.send({ embeds: [embed] }).catch(() => { }) : null
    }

    async function LeaveMember() {

        let LeaveChannel = member.guild.channels.cache.get(guild?.LeaveChannel?.Canal)

        if (!LeaveChannel) return unset()

        let Mensagem = guild.LeaveChannel.Mensagem || '$member saiu do servidor.',
            newMessage = Mensagem.replace('$member', member).replace('$servername', member.guild.name)

        return LeaveChannel?.send(`${newMessage}`).catch(() => unset())
    }

    async function unset() {
        await Database.Guild.updateOne(
            { id: member.guild.id },
            { $unset: { LeaveChannel: 1 } }
        )
    }

})