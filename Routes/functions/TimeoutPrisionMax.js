const { e } = require('../../database/emojis.json')
const { Message } = require('discord.js')
const { sdb } = require('./database')
const ms = require("parse-ms")

/**
 * @param { Message } message
 */

function TimeoutPrisionMax(message) {
    let author1 = sdb.get(`Users.${message.author.id}.Timeouts.Preso`)
    if (author1 !== null && 600000 - (Date.now() - author1) > 0) {
        let time = ms(600000 - (Date.now() - author1))
        return message.reply(`${e.Sirene} | Você está sob detenção máxima por mais \`${time.hours}h ${time.minutes}m e ${time.seconds}s\` `)
    }
}

module.exports = TimeoutPrisionMax