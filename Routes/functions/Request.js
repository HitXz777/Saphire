const { Message } = require('discord.js')
const { sdb } = require('./database')

/** 
* @param {Message} message
*/

function RequestAutoDelete(message) {
    
    if (!sdb.get(`Request.${message.author.id}`))
        return

    setTimeout(() => { sdb.delete(`Request.${message.author.id}`) }, 30000)
}

module.exports = RequestAutoDelete