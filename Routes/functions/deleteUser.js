const { db, sdb, Reminders, lotery, Transactions } = require('./database'),
    LoteriaUsers = lotery.get('Loteria.Users') || []

async function DeleteUser(UserId) {

    if (LoteriaUsers.includes(UserId))
        lotery.pull('Loteria.Users', UserId)

    Reminders.delete(`Reminders.${UserId}`)
    sdb.delete(`Users.${UserId}`)
    Transactions.delete(`Transactions.${UserId}`)

    db.delete(`${UserId}`)
    db.delete(`Bitcoin_${UserId}`)

    if (sdb.get(`Titulos.Halloween`)?.includes(UserId))
        sdb.pull(`Titulos.Halloween`, UserId)

    return true

}

module.exports = DeleteUser