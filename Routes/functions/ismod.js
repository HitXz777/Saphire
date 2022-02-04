const { sdb, DatabaseObj: { config } } = require('./database')

function IsMod(UserId) {

    if (UserId === config.ownerId)
        return true

    return sdb.get(`Client.Moderadores.${UserId}`) ? true : false
}

module.exports = IsMod