const
    { e } = require('../../../database/emojis.json'),
    GetDate = require('../../../Routes/functions/data'),
    { Reminders } = require('../../../Routes/functions/database'),
    ms = require('ms'),
    parsems = require('parse-ms'),
    PassCode = require('../../../Routes/functions/PassCode'),
    Error = require('../../../Routes/functions/errors')

module.exports = {
    name: 'lembrar',
    aliases: ['lembrete', 'remind', 'reminder', 'lt', 'rm'],
    category: 'util',
    ClientPermissions: ['MANAGE_CHANNELS', 'MANAGE_MESSAGES', 'ADD_REACTIONS'],
    emoji: `${e.ReminderBook}`,
    usage: '<lembrete> <Tempo> | <lembrete> <info>',
    description: 'Defina lembrete que eu te aviso no tempo definido',

    run: async (client, message, args, prefix, db, MessageEmbed, request, sdb) => {

        let ReminderMessage = args.slice(0).join(' ')
        if (['info', 'help', 'ajuda'].includes(args[0]?.toLowerCase())) return ReminderInfo()
        if (['me', 'eu', 'list', 'lista'].includes(args[0]?.toLowerCase())) return ReminderList()
        if (['delete', 'excluir', 'apagar'].includes(args[0]?.toLowerCase())) return DeleteReminder()

        if (!ReminderMessage)
            return message.reply(`🗒️ | Defina lembretes usando este comando.\n\`${prefix}lembrete Fazer tal coisa em tal lugar\``)

        if (ReminderMessage.length > 1000)
            return message.reply(`${e.Deny} | O lembrete não pode ultrapassar 1000 caracteres.`)

        let msg = await message.reply(`${e.Loading} | Quando que eu devo te lembrar? Lembresse de me dizer no seguinte formato: \`h, m, s\`. Exemplo: 1h 10m 40s *(1 hora, 10 minutos, 40 segundos)* ou \`1m 10s\`, \`2h 10m\``),
            ReminderCode = PassCode(7).toUpperCase(),
            CollectControl = false

        const collector = message.channel.createMessageCollector({
            filter: (m) => m.author.id === message.author.id,
            time: 60000,
            max: 1
        });

        collector.on('collect', m => {

            const Args = m.content.trim().split(/ +/g)

            if (Args[3]) return AllTime()
            if (Args[2]) return HoursMinutesSeconds()
            if (Args[1]) return TwoArguments()
            if (Args[0]) return OnlyOneArgument()
            return msg.edit(`${e.Deny} | Comando cancelado por uso irregular/desconhecido.`).catch(() => { })

            function AllTime() {

                let Days = Args[0],
                    Hour = Args[1],
                    Minutes = Args[2],
                    Seconds = Args[3]

                if (!Days.slice(-1).includes('d') || !Hour.slice(-1).includes('h') || !Minutes.slice(-1).includes('m') || !Seconds.slice(-1).includes('s')) {
                    msg.edit(`${e.Deny} | Comando cancelado.`).catch(() => { })
                    return m.reply(`${e.Deny} | Tempo inválido! Verifique se o tempo dito segue esse formato: \`1h 2m 3s\``)
                }

                let Dias = Days.replace(/d/g, ''),
                    Hora = Hour.replace(/h/g, ''),
                    Minutos = Minutes.replace(/m/g, ''),
                    Segundos = Seconds.replace(/s/g, ''),
                    DefinedTime

                if (isNaN(Dias) || isNaN(Hora) || isNaN(Minutos) || isNaN(Segundos))
                    return message.reply(`${e.Deny} | O tempo informado não é um número.\nEx: \`1h 2m 3s\``)

                if (Dias < 1 || Hora < 1 || Minutos < 1, Segundos < 1) {
                    msg.edit(`${e.Deny} | Comando cancelado.`).catch(() => { })
                    return m.reply(`${e.Deny} | Os tempos não podem ser menores que 1.`)
                }

                try {
                    DefinedTime = ms(Days) + ms(Hour) + ms(Minutes) + ms(Seconds)
                } catch (err) {
                    msg.edit(`${e.Deny} | Comando cancelado.`).catch(() => { })
                    return m.reply(`${e.Deny} | Definição inválida. Tenta escrever igual nos exemplos do comando, ok?`)
                }

                CollectControl = true

                Reminders.set(`Reminders.${message.author.id}.${ReminderCode}`, {
                    RemindMessage: ReminderMessage,
                    Time: DefinedTime,
                    DateNow: Date.now(),
                    ChannelId: message.channel.id
                })

                let Data = GetDate(DefinedTime)

                msg.delete().catch(() => { })
                return m.reply(`${e.ReminderBook} | Tudo bem! Eu vou te lembrar de "**${ReminderMessage}**" em **${Data}**`).catch(() => { })

            }

            function HoursMinutesSeconds() {

                let Hour = Args[0],
                    Minutes = Args[1],
                    Seconds = Args[2]

                if (!Hour.slice(-1).includes('h') || !Minutes.slice(-1).includes('m') || !Seconds.slice(-1).includes('s')) {
                    msg.edit(`${e.Deny} | Comando cancelado.`).catch(() => { })
                    return m.reply(`${e.Deny} | Tempo inválido! Verifique se o tempo dito segue esse formato: \`1h 2m 3s\``)
                }

                let Hora = Hour.replace(/h/g, ''),
                    Minutos = Minutes.replace(/m/g, ''),
                    Segundos = Seconds.replace(/s/g, ''),
                    DefinedTime

                if (isNaN(Hora) || isNaN(Minutos) || isNaN(Segundos)) {
                    msg.edit(`${e.Deny} | Comando cancelado.`).catch(() => { })
                    return m.reply(`${e.Deny} | O tempo informado não é um número.\nEx: \`1h 2m 3s\``)
                }

                if (Hora < 1 || Minutos < 1 || Segundos < 1) {
                    msg.edit(`${e.Deny} | Comando cancelado.`).catch(() => { })
                    return m.reply(`${e.Deny} | Os tempos não podem ser menores que 1.`)
                }

                try {
                    DefinedTime = ms(Hour) + ms(Minutes) + ms(Seconds)
                } catch (err) {
                    msg.edit(`${e.Deny} | Comando cancelado.`).catch(() => { })
                    return m.reply(`${e.Deny} | Definição inválida. Tenta escrever igual nos exemplos do comando, ok?`)
                }

                CollectControl = true

                Reminders.set(`Reminders.${message.author.id}.${ReminderCode}`, {
                    RemindMessage: ReminderMessage,
                    Time: DefinedTime,
                    DateNow: Date.now(),
                    ChannelId: message.channel.id
                })

                let Data = GetDate(DefinedTime)

                msg.delete().catch(() => { })
                return msg.reply(`${e.ReminderBook} | Tudo bem! Eu vou te lembrar de "**${ReminderMessage}**" em **${Data}**`).catch(() => { })

            }

            function TwoArguments() {

                let FirstTime = Args[0],
                    SecondTime = Args[1],
                    LastLetterFirstTime = FirstTime.slice(-1),
                    LastLetterSecondTime = SecondTime.slice(-1),
                    Control1 = false,
                    Control2 = false

                if (LastLetterFirstTime === LastLetterSecondTime) {
                    msg.edit(`${e.Deny} | Comando cancelado.`).catch(() => { })
                    return m.reply(`${e.Deny} | Os tempos não devem ser do mesmo tipo.`)
                }

                for (const i of ['d', 'h', 'm']) {

                    if (LastLetterFirstTime === i) {
                        Control1 = false
                        break;
                    }
                    Control1 = true

                }

                for (const i of ['s', 'm']) {

                    if (LastLetterSecondTime === i) {
                        Control2 = false
                        break;
                    }
                    Control2 = true

                }

                if (Control1 || Control2) {
                    msg.edit(`${e.Deny} | Comando cancelado.`).catch(() => { })
                    return m.reply(`${e.Deny} | Tempo inválido! Verifique se o tempo dito segue esse formato: \`1h 2m\` ou \`10m 40s\``)
                }

                let First = FirstTime.replace(/d|h|m/g, ''),
                    Second = SecondTime.replace(/m|s/g, ''),
                    DefinedTime

                if (isNaN(First) || isNaN(Second)) {
                    msg.edit(`${e.Deny} | Comando cancelado.`).catch(() => { })
                    return m.reply(`${e.Deny} | O tempo informado não é um número.\nEx: \`1h 2m\``)
                }

                if (First < 1 || Second < 1) {
                    msg.edit(`${e.Deny} | Comando cancelado.`).catch(() => { })
                    return m.reply(`${e.Deny} | Os tempos não podem ser menores que 1.`)
                }

                try {
                    DefinedTime = ms(FirstTime) + ms(SecondTime)
                } catch (err) {
                    msg.edit(`${e.Deny} | Comando cancelado.`).catch(() => { })
                    return m.reply(`${e.Deny} | Definição inválida. Tenta escrever igual nos exemplos do comando, ok?`)
                }

                CollectControl = true

                Reminders.set(`Reminders.${message.author.id}.${ReminderCode}`, {
                    RemindMessage: ReminderMessage,
                    Time: DefinedTime,
                    DateNow: Date.now(),
                    ChannelId: message.channel.id
                })

                let Data = GetDate(DefinedTime)

                msg.delete().catch(() => { })
                return m.reply(`${e.ReminderBook} | Tudo bem! Eu vou te lembrar de "**${ReminderMessage}**" em **${Data}**`).catch(() => { })

            }

            function OnlyOneArgument() {

                let Time = Args[0],
                    LastCaracter = Time.slice(-1),
                    ValidLetters = ['h', 'm', 's', 'd'],
                    Invalid = false

                for (const letra of ValidLetters) {

                    if (LastCaracter === letra) {
                        Invalid = false
                        break
                    }
                    Invalid = true

                }

                if (Invalid) {
                    msg.edit(`${e.Deny} | Comando cancelado.`).catch(() => { })
                    return m.reply(`${e.Deny} | Tempo inválido! Verifique se o tempo dito segue esse formato: \`1h\``)
                }

                let Timer = Time.replace(/h|m|s|d/g, ''),
                    DefinedTime

                if (Timer < 1) {
                    msg.edit(`${e.Deny} | Comando cancelado.`).catch(() => { })
                    return m.reply(`${e.Deny} | O tempo não pode ser igual ou menor 0`)
                }

                if (isNaN(Timer)) {
                    msg.edit(`${e.Deny} | Comando cancelado.`).catch(() => { })
                    return m.reply(`${e.Deny} | O tempo informado não é um número.\nEx: \`1h\``)
                }

                try {
                    DefinedTime = ms(Time)
                } catch (err) {
                    msg.edit(`${e.Deny} | Comando cancelado.`).catch(() => { })
                    return m.reply(`${e.Deny} | Definição inválida. Tenta escrever igual nos exemplos do comando, ok?`)
                }

                CollectControl = true

                Reminders.set(`Reminders.${message.author.id}.${ReminderCode}`, {
                    RemindMessage: ReminderMessage,
                    Time: DefinedTime,
                    DateNow: Date.now(),
                    ChannelId: message.channel.id
                })

                let Data = GetDate(DefinedTime)

                msg.delete().catch(() => { })
                return m.reply(`${e.ReminderBook} | Tudo bem! Eu vou te lembrar de "**${ReminderMessage}**" em **${Data}**`).catch((err) => {
                    return Error(message, err)
                })

            }

        })

        collector.on('end', () => {
            if (!CollectControl) return msg.edit(`${e.Deny} | Comando cancelado.`).catch(() => { })
            return
        })

        function ReminderInfo() {

            let aliases = ['lembrete', 'remind', 'reminder', 'lt', 'rm']

            return message.reply({
                embeds: [
                    new MessageEmbed()
                        .setColor(client.blue)
                        .setTitle(`${e.ReminderBook} ${client.user.username} Reminder System`)
                        .setDescription(`Você pode definir lembretes e eu vou lembrar você no tempo definido.`)
                        .addFields(
                            {
                                name: `${e.Gear} Comando de ativação`,
                                value: `\`${prefix}lembrar <Seu Lembrete...>\`\nExemplo: \`${prefix}lembrar Jogo com a turma\` - Uma verificação de tempo vai aparecer e é só seguir os exemplos.`
                            },
                            {
                                name: `${e.Commands} Lista de Lembretes Ativos`,
                                value: `\`${prefix}lembrar lista\``
                            },
                            {
                                name: `${e.Deny} Exclua os lembretes`,
                                value: `\`${prefix}lembrar delete [all/R-Code]\``
                            },
                            {
                                name: '+ Atalhos',
                                value: `${aliases.map(cmd => `\`${prefix}${cmd}\``).join(', ')}`
                            }
                        )
                ]
            })
        }

        async function ReminderList() {

            let CodeKeys = Object.keys(Reminders.get(`Reminders.${message.author.id}`) || {})

            if (CodeKeys.length === 0)
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

                .on('collect', (reaction, user) => {

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
                    length = CodeKeys.length / 10 <= 1 ? 1 : parseInt((CodeKeys.length / 10) + 1)

                for (let i = 0; i < CodeKeys.length; i += 10) {

                    let current = CodeKeys.slice(i, amount),
                        description = current.map(r => `${KeysFormat(r)}\n---------------`).join("\n")

                    if (current.length > 0) {

                        embeds.push({
                            color: client.blue,
                            title: `🗒️ Lista de lembretes ativos - ${Page}/${length}`,
                            description: `${description}`,
                            footer: {
                                text: `${CodeKeys.length} lembretes contabilizados`
                            },
                        })

                        Page++
                        amount += 10

                    }

                }

                function KeysFormat(r) {

                    let Remind = Reminders.get(`Reminders.${message.author.id}.${r}`),
                        Message = Remind.RemindMessage.length > 150 ? 'Lembrete muito longo' : Remind.RemindMessage,
                        Time = Remind.Time,
                        DateNow = Remind.DateNow

                    try {
                        let ParseTime = parsems(Time - (Date.now() - DateNow)),
                            Dias = ParseTime.days > 0 ? `${ParseTime.days} dias ` : '',
                            Horas = ParseTime.hours > 0 ? `${ParseTime.hours} horas ` : '',
                            Minutos = ParseTime.minutes > 0 ? `${ParseTime.minutes} minutos ` : '',
                            Segundos = ParseTime.seconds > 0 ? `${ParseTime.seconds} segundos` : '',
                            Nothing = !Dias && !Horas && !Minutos && !Segundos ? 'Mas o que é isso?' : ''

                        Time = `${Dias}${Horas}${Minutos}${Segundos}${Nothing}`
                    } catch (err) {
                        Reminders.delete(`Reminders.${message.author.id}.${r}`)
                        Time = 'Tempo Indefinido.'
                    }

                    return `> \`${r}\` | ${Message}\n> ${e.Loading} \`${Time}\``

                }

                return embeds;
            }

        }

        function DeleteReminder() {

            let CodeKeys = Object.keys(Reminders.get(`Reminders.${message.author.id}`) || {}),
                Code = args[1]

            if (CodeKeys.length === 0)
                return message.reply(`${e.Info} | Você não possui nenhum lembrete ativo.`)

            if (['todos', 'all', 'tudo'].includes(args[1]?.toLowerCase())) return DeleteAllReminders()

            if (!Code)
                return message.reply(`${e.Info} | Você precisa falar o R-Code do seu lembrete para apaga-lo. Você pode vê-los usando \`${prefix}lembrar lista\``)

            if (!CodeKeys.includes(Code))
                return message.reply(`${e.Deny} | Este R-Code não confere com nenhum código dos seus lembretes.`)

            Reminders.delete(`Reminders.${message.author.id}.${Code}`)
            return message.reply(`${e.Check} | Lembrete deletado com sucesso!`)

            function DeleteAllReminders() {

                Reminders.delete(`Reminders.${message.author.id}`)
                return message.reply(`${e.Check} | Todos os seus lembretes foram deletados com sucesso!`)

            }

        }

    }
}