const { Message } = require('discord.js')
const { db, sdb } = require('../functions/database')
const Error = require('../functions/errors')
const Vip = require('../functions/vip')

/**
 * @param { Message } message
 */

class UserManager {
    constructor(message, user) {
        this.message = message
        this.user = user
        this.name = user.username
        this.id = user.id
        this.tag = user.tag
        this.avatar = user.avatarURL({ dynamic: true, format: "png", size: 1024 })
        this.bot = user.bot
        this.createdAt = user.createdAt
        this.dataFormatada = this.createdAt.getDate() + "/" + (this.createdAt.getMonth() + 1) + "/" + this.createdAt.getFullYear() + " ás " + this.createdAt.getHours() + "h " + this.createdAt.getMinutes() + 'm e ' + this.createdAt.getSeconds() + 's'
        this.vip = Vip(this.id)
        this.permissions = () => message.member.permissions.toArray() || []
        this.request = sdb.get(`Request.${this.id}`)
        this.baka = sdb.get(`Users.${this.id}.Baka`)
        this.blacklist = sdb.get(`Client.Blacklist.Users`)?.includes(this.id)
        this.balance = {
            bal: sdb.get(`Users.${this.id}.Balance`) || 0,
            bank: sdb.get(`Users.${this.id}.Bank`) || 0,
            resgate: sdb.get(`Users.${this.id}.Cache.Resgate`) || 0
        }
    }

    addBalance(value) {
        try {
            sdb.add(`Users.${this.id}.Balance`, parseInt(value))
        } catch (err) {
            Error(this.message, err)
        }
    }

    subtractBalance(value) {
        try {
            sdb.subtract(`Users.${this.id}.Balance`, parseInt(value))
        } catch (err) {
            Error(this.message, err)
        }
    }

    addBank(value) {
        try {
            sdb.add(`Users.${this.id}.Bank`, parseInt(value))
        } catch (err) {
            Error(this.message, err)
        }
    }

    subtractBank(value) {
        try {
            sdb.subtract(`Users.${this.id}.Bank`, parseInt(value))
        } catch (err) {
            Error(this.message, err)
        }
    }
}

module.exports = UserManager