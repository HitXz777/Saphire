const
    ReminderSystem = require('../update/remindersystem'),
    GiveawaySystem = require('../update/giveawaysystem'),
    TopGlobalRanking = require('../update/TopGlobalRanking'),
    boostReward = require('../server/boostReward'),
    RaffleSystem = require('../update/rifasystem'),
    slashCommandsHandler = require('../../../src/structures/slashCommand')

function init(client) {
    
    TopGlobalRanking()
    slashCommandsHandler(client)
    console.log('Systems Intervals | OK!')

    setInterval(() => {
        ReminderSystem()
        GiveawaySystem()
        RaffleSystem()
    }, 3000)

    setInterval(() => boostReward(), 60000)
    setInterval(() => TopGlobalRanking(), 1800000)
    setInterval(() => {
        client.user.setActivity(`${client.commands.size + client.slashCommands.size} comandos em ${client.guilds.cache.size} servidores`, { type: 'PLAYING' })
    }, 300000)
}

module.exports = init