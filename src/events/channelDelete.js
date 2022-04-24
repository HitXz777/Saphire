const { config } = require('../../JSON/config.json'),
    client = require('../../index'),
    Notify = require('../../modules/functions/plugins/notify'),
    Database = require('../../modules/classes/Database')

client.on('channelDelete', async (channel) => {

    if (client.users.cache.get(channel.topic)) {

        let inGuildChannel = client.guilds.cache.get(config.guildId)?.channels?.cache?.find(data => data.topic === channel.topic)

        if (!inGuildChannel) return

        await Database.User.updateOne(
            { id: channel.topic },
            { $unset: { 'Cache.ComprovanteOpen': 1 } }
        )
    }

    if (client.channels.cache.get(channel.topic))
        await Database.User.updateOne(
            { id: channel.topic },
            { $unset: { PrivateChannel: 1 } }
        )

    if (channel.id === config.LoteriaChannel)
        Notify(config.guildId, 'Recurso Desabilitado', `O canal **${channel.name}** configurado como **Lotery Result At Principal Server** foi deletado.`)

    let guild = await Database.Guild.findOne({ id: channel.guild.id })
    if (!guild) return

    switch (channel.id) {
        case GetChannel('IdeiaChannel'): DeletedChannel('IdeiaChannel', 'Canal de Ideias/Sugestões'); break;
        case GetChannel('LeaveChannel.Canal'): DeletedChannel('LeaveChannel', 'Canal de Saída'); break;
        case GetChannel('XPChannel'): DeletedChannel('XPChannel', 'Canal de Level Up'); break;
        case GetChannel('ReportChannel'): DeletedChannel('ReportChannel', 'Canal de Reportes'); break;
        case GetChannel('LogChannel'): (async () => await Database.Guild.updateOne({ id: channel.guild.id }, { $unset: { LogChannel: 1 } }))(); break;
        case GetChannel('WelcomeChannel.Canal'): DeletedChannel('WelcomeChannel', 'Canal de Boas-Vindas'); break;
        case GetChannel(`Blockchannels.Bots.${channel.id}`): DeletedChannel(`Blockchannels.Bots.${channel.id}`, 'Bloqueio de Comandos'); break;
        case GetChannel(`Blockchannels.${channel.id}`): DeletedChannel(`Blockchannels.${channel.id}`, 'Bloqueio de Comandos'); break;
        case GetChannel('ConfessChannel'): DeletedChannel('ConfessChannel', 'Canal de Confissão'); break;
        case GetChannel('GiveawayChannel'): Database.deleteGiveaway(channel.guild.id, true); DeletedChannel('GiveawayChannel', 'Canal de Sorteios'); break;
        default: break;
    }

    function GetChannel(RouteName) {
        return guild[RouteName]
    }

    async function DeletedChannel(ChannelDB, CanalFunction) {

        await Database.Guild.updateOne(
            { id: channel.guild.id },
            { $unset: { [ChannelDB]: 1 } }
        )

        return Notify(channel.guild.id, 'Recurso Desabilitado', `O canal **${channel.name}** configurado como **${CanalFunction}** foi deletado.`)
    }
})