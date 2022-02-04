const { Client, Collection, Message } = require('discord.js')
const { db, sdb, DatabaseObj } = require('../functions/database')
const fs = require('fs')
require('dotenv').config()

/**
 * @param { Message } message
 */

const SaphireClientConfiguration = {
    intents: 2047,
    disableMentions: {
        parse: ['everyone']
    },
    partials: ['USER', 'CHANNEL', 'GUILD_MEMBER', 'MESSAGE', 'REACTION']
}

class SaphireClient extends Client {
    constructor(options = {}) {
        super(SaphireClientConfiguration)
        this.commands = new Collection()
        this.aliases = new Collection()
        this.categories = fs.readdirSync('./src/commands')
        this.e = DatabaseObj.e
        this.sdb = sdb
        this.db = db
        this.BgLevel = DatabaseObj.BgLevel
        this.BgWal = DatabaseObj.Wallpapers
        this.config = DatabaseObj.config
        this.lotery = DatabaseObj.Loteria
        this.nomes = DatabaseObj.N
        this.blue = '#246FE0'
    }

    async start() {
        await super.login(process.env.DISCORD_CLIENT_BOT_TOKEN)
    }

    async off() {
        super.destroy().catch(() => { })
    }

    BotRole(guild) {
        return guild.me.roles.botRole || 'Indefinido'
    }

}

module.exports = SaphireClient