const Database = require('../../classes/Database'),
    { DatabaseObj: { config } } = require('./database'),
    client = require('../../../index')

async function IsMod(UserId) {

    if (UserId === config.ownerId)
        return true

    clientData = await Database.Client.findOne({ id: client.user.id }, 'Moderadores Administradores') || []

    return clientData.Administradores?.includes(UserId) || clientData?.Moderadores?.includes(UserId)

}

module.exports = IsMod