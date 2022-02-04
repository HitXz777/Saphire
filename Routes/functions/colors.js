const { Message } = require('discord.js'),
    { sdb } = require('./database')

/**
 * @param { Message } message
 */

function Colors(member) {

    if (!member)
        return '#246FE0'

    if (sdb.get(`Users.${member.id}.Color.Set`))
        return sdb.get(`Users.${member.id}.Color.Set`) || '#246FE0'

    if (member.displayHexColor === '#000000')
        return '#246FE0'

    return member.displayHexColor || '#246FE0'
}

module.exports = Colors