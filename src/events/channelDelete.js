const { sdb, DatabaseObj: { config }, ServerDb, Giveaway } = require('../../Routes/functions/database')
const client = require('../../index')
const Notify = require('../../Routes/functions/notify')

client.on('channelDelete', async (channel) => {

    if (await client.users.cache.get(channel.topic))
        sdb.delete(`Users.${channel.topic}.Cache.ComprovanteOpen`)

    if (await client.channels.cache.get(channel.topc))
        sdb.delete(`Users.${channel.topic}.PrivateChannel`)

    if (channel.id === config.LoteriaChannel)
        Notify(config.guildId, 'Recurso Desabilitado', `O canal **${channel.name}** configurado como **Lotery Result At Principal Server** foi deletado.`)

    switch (channel.id) {
        case GetChannel('IdeiaChannel'): DeletedChannel('IdeiaChannel', 'Canal de Ideias/Sugestões'); break;
        case GetChannel('LeaveChannel.Canal'): DeletedChannel('LeaveChannel', 'Canal de Saída'); break;
        case GetChannel('XPChannel'): DeletedChannel('XPChannel', 'Canal de Level Up'); break;
        case GetChannel('ReportChannel'): DeletedChannel('ReportChannel', 'Canal de Reportes'); break;
        case GetChannel('LogChannel'): (() => ServerDb.delete(`Servers.${channel.guild.id}.LogChannel`))(); break;
        case GetChannel('WelcomeChannel.Canal'): DeletedChannel('WelcomeChannel', 'Canal de Boas-Vindas'); break;
        case GetChannel('Farm.BuscaChannel'): DeletedChannel('Farm.BuscaChannel', 'Farming Floresta Cammum'); break;
        case GetChannel('Farm.PescaChannel'): DeletedChannel('Farm.PescaChannel', 'Farming Pesca'); break;
        case GetChannel('Farm.MineChannel'): DeletedChannel('Farm.MineChannel', 'Farming Mineração'); break;
        case GetChannel(`Blockchannels.Bots.${channel.id}`): DeletedChannel(`Blockchannels.Bots.${channel.id}`, 'Bloqueio de Comandos'); break;
        case GetChannel(`Blockchannels.${channel.id}`): DeletedChannel(`Blockchannels.${channel.id}`, 'Bloqueio de Comandos'); break;
        case GetChannel('ConfessChannel'): DeletedChannel('ConfessChannel', 'Canal de Confissão'); break;
        case GetChannel('GiveawayChannel'): Giveaway.delete(`Giveaways.${channel.guild.id}`); DeletedChannel('GiveawayChannel', 'Canal de Sorteios'); break;
        default: break;
    }

    function GetChannel(RouteName) {
        return ServerDb.get(`Servers.${channel.guild.id}.${RouteName}`)
    }

    function DeletedChannel(ChannelDB, CanalFunction) {
        ServerDb.delete(`Servers.${channel.guild.id}.${ChannelDB}`)
        return Notify(channel.guild.id, 'Recurso Desabilitado', `O canal **${channel.name}** configurado como **${CanalFunction}** foi deletado.`)
    }
})