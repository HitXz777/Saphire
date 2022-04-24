const Database = require('../../classes/Database')

async function Colors(userId) {

    if (!userId) return '#246FE0'

    let user = await Database.User.findOne({ id: userId }, 'Color'),
        perm = user?.Color?.Perm,
        set = user?.Color?.Set

    if (!perm || !set) return '#246FE0'

    return set || '#246FE0'

}

module.exports = Colors