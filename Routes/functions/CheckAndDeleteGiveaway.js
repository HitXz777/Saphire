const { Giveaway } = require("./database")

function CheckAndDeleteGiveaway(guildId, MessageId) {

    let DozeHoras = 86400000, // 1 Day
        DateNow = Giveaway.get(`Giveaways.${guildId}.${MessageId}.TimeToDelete`)

    if (!DateNow) return false

    const Data = DateNow !== null && DozeHoras - (Date.now() - DateNow) > 0

    if (!Data) {
        Giveaway.delete(`Giveaways.${guildId}.${MessageId}`)
        return true
    }

    return false
}

module.exports = CheckAndDeleteGiveaway