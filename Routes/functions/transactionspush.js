const Data = require('./data'),
    Database = require('../classes/Database')

async function TransactionsPush(UserOrMemberId, MessageAuthorId, FraseUser, FraseAuthor) {

    PushTransaction(UserOrMemberId, FraseUser)
    PushTransaction(MessageAuthorId, FraseAuthor)

}

async function PushTransaction(userId, Frase) {

    if (!userId || !Frase) return

    await Database.User.updateOne(
        { id: userId },
        { $push: { Transactions: { $each: [{ time: Data(0, true), data: `${Frase}` }], $position: 0 } } },
        { upsert: true }
    )

    return

}

module.exports = { TransactionsPush, PushTransaction }