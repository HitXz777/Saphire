const { Message } = require('discord.js')
const { e } = require('../../database/emojis.json')
const { sdb, ServerDb } = require('./database')

/**
 * @param {Message} message 
 */

function Moeda(message) {
    return ServerDb.get(`Servers.${message.guild.id}.Moeda`) ? ServerDb.get(`Servers.${message.guild.id}.Moeda`) : `${e.Coin} Moedas`
}

module.exports = Moeda