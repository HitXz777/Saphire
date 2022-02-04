const { sdb, ServerDb } = require("../functions/database"),
    PassCode = require('../functions/PassCode'),
    Giveaway = require('../../Routes/functions/database')

class GiveawayManager {

    Channel(guild) {
        return guild.channels.cache.get(ServerDb.get(`Servers.${guild.id}.Giveaways.Channel`)) || false
    }

    DatabaseChannel(GuildId) {
        return ServerDb.get(`Servers.${GuildId}.Giveaways.Channel`)
    }

    GiveawaysOpen(GuildId) {

        let GiveawaysOpen = [],
            GwOpenDB = ServerDb.get(`Servers.${GuildId}.Giveaways.Open`)

        for (const code of GwOpenDB)
            GiveawaysOpen.push(code)

        return GiveawaysOpen
    }

    SetChannel(GuildId, ChannelId) {
        ServerDb.set(`Servers.${GuildId}.Giveaways.Channel`, ChannelId)
    }

    DeleteChannel(GuildId) {
        ServerDb.delete(`Servers.${GuildId}.Giveaways.Channel`)
    }

    DeleteGiveaway(GuildId, GiveawayId) {
        if (!ServerDb.get(`Servers.${GuildId}.Giveaways.Open.${GiveawayId}`))
            return false

        ServerDb.delete(`Servers.${GuildId}.Giveaways.Open.${GiveawayId}`)
        return true
    }

    NewGiveawayCode(QuantidadeDeCaracteres) {
        return PassCode(QuantidadeDeCaracteres).toUpperCase()
    }

    NewGiveaway(GuildId, GwCode, GiveawaysTime, Winners, Prize, AuthorId) {
        Giveaway.set(`Giveaways.${GuildId}.${GwCode}`, {
            AuthorId: AuthorId,
            Time: GiveawaysTime,
            Winners: Winners,
            Prize: Prize
        })
    }

}

module.exports = GiveawayManager