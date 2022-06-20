const
    { DatabaseObj: { e } } = require("../plugins/database"),
    client = require('../../../index'),
    Database = require('../../classes/Database'),
    moment = require('moment-timezone'),
    Data = require('../plugins/data')

async function ReminderSystem() {

    let AllRemindersData = await Database.Reminder.find({}) || []

    if (!AllRemindersData || AllRemindersData.length === 0) return

    for (const data of AllRemindersData) {

        let user = client.users.cache.get(data.userId)

        user
            ? reminderStart(user, data)
            : (async () => {
                Database.deleteUser(data.userId)
                await Database.Reminder.deleteMany({ userId: data.userId })
            })()

        continue

    }

    return

}

async function reminderStart(user, data) {

    let RemindMessage = data.RemindMessage.slice(0, 3500),
        Time = data.Time,
        DateNow = data.DateNow,
        isAutomatic = data.isAutomatic,
        TimeOver = client.Timeout(Time, DateNow),
        Channel = client.channels.cache.get(data.ChannelId)

    if (!TimeOver && !data.Alerted) {

        if (!Channel || !Channel.guild.members.cache.has(user.id)) return NotifyUser()

        await Database.Reminder.updateOne(
            { id: data.id },
            { Alerted: true }
        )

        let msg = await Channel.send(`${e.Notification} | ${user}, lembrete pra você.\n🗒️ | **${RemindMessage}**`).catch(() => { return NotifyUser() })

        if (isAutomatic) return deleteReminders(data.id)
        
        let emojis = ['📅', '🗑️'],
            validate = false

        for (let i of emojis) msg.react(i).catch(() => { })

        const collector = msg.createReactionCollector({
            filter: (reaction, u) => emojis.includes(reaction.emoji.name) && u.id === user.id,
            idle: 600000,
            errors: ['idle']
        })
            .on('collect', (reaction) => {

                validate = true

                if (reaction.emoji.name === emojis[0]) {
                    msg.delete().catch(() => { })
                    return revalidateTime(Channel, user)
                }

                if (reaction.emoji.name === emojis[1]) {
                    deleteReminders(data.id)
                    collector.stop()
                    return msg.edit(`${e.Notification} | ${user}, lembrete pra você.\n🗒️ | **${RemindMessage}**\n${e.Info} | Lembrete deletado.`)
                }

                return

            })

            .on('end', () => {
                if (validate) return
                deleteReminders(data.id)
                return msg.edit(`${e.Notification} | ${user}, lembrete pra você.\n🗒️ | **${RemindMessage}**\n${e.Info} | Lembrete deletado.`)
            })

        function NotifyUser() {
            deleteReminders(data.id)
            return user.send(`${e.Notification} | ${user}, lembrete pra você.\n🗒️ | **${RemindMessage}**`).catch(() => { })
        }

        return
    }

    if (data.Alerted && !client.Timeout(Time + 600000, DateNow))
        return deleteReminders(data.id)

    async function revalidateTime(Channel) {

        let msg = await Channel.send(`${e.Loading} | Quando que eu devo te lembrar novamente?\n> Formato 1: \`h, m, s\` - Exemplo: 1h 10m 40s *(1 hora, 10 minutos, 40 segundos)* ou \`1m 10s\`, \`2h 10m\`\n> Formato 2: \`30/01/2022 14:35:25\` - *(Os segundos são opcionais)*\n> Formato 3: \`hoje 14:35 | amanhã 14:35\`\n> Formato 4: \`14:35\``),
            CollectControl = false,
            collector = Channel.createMessageCollector({
                filter: (m) => m.author.id === user.id,
                time: 600000,
                dispose: true,
                max: 1
            })

                .on('collect', m => {

                    if (['cancel', 'cancelar', 'fechar', 'close'].includes(m.content))
                        return collector.stop()

                    let Args = m.content.trim().split(/ +/g),
                        DefinedTime = 0

                    if (Args[0].includes('/') || Args[0].includes(':') || ['hoje', 'today', 'tomorrow', 'amanhã'].includes(Args[0]?.toLowerCase())) {

                        let data = Args[0],
                            hour = Args[1]

                        if (['tomorrow', 'amanhã'].includes(data.toLowerCase()))
                            data = day(true)

                        if (['hoje', 'today'].includes(data.toLowerCase()))
                            data = day()

                        if (!hour && data.includes(':') && data.length <= 5) {
                            data = day()
                            hour = Args[0]
                        }

                        if (!data || !hour)
                            return m.reply(`${e.Deny} | A data informada não é a correta. Lembrete deletado.`)

                        let dataArray = data.split('/'),
                            hourArray = hour.split(':'),
                            dia = parseInt(dataArray[0]),
                            mes = parseInt(dataArray[1]) - 1,
                            ano = parseInt(dataArray[2]),
                            hora = parseInt(hourArray[0]),
                            minutos = parseInt(hourArray[1]),
                            segundos = parseInt(hourArray[2]) || 0

                        let date = moment.tz({ day: dia, month: mes, year: ano, hour: hora, minutes: minutos, seconds: segundos }, "America/Sao_Paulo")

                        if (!date.isValid())
                            return m.reply(`${e.Deny} | Data inválida! Verifique se a data esta realmente correta: \`dd/mm/aaaa hh:mm\` *(dia, mês, ano, horas, minutos)*\n${e.Info} | Exemplo: \`30/01/2022 14:35:25\` *(Os segundos são opcionais)* Lembrete deletado.`)

                        date = date.valueOf()

                        if (date < Date.now())
                            return m.reply(`${e.Deny} | O tempo do lembrete deve ser maior que o tempo de "agora", não acha? Lembrete deletado.`)

                        DefinedTime += date - Date.now()

                    } else {

                        for (let arg of Args) {

                            if (arg.slice(-1).includes('d')) {
                                let time = arg.replace(/d/g, '000') * 60 * 60 * 24
                                if (isNaN(time)) return cancelReminder()
                                DefinedTime += parseInt(time)
                                continue
                            }

                            if (arg.slice(-1).includes('h')) {
                                let time = arg.replace(/h/g, '000') * 60 * 60
                                if (isNaN(time)) return cancelReminder()
                                DefinedTime += parseInt(time)
                                continue
                            }

                            if (arg.slice(-1).includes('m')) {
                                let time = arg.replace(/m/g, '000') * 60
                                if (isNaN(time)) return cancelReminder()
                                DefinedTime += parseInt(time)
                                continue
                            }

                            if (arg.slice(-1).includes('s')) {
                                let time = arg.replace(/s/g, '000')
                                if (isNaN(time)) return cancelReminder()
                                DefinedTime += parseInt(time)
                                continue
                            }

                            return m.reply(`${e.Deny} | Tempo inválido! Verifique se o tempo dito segue esse formato: \`1d 2h 3m 4s\`. Lembrete deletado.`)
                        }
                    }

                    if (DefinedTime < 3000) return m.reply(`${e.Deny} | O tempo mínimo é de 3 segundos. Lembrete deletado.`)
                    if (DefinedTime > 31536000000) return m.reply(`${e.Deny} | O tempo limite é de 1 ano. Lembrete deletado.`)

                    CollectControl = true

                    editReminderTimer(DefinedTime, m)
                    return msg.delete().catch(() => { })

                    function cancelReminder() {
                        collector.stop()
                        return m.reply(`${e.Deny} | Tempo inválido! Use novamente o comando  e verifique se o tempo dito segue esse formato: \`1d 2h 3m 4s\` Lembrete deletado.`)
                    }

                })

                .on('end', () => {
                    if (CollectControl) return
                    deleteReminders(data.id)
                    return msg.delete().catch(() => { })
                })

        return

        async function editReminderTimer(DefinedTime, message) {

            await Database.Reminder.updateOne(
                { id: data.id },
                {
                    Time: DefinedTime,
                    DateNow: Date.now(),
                    $unset: { Alerted: 1 }
                }
            )

            return message.reply(`${e.ReminderBook} | Tudo bem! Eu vou te lembrar novamente em **${Date.format(DefinedTime)}** daqui **${client.GetTimeout(DefinedTime, 0, false)}**`).catch(() => { })
        }
    }

    return

}

async function deleteReminders(idData, all = false) {

    all
        ? await Database.Reminder.deleteMany({ userId: idData })
        : await Database.Reminder.deleteOne({ id: idData })

    return
}

function day(tomorrow = false) {

    const date = new Date()
    date.setHours(date.getHours() - 3)

    if (tomorrow)
        date.setDate(date.getDate() + 1)

    let Mes = FormatNumber(date.getMonth() + 1),
        Dia = FormatNumber(date.getDate()),
        Ano = date.getFullYear()

    return `${Dia}/${Mes}/${Ano}`
}

function FormatNumber(data) {
    return data < 10 ? `0${data}` : data
}

module.exports = ReminderSystem