const Database = require('../../classes/Database')

async function Vip(userId) {

    const user = await Database.User.findOne({ id: userId }, 'Vip')
    if (!user) return false

    let DateNow = user?.Vip?.DateNow || null,
        TimeRemaing = user?.Vip?.TimeRemaing || 0,
        Permanent = user?.Vip?.Permanent || false

    if (Permanent) return true

    return DateNow !== null && TimeRemaing - (Date.now() - DateNow) > 0
        ? true :
        (async () => {

            if (DateNow || TimeRemaing)
                await Database.User.updateOne(
                    { id: userId },
                    { $unset: { Vip: 1 } }
                )

            return false

        })()

}

module.exports = Vip