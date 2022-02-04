const { Permissions } = require('discord.js')
const client = require('../../index')
const { e } = require('../../database/emojis.json')
const { sdb, ServerDb } = require('../../Routes/functions/database')

client.on('channelCreate', async (channel) => {

    if (!channel.guild || !channel.guild.available || !channel.guild.me.permissions.has(Permissions.FLAGS.SEND_MESSAGES)) return

    if (sdb.get(`Servers.${channel.guild.id}.FirstSystem`) && channel && channel.isText() && channel.viewable && channel.viewable && !channel.isVoice())
        channel.send(`First! ${e.Nagatoro}`).catch(() => { })

    let MuteRole = await channel.guild.roles.cache.get(ServerDb.get(`Servers.${channel.guild.id}.Roles.Muted`))

    if (MuteRole)
        channel.permissionOverwrites.create(MuteRole, { SEND_MESSAGES: false, ADD_REACTIONS: false, SEND_TTS_MESSAGES: false, MANAGE_MESSAGES: false, MANAGE_ROLES: false, MANAGE_CHANNELS: false })

})