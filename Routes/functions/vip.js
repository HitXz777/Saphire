const { sdb } = require('./database')

function Vip(userId) {

    const
        DateNow = sdb.get(`Users.${userId}.Timeouts.Vip.DateNow`) || null,
        TimeRemaing = sdb.get(`Users.${userId}.Timeouts.Vip.TimeRemaing`) || 0,
        Permanent = sdb.get(`Users.${userId}.Timeouts.Vip.Permanent`) || null

    if (Permanent) return true

    return (DateNow !== null && TimeRemaing - (Date.now() - DateNow) > 0)
        ? true :
        (() => {

            if (DateNow || TimeRemaing)
                sdb.delete(`Users.${userId}.Timeouts.Vip`)

            return false

        })()

}

module.exports = Vip