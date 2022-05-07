const
    { e } = require('../../../JSON/emojis.json'),
    PassCode = require('../../../modules/functions/plugins/PassCode'),
    moment = require('moment-timezone'),
    Data = require('../../../modules/functions/plugins/data')

module.exports = {
    name: 'lembrar',
    aliases: ['lembrete', 'remind', 'reminder', 'lt', 'rm'],
    category: 'util',
    ClientPermissions: ['MANAGE_CHANNELS', 'MANAGE_MESSAGES', 'ADD_REACTIONS'],
    emoji: `${e.ReminderBook}`,
    usage: '<lembrete> <info>',
    description: 'Defina lembrete que eu te aviso no tempo definido',

    run: async (client, message, args, prefix, MessageEmbed, Database) => {

        let ReminderMessage = args.slice(0).join(' '),
            ReminderCode = PassCode(7).toUpperCase()

        if (['info', 'help', 'ajuda'].includes(args[0]?.toLowerCase())) return ReminderInfo()
        if (['me', 'eu', 'list', 'lista'].includes(args[0]?.toLowerCase())) return ReminderList()
        if (['delete', 'excluir', 'apagar', 'del'].includes(args[0]?.toLowerCase())) return DeleteReminder()

        if (!ReminderMessage)
            return message.reply(`🗒️ | Defina lembretes usando este comando.\n\`${prefix}lembrete Fazer tal coisa em tal lugar\``)

        if (ReminderMessage.length > 1000)
            return message.reply(`${e.Deny} | O lembrete não pode ultrapassar 1000 caracteres.`)

        let msg = await message.reply(`${e.Loading} | Quando que eu devo te lembrar?\n> Formato 1: \`h, m, s\` - Exemplo: 1h 10m 40s *(1 hora, 10 minutos, 40 segundos)* ou \`1m 10s\`, \`2h 10m\`\n> Formato 2: \`30/01/2022 14:35:25\` - *(Os segundos são opcionais)*\n> Formato 3: \`hoje 14:35 | amanhã 14:35\`\n> Formato 4: \`14:35\` ou \`30/01/2022\``),
            CollectControl = false,
            collector = message.channel.createMessageCollector({
                filter: (m) => m.author.id === message.author.id,
                time: 120000,
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

                        if (data.includes('/') && data.length === 10 && !hour)
                            hour = '12:00'

                        if (!data || !hour)
                            return message.reply(`${e.Deny} | A data informada não é a correta.`)

                        let dataArray = data.split('/'),
                            hourArray = hour.split(':'),
                            dia = parseInt(dataArray[0]),
                            mes = parseInt(dataArray[1]) - 1,
                            ano = parseInt(dataArray[2]),
                            hora = parseInt(hourArray[0]),
                            minutos = parseInt(hourArray[1]),
                            segundos = parseInt(hourArray[2]) || 0

                        let date = moment.tz({ day: dia, month: mes, year: ano, hour: hora, minutes: minutos, seconds: segundos }, "America/Sao_Paulo")

                        if (!date.isValid()) {
                            msg.delete().catch(() => { })
                            return m.reply(`${e.Deny} | Data inválida! Verifique se a data esta realmente correta: \`dd/mm/aaaa hh:mm\` *(dia, mês, ano, horas, minutos)*\n${e.Info} | Exemplo: \`30/01/2022 14:35:25\` *(Os segundos são opcionais)*\n${e.Info} | \`hoje 14:35\`\n${e.Info} | \`Amanhã 14:35\``)
                        }

                        date = date.valueOf()

                        if (date < Date.now()) return message.reply(`${e.Deny} | O tempo do lembrete deve ser maior que o tempo de "agora", não acha?`)

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

                            return m.reply(`${e.Deny} | Tempo inválido! Verifique se o tempo dito segue esse formato: \`1d 2h 3m 4s\``)
                        }
                    }

                    if (DefinedTime < 3000) return message.reply(`${e.Deny} | O tempo mínimo é de 3 segundos.`)
                    if (DefinedTime > 631152000000) return message.reply(`${e.Deny} | O tempo limite é de 20 anos.`)

                    CollectControl = true

                    CreateNewReminder(ReminderMessage, DefinedTime, m)
                    return msg.delete().catch(() => { })

                    function cancelReminder() {
                        collector.stop()
                        return m.reply(`${e.Deny} | Tempo inválido! Use novamente o comando  e verifique se o tempo dito segue esse formato: \`1d 2h 3m 4s\``)
                    }

                })

                .on('end', () => {
                    if (!CollectControl) return msg.delete(`${e.Deny} | Comando cancelado.`).catch(() => { })
                    return
                })

        return

        function CreateNewReminder(ReminderMessage, DefinedTime) {

            new Database.Reminder({
                id: ReminderCode,
                userId: message.author.id,
                RemindMessage: ReminderMessage,
                Time: DefinedTime,
                DateNow: Date.now(),
                ChannelId: message.channel.id
            }).save()

            return message.reply(`${e.ReminderBook} | Tudo bem! Eu vou te lembrar em **${Data(DefinedTime)}** daqui **${client.GetTimeout(DefinedTime, 0, false)}**`).catch(() => { })
        }

        function ReminderInfo() {

            return message.reply({
                embeds: [
                    new MessageEmbed()
                        .setColor(client.blue)
                        .setTitle(`${e.ReminderBook} ${client.user.username} Reminder System`)
                        .setDescription('Você pode definir lembretes para que eu te lembre no tempo definido.')
                        .addFields(
                            {
                                name: `${e.Gear} Comando de ativação`,
                                value: `\`${prefix}lembrar <Seu Lembrete...>\`\nExemplo: \`${prefix}lembrar Jogo com a turma\``
                            },
                            {
                                name: '⏰ Formato de tempo',
                                value: `1. Data escrita: \`30/01/2022 14:35:25\` *(Os segundos são opcionais)*\n2. Data resumida: \`1d 4m 10s\` *(1 dia 4 minutos e 10 segundos)*\n3. Dia escrito: \`Hoje 14:25\` ou \`Amanhã 14:35\`\n4. Hora escrita: \`14:35\``
                            },
                            {
                                name: `${e.Commands} Lista de Lembretes Ativos`,
                                value: `1. \`${prefix}lembrar lista\` Seus lembretes com opções\n2. \`${prefix}lembrar lista full\` Todos os lembretes *(Sem opções)*\n3. \`${prefix}lembrar lista <ReminderCode>\` Dados de um lembrete especifico`
                            },
                            {
                                name: `${e.Deny} Exclua os lembretes`,
                                value: `1. \`${prefix}lembrar delete <ReminderCode>\` Deleta um lembrete único\n2. \`${prefix}lembrar delete all\` Deleta todos os lembretes`
                            },
                            {
                                name: '+ Atalhos',
                                value: `${['lembrete', 'remind', 'reminder', 'lt', 'rm'].map(cmd => `\`${prefix}${cmd}\``).join(', ')}`
                            }
                        )
                ]
            })

        }

        async function ReminderList() {

            if (['all', 'todos', 'full', 'tudo'].includes(args[1]?.toLowerCase())) return reminderAll()
            if (args[1]) return detailReminder()
            return listDetails()

            async function reminderAll() {

                let userRemindersData = await Database.Reminder.find({ userId: message.author.id }) || [],
                    RemindersData = userRemindersData.filter(data => !data.Alerted)

                if (!RemindersData || RemindersData.length === 0)
                    return message.reply(`${e.Info} | Você não tem lembretes ativos.`)

                let Embeds = EmbedGenerator(),
                    Control = 0,
                    Emojis = ['⬅️', '➡️', '❌'],
                    msg = await message.reply({ embeds: [Embeds[0]] })

                if (Embeds.length > 1)
                    for (const emoji of Emojis)
                        msg.react(emoji).catch(() => { })

                const collector = msg.createReactionCollector({
                    filter: (reaction, user) => ['⬅️', '➡️', '❌'].includes(reaction.emoji.name) && user.id === message.author.id,
                    idle: 30000
                })

                    .on('collect', (reaction) => {

                        if (reaction.emoji.name === '❌')
                            return collector.stop()

                        return reaction.emoji.name === '⬅️'
                            ? (() => {

                                Control--
                                return Embeds[Control] ? msg.edit({ embeds: [Embeds[Control]] }).catch(() => { }) : Control++

                            })()
                            : (() => {

                                Control++
                                return Embeds[Control] ? msg.edit({ embeds: [Embeds[Control]] }).catch(() => { }) : Control--

                            })()
                    })
                    .on('end', () => {

                        return msg.edit({ content: `${e.Deny} Comando cancelado` }).catch(() => { })

                    })


                function EmbedGenerator() {

                    let amount = 10,
                        Page = 1,
                        embeds = [],
                        length = RemindersData.length / 10 <= 1 ? 1 : parseInt((RemindersData.length / 10) + 1)

                    for (let i = 0; i < RemindersData.length; i += 10) {

                        let current = RemindersData.slice(i, amount),
                            description = current.map(r => KeysFormat(r)).join("\n")

                        if (current.length > 0) {

                            embeds.push({
                                color: client.blue,
                                title: `🗒️ Lista de lembretes ativos - ${Page}/${length}`,
                                description: `${description}`,
                                footer: {
                                    text: `${RemindersData.length} lembretes contabilizados | ${prefix}reminder info <ReminderCode>`
                                },
                            })

                            Page++
                            amount += 10

                        }

                    }

                    function KeysFormat(Remind) {

                        let Message = Remind.RemindMessage.length > 150 ? 'Lembrete muito longo' : Remind.RemindMessage,
                            Time = Remind.Time,
                            DateNow = Remind.DateNow,
                            timeoutFormated = `${e.Loading} | \`${client.GetTimeout(Time, DateNow)}\``

                        if (timeoutFormated === `${e.Loading} | \`Invalid Cooldown Acess Bad Formated\``) {
                            delReminder(Remind.id)
                            timeoutFormated = `${e.Deny} | \`Tempo indefinido, lembrete deletedo.\``
                        }

                        return `> \`${Remind.id}\` | ${Message}\n> ${timeoutFormated}\n--------------------`

                    }

                    return embeds;
                }
            }

            async function detailReminder() {

                let reminderCode = args[1],
                    allReminderFromAuthor = await Database.Reminder.find({ userId: message.author.id }) || []

                if (!allReminderFromAuthor || allReminderFromAuthor.length === 0) return message.reply(`${e.Deny} | Você não tem nenhum lembrete ativo.`)

                let reminderInfo = allReminderFromAuthor.find(data => data.id === reminderCode)

                if (!reminderInfo) return message.reply(`${e.Deny} | Você não tem nenhum lembrete com esse código.`)

                let Message = reminderInfo.RemindMessage.length > 200 ? 'Lembrete muito longo' : reminderInfo.RemindMessage,
                    Time = reminderInfo.Time,
                    DateNow = reminderInfo.DateNow,
                    timeoutFormated = `${e.Loading} | \`${client.GetTimeout(Time, DateNow)}\``,
                    channel = client.channels.cache.get(reminderInfo.ChannelId) || 'Privado'

                const embed = new MessageEmbed()
                    .setColor(client.blue)
                    .setTitle(`${e.Info} | Informações de lembrete`)
                    .setDescription(`:id: **Código:** \`${reminderInfo.id}\`\n📑 **Mensagem:** ${Message}\n⏱️ **Tempo:** ${timeoutFormated}\n#️⃣ **Canal:** ${channel ? channel : 'Privado'}`)

                let msg = await message.reply({ embeds: [embed] }),
                    emojis = ['❌', '🗑️'],
                    validate = false

                for (let i of emojis) msg.react(i).catch(() => { })

                const collector = msg.createReactionCollector({
                    filter: (reaction, user) => emojis.includes(reaction.emoji.name) && user.id === message.author.id,
                    time: 30000,
                    errors: ['time']
                })

                    .on('collect', async (reaction) => {

                        if (reaction.emoji.name === emojis[0]) return collector.stop()
                        validate = true

                        if (reaction.emoji.name === emojis[1]) {

                            embed.setColor('GREEN').setTitle(`${e.Info} | Informações de lembrete | DELETADO`)
                            await Database.Reminder.deleteOne({ id: reminderCode })
                            return msg.edit({ embeds: [embed] }).catch(() => { })

                        }

                        return

                    })

                    .on('end', () => {

                        if (validate) return
                        embed.setColor('RED').setFooter({ text: 'Comando cancelado' })
                        return msg.edit({ embeds: [embed] }).catch(() => { })
                    })

            }

            async function listDetails() {

                let RemindersData = await Database.Reminder.find({ userId: message.author.id }) || [],
                    allData = RemindersData.filter(data => !data.Alerted)

                if (!allData || allData.length === 0) return message.reply(`${e.Deny} | Nenhum lembrete ativo.`)

                let control = 0,
                    deletedArray = [],
                    listData = EmbedGenerator(allData),
                    msg = await message.reply({ embeds: [listData[0]?.embed] }),
                    emojis = ['⏪', '⬅️', '➡️', '⏩', '❌', '🗑️']

                if (listData.length <= 1) {
                    msg.react('❌').catch(() => { })
                    msg.react('🗑️').catch(() => { })
                } else for (let i of emojis) msg.react(i).catch(() => { })

                const collector = msg.createReactionCollector({
                    filter: (reaction, user) => emojis.includes(reaction.emoji.name) && user.id === message.author.id,
                    idle: 30000,
                    errors: ['time']
                })

                    .on('collect', async (reaction) => {

                        if (reaction.emoji.name === '❌') return collector.stop()

                        if (reaction.emoji.name === '🗑️') {

                            let divise = listData[control],
                                reminderId = divise?.reminderId,
                                embed = divise?.embed

                            if (deletedArray.includes(reminderId)) return

                            embed.color = 'RED'
                            embed.title = `${e.Info} | Informações dos lembretes | DELETADO`

                            await Database.Reminder.deleteOne({ id: reminderId })
                            msg.edit({ embeds: [embed] }).catch(() => { })
                            deletedArray.push(reminderId)
                            message.channel.send(`${e.Check} | ${message.author}, o lembrete \`${reminderId}\` foi deletado com sucesso!`)

                            if (listData <= 1) return collector.stop()
                            return
                        }

                        if (reaction.emoji.name === '⏪') {
                            if (control === 0) return
                            control = 0
                            return msg.edit({ embeds: [listData[0]?.embed] }).catch(() => { })
                        }

                        if (reaction.emoji.name === '⬅️') {
                            control === 0 ? control = listData.length - 1 : control--
                            return listData[control]?.embed ? msg.edit({ embeds: [listData[control]?.embed] }).catch(() => { }) : control++
                        }

                        if (reaction.emoji.name === '➡️') {
                            control === listData.length - 1 ? control = 0 : control++
                            return listData[control]?.embed ? msg.edit({ embeds: [listData[control]?.embed] }).catch(() => { }) : control--
                        }

                        if (reaction.emoji.name === '⏩') {
                            if (control === listData.length) return
                            control = listData.length - 1
                            return listData[control]?.embed ? msg.edit({ embeds: [listData[control]?.embed] }).catch(() => { }) : control--
                        }

                        return

                    })

                    .on('end', () => msg.edit(`${e.Deny} | Comando cancelado.`).catch(() => { }))

                function EmbedGenerator(array) {

                    let amount = 1,
                        embeds = []

                    for (let i = 0; i < array.length; i++) {

                        let current = array.slice(i, amount),
                            reminderId = '',
                            description = current.map(r => {

                                let Message = r.RemindMessage.length > 200 ? 'Lembrete muito longo' : r.RemindMessage,
                                    Time = r.Time,
                                    DateNow = r.DateNow,
                                    timeoutFormated = `${e.Loading} | \`${client.GetTimeout(Time, DateNow)}\``,
                                    channel = client.channels.cache.get(r.ChannelId) || 'Privado'

                                reminderId = r.id

                                return `:id: **Código:** \`${r.id}\`\n📑 **Mensagem:** ${Message}\n⏱️ **Tempo:** ${timeoutFormated}\n#️⃣ **Canal:** ${channel}`
                            }).join("\n")

                        if (current.length > 0) {

                            embeds.push({
                                embed: {
                                    color: client.blue,
                                    title: `${e.Info} | Informações dos lembretes`,
                                    description: `${description || 'Nenhum lembrente encontrado'}`,
                                    footer: {
                                        text: `${array.length} lembretes contabilizados | ${prefix}reminder list <ReminderCode>`
                                    }
                                },
                                reminderId: reminderId
                            })

                            amount++

                        }

                    }

                    return embeds;
                }
            }

        }

        async function delReminder(ReminderCode) {
            await Database.Reminder.deleteOne({ id: ReminderCode })
            return
        }

        async function DeleteReminder() {

            let CodeKeys = await Database.Reminder.find({ userId: message.author.id }, 'id') || []
            Code = args[1]

            if (CodeKeys.length === 0)
                return message.reply(`${e.Info} | Você não possui nenhum lembrete ativo.`)

            if (['todos', 'all', 'tudo'].includes(args[1]?.toLowerCase())) return DeleteAllReminders()

            if (!Code)
                return message.reply(`${e.Info} | Você precisa falar o ReminderCode do seu lembrete para apaga-lo. Você pode vê-los e apaga-los usando \`${prefix}lembrar lista\``)

            if (!CodeKeys.find(CK => CK.id === Code))
                return message.reply(`${e.Deny} | Este ReminderCode não confere com nenhum código dos seus lembretes.`)

            await Database.Reminder.deleteOne({ id: Code })

            return message.reply(`${e.Check} | Lembrete deletado com sucesso!`)

            async function DeleteAllReminders() {

                let msg = await message.reply(`${e.QuestionMark} | Você realmente quer apagar todos os seus lembretes?`),
                    emojis = ['✅', '❌'],
                    validate = false

                for (let i of emojis) msg.react(i).catch(() => { })

                const collector = msg.createReactionCollector({
                    filter: (reaction, user) => emojis.includes(reaction.emoji.name) && user.id === message.author.id,
                    time: 30000,
                    errors: ['time']
                })

                collector.on('collect', async (reaction) => {

                    if (reaction.emoji.name === emojis[1]) return collector.stop()

                    await Database.Reminder.deleteMany({ userId: message.author.id })
                    return msg.edit(`${e.Check} | Todos os seus lembretes foram deletados com sucesso!`).catch(() => { })

                })

                collector.on('end', () => {

                    if (validate) return
                    return msg.edit(`${e.Deny} | Comando cancelado.`).catch(() => { })
                })

            }

        }

    }
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