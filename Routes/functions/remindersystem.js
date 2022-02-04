const
    { sdb, Reminders, Transactions, DatabaseObj: { e } } = require("./database"),
    client = require('../../index')

async function ReminderSystem() {

    let UsersId = Object.keys(Reminders.get('Reminders') || {})

    if (UsersId.length === 0) return

    for (const UserId of UsersId) {

        let user = await client.users.cache.get(UserId),
            RemindersCode = Object.keys(Reminders.get(`Reminders.${UserId}`) || {})

        if (!user) {

            sdb.delete(`Users.${UserId}`)
            Transactions.delete(`Transactions.${UsersId}`)
            Reminders.delete(`Reminders.${UserId}`)

        } else {

            RemindersCode.length === 0
                ? Reminders.delete(`Reminders.${UserId}`)
                : CheckAndAlertReminder(user, RemindersCode)

        }

        continue
        
    }

}

async function CheckAndAlertReminder(user, RemindersCode) {

    const RemindersData = Reminders.get(`Reminders.${user.id}`)

    for (const Code of RemindersCode) {

        let data = RemindersData[Code], // Dados de cada lembrete
            RemindMessage = data.RemindMessage, // Mensagem setada pelo usuário
            Time = data.Time, // Tempo definido em milisegundos
            DateNow = data.DateNow, // Date.now() do momento em que o comando foi setado
            ChannelId = data.ChannelId, // Id do canal me que o comando foi dado
            TimeOver = DateNow !== null && Time - (Date.now() - DateNow) > 0, // Verifica se o tempo já passou
            Channel = await client.channels.cache.get(ChannelId) // Canal em que o comando foi dado

        if (!TimeOver) {

            Reminders.delete(`Reminders.${user.id}.${Code}`)

            if (!Channel?.guild.members.cache.has(user.id)) return NotifyUser()

            return Channel
                ? Channel?.send(`${e.Notification} | ${user}, lembrete pra você.\n🗒️ | **${RemindMessage}**`).catch(() => { NotifyUser() })
                : NotifyUser()

            function NotifyUser() {
                user.send(`${e.Notification} | ${user}, lembrete pra você.\n🗒️ | **${RemindMessage}**`).catch(() => { })
            }

        }

        continue

    }

}

module.exports = ReminderSystem
