let Data = require('./data'),
    { Transactions } = require('./database'),
    UserData,
    AuthorData,
    DataToPush

function TransactionsPush(UserOrMemberId, MessageAuthorId, FraseUser, FraseAuthor) {

    Transactions.get(`Transactions.${UserOrMemberId}`)?.length > 0
        ? UserData = [{ time: Data(0, true), data: `${FraseUser}` }, ...Transactions.get(`Transactions.${UserOrMemberId}`)]
        : UserData = [{ time: Data(0, true), data: `${FraseUser}` }]

    Transactions.get(`Transactions.${MessageAuthorId}`)?.length > 0
        ? AuthorData = [{ time: Data(0, true), data: `${FraseAuthor}` }, ...Transactions.get(`Transactions.${MessageAuthorId}`)]
        : AuthorData = [{ time: Data(0, true), data: `${FraseAuthor}` }]

    Transactions.set(`Transactions.${UserOrMemberId}`, UserData)
    Transactions.set(`Transactions.${MessageAuthorId}`, AuthorData)

}

function PushTransaction(UserId, Frase) {

    Transactions.get(`Transactions.${UserId}`)?.length > 0
        ? DataToPush = [{ time: Data(0, true), data: `${Frase}` }, ...Transactions.get(`Transactions.${UserId}`)]
        : DataToPush = [{ time: Data(0, true), data: `${Frase}` }]

    Transactions.set(`Transactions.${UserId}`, DataToPush)
}

module.exports = { TransactionsPush, PushTransaction }