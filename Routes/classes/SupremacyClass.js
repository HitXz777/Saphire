const { Message, MessageEmbed, Permissions, Collection } = require('discord.js')
const { f } = require('../../database/frases.json')
const { RegisterUser, RegisterServer, UpdateUserName } = require('../functions/register')
const { sdb, db, CommandsLog, BgLevel, BgWall, conf, emojis, nomes, lotery } = require('../functions/database')
const { RateLimiter } = require('discord.js-rate-limiter')

/**
 * @param { Message } message
 */

class RodyBrozy {

    UserManager = require('./UserManager')
    SaphireClient = require('./SaphireClient')
    slashCommands = new Collection()
    MessageEmbed = new MessageEmbed()
    Permissions = Permissions
    rateLimiter = new RateLimiter(2, 1500)
    f = f
    sdb = sdb
    db = db
    CommandsLog = CommandsLog
    Discord = require('discord.js')
    client = require('../../index')
    Collection = new Collection()
    GiveawayManager = require('./GiveawayManager')
    Error = require('../functions/errors')
    BlockCommandsBot = require('../functions/blockcommands')
    AfkSystem = require('../functions/AfkSystem')
    xp = require('../functions/experience')
    React = require('../functions/reacts')
    Notify = require('../functions/notify')
    ms = require('ms')
    parsems = require('parse-ms')
    RequestAutoDelete = require('../functions/Request')

    SaphireClientConfiguration = {
        intents: 1815,
        disableMentions: { parse: ['everyone'] },
        partials: ['USER', 'CHANNEL', 'GUILD_MEMBER', 'MESSAGE', 'REACTION']
    }

    ServerBlocked(message) {
        return ServerBlocked(message)
    }

    Blacklisted(message) {
        return Blacklisted(message)
    }

    RequestAutoDelete(message) {
        return RequestAutoDelete(message)
    }

    Notify(serverid, type, msg) {
        return Notify(serverid, type, msg)
    }

    React(message) {
        return React(message)
    }

    AfkSystem(message) {
        return AfkSystem(message)
    }

    BlockCommandsBot(message) {
        return BlockCommandsBot(message)
    }

    parsems(number) {
        return parsems(number)
    }

}

RodyBrozy.prototype.UpdateUserName = (message) => {
    return UpdateUserName(message)
}

RodyBrozy.prototype.RegisterUser = (message) => {
    return RegisterUser(message)
}

RodyBrozy.prototype.xp = (message) => {
    return xp(message)
}

RodyBrozy.prototype.ms = (time) => {
    return ms(time)
}

RodyBrozy.prototype.ms = (time) => {
    return ms(time)
}

RodyBrozy.prototype.RegisterServer = (guild) => {
    return RegisterServer(guild)
}

RodyBrozy.prototype.Error = (message, err) => Error(message, err)

RodyBrozy.prototype.DatabaseObj = {
    LevelWallpapers: BgLevel.get('LevelWallpapers'),
    Wallpapers: BgWall.get('Wallpapers'),
    Loteria: lotery.get('Loteria'),
    config: conf.get('config'),
    e: emojis.get('e'),
    N: nomes.get('N'),
}

RodyBrozy.prototype.ServerManager = require('./ServerManager')

const Super = new RodyBrozy()
module.exports = Super