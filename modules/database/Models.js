class Models {
    constructor() {
        this.Clan = require('./models/Clans')
        this.Client = require('./models/Client')
        this.Giveaway = require('./models/Giveaway')
        this.Guild = require('./models/Guild')
        this.LogRegister = require('./models/LogRegister')
        this.Lotery = require('./models/Lotery')
        this.Reminder = require('./models/Reminders')
        this.User = require('./models/User')
        this.Raffle = require('./models/Raffle')
    }
}

module.exports = Models