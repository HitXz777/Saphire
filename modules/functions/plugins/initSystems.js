const
    ReminderSystem = require('../update/remindersystem'),
    GiveawaySystem = require('../update/giveawaysystem'),
    TopGlobalRanking = require('../update/TopGlobalRanking'),
    boostReward = require('../server/boostReward'),
    RaffleSystem = require('../update/rifasystem')

function init() {

    console.log('Systems Intervals | OK!')

    setInterval(() => {
        ReminderSystem()
        GiveawaySystem()
        RaffleSystem()
    }, 3000)

    setInterval(() => boostReward(), 60000)
    setInterval(() => TopGlobalRanking(), 3600000)

}

module.exports = init