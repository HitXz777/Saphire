const { Permissions } = require('discord.js'),
    client = require('../../index'),
    { e } = require('../../JSON/emojis.json'),
    Database = require('../../modules/classes/Database')

client.on('channelCreate', async (channel) => {

    if (!channel || !channel.guild || !channel.guild.available || !channel.guild.me.permissions.has(Permissions.FLAGS.SEND_MESSAGES)) return

    let data = await Database.Guild.findOne({ id: channel.guild.id }, 'FirstSystem'),
        firstOn = data?.FirstSystem

    if (firstOn && channel.isText() && channel.viewable)
        return channel.send(`First! ${e.Nagatoro}`).catch(() => { })

    return

})