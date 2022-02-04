const { Message } = require('discord.js')
const { e } = require('../../database/emojis.json')

/**
 * @param { Message} message
 */

function Blacklisted(message) {
    message.channel.send(`${e.Deny} | ${message.author}, você está na blacklist e não tem acesso a nenhum dos meus comandos.`).then(msg => {
        setTimeout(() => { msg.delete().catch(() => { }) }, 4000)
    }).catch(() => { })
}

module.exports = Blacklisted