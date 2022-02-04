const { Message } = require('discord.js')
const { e } = require('../../database/emojis.json')

/**
 * @param { Message} message
 */

function ServerBlocked(message) {
    message.channel.send(`${e.Deny} | Este servidor está na blacklist.`).then(msg => {
        setTimeout(() => { msg.delete().catch(() => { }) }, 4000)
    }).catch(() => { })
}

module.exports = ServerBlocked