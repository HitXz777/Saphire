const { e } = require('../../../JSON/emojis.json')

module.exports = {
    name: 'lembrar',
    aliases: ['lembrete', 'remind', 'reminder', 'lt', 'rm', 'remember'],
    category: 'util',
    ClientPermissions: ['MANAGE_CHANNELS', 'MANAGE_MESSAGES', 'ADD_REACTIONS'],
    emoji: e.ReminderBook,
    usage: '<lembrete> <info>',
    description: 'Defina lembrete que eu te aviso no tempo definido',

    execute: async (client, message, args, prefix, MessageEmbed, Database) => {

        let remindersMember = await Database.Reminder.find({ userId: message.author.id })

        let buttons = [{
            type: 1,
            components: [
                {
                    type: 2,
                    label: 'NOVO LEMBRETE',
                    emoji: e.ReminderBook || '🏷️',
                    custom_id: 'newReminder',
                    style: 'SUCCESS'
                },
                {
                    type: 2,
                    label: 'CANCELAR',
                    emoji: e.Deny || '❌',
                    custom_id: 'cancel',
                    style: 'DANGER'
                }
            ]
        }],
            control = { deletedReminders: [], embedIndex: 0 }

        if (remindersMember.length >= 1)
            buttons[0].components.splice(1, 0, {
                type: 2,
                label: 'LISTA DE LEMBRETES',
                emoji: e.CommandsCount || '🏷️',
                custom_id: 'listRemembers',
                style: 'PRIMARY'
            })

        let embed = new MessageEmbed()
            .setColor(client.blue)
            .setTitle(`${e.ReminderBook} ${client.user.username} Reminder System`)
            .setDescription('Você pode definir lembretes para que eu te lembre no tempo definido.')
            .addFields(
                {
                    name: `${e.Gear} Comando de ativação`,
                    value: 'Clique no botão "NOVO LEMBRETE" e crie seu lembrete. Fácil, não?'
                },
                {
                    name: '⏰ Formato de tempo',
                    value: `1. Data escrita: \`30/01/2022 14:35:25\` *(Os segundos são opcionais)*\n2. Data resumida: \`1d 4m 10s\` *(1 dia 4 minutos e 10 segundos)*\n3. Dia escrito: \`Hoje 14:25\` ou \`Amanhã 14:35\`\n4. Hora escrita: \`14:35\``
                },
                {
                    name: `${e.Commands} Lista de Lembretes Ativos`,
                    value: `Na lista de lembretes, você tem total controle sobre eles, desde os tempos até exclusão dos mesmos.`
                },
                {
                    name: '+ Atalhos',
                    value: `${['lembrete', 'remind', 'reminder', 'lt', 'rm'].map(cmd => `\`${prefix}${cmd}\``).join(', ')}`
                }
            )

        let msg = await message.reply({
            embeds: [embed],
            components: buttons
        })

    let collector = msg.createMessageComponentCollector({
            filter: int => int.user.id === message.author.id,
            idle: 60000,
            errors: ['idle']
        })
            .on('collect', interaction => {

                let { customId } = interaction

                if (customId === 'menu') customId = interaction.values[0]
                if (customId === 'newReminder') return msg.edit({ content: `${e.Check} | Solicitação aceita.`, components: [], embeds: [] })

                interaction.deferUpdate().catch(() => { })
                if (customId === 'delete') return deleteReminder()
                if (customId === 'deleteAll') return deleteReminder(true)
                if (customId === 'restart') return msg.edit({
                    content: `${e.ReminderBook} | Aqui você pode criar lembretes, vê-los e exclui-los. Como posso te ajudar por agora?`,
                    embeds: [embed],
                    components: buttons
                })
                if (['firstEmbed', 'left', 'right', 'lastEmbed'].includes(customId)) return tradeEmbed(customId)
                if (customId === 'listRemembers') return ReminderList(msg)
                if (customId === 'cancel') return collector.stop()
                return
            })
            .on('end', () => {

                let embed = msg.embeds[0]

                if (!embed) return msg.edit({ components: [], embeds: [], content: `${e.Deny} | Comando cancelado.` }).catch(() => { })

                embed.color = client.red
                embed.footer = { text: 'Comando cancelado' }
                return msg.edit({ components: [], embeds: [embed], content: `${e.Deny} | Comando cancelado.` }).catch(() => { })
            })

        return

        async function ReminderList(msg) {

            let RemindersData = await Database.Reminder.find({ userId: message.author.id }) || [],
                allData = RemindersData.filter(data => !data.Alerted)

            if (!allData || allData.length === 0) {

                buttons[0].components.find(d => d.custom_id === 'listRemembers').disabled = true

                return msg.edit({
                    content: `${e.Deny} | Nenhum lembrete ativo.`,
                    components: buttons
                }).catch(() => { })
            }

            control.listData = EmbedGenerator(allData)

            let buttonsControl = {
                type: 1,
                components: [
                    {
                        type: 2,
                        emoji: '⬅️',
                        custom_id: 'left',
                        style: 'PRIMARY'
                    },
                    {
                        type: 2,
                        emoji: '➡️',
                        custom_id: 'right',
                        style: 'PRIMARY'
                    }
                ]
            }

            if (control.listData.length >= 3) {
                buttonsControl.components.unshift({
                    type: 2,
                    emoji: '⏪',
                    custom_id: 'firstEmbed',
                    style: 'PRIMARY'
                })
                buttonsControl.components.push(
                    {
                        type: 2,
                        emoji: '⏩',
                        custom_id: 'lastEmbed',
                        style: 'PRIMARY'
                    })
            }

            let selectMenuObject = {
                type: 1,
                components: [{
                    type: 3,
                    custom_id: 'menu',
                    placeholder: 'Mais opções',
                    options: [
                        {
                            label: 'NOVO LEMBRETE',
                            emoji: e.ReminderBook || '🏷️',
                            description: 'Crie um novo lembrete',
                            value: 'newReminder'
                        },
                        {
                            label: 'PARA O COMEÇO',
                            emoji: '♻️',
                            description: 'Voltar para a página inicial',
                            value: 'restart'
                        },

                        {
                            label: 'CANCELAR COMANDO',
                            emoji: '❌',
                            description: 'Forçar o encerramento do comando',
                            value: 'cancel'
                        },
                        {
                            label: 'DELETAR LEMBRETE',
                            emoji: e.Trash || '🗑️',
                            description: 'Deletar o lembrete para todo o sempre',
                            value: 'delete'
                        }
                    ]
                }]
            }

            let validComponents = [selectMenuObject]

            if (control.listData.length > 1) {
                validComponents.unshift(buttonsControl)
                selectMenuObject.components[0].options.push(
                    {
                        label: 'DELETAR TUDO',
                        emoji: e.Trash || '🗑️',
                        description: 'Deletar todos os lembrete de um só vez',
                        value: 'deleteAll'
                    })
            }

            return msg.edit({ content: null, embeds: [control.listData[0]?.embed], components: validComponents }).catch(() => { })

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

                            return `:id: **Código:** \`${r.id}\`\n📑 **Mensagem:** ${Message.length > 40 ? `${Message.slice(0, 40)}...` : Message}\n⏱️ **Tempo:** ${timeoutFormated}\n#️⃣ **Canal:** ${channel}`
                        }).join("\n")

                    if (current.length > 0) {

                        embeds.push({
                            embed: {
                                color: client.blue,
                                title: `${e.Info} | Informações dos lembretes`,
                                description: `${description || 'Nenhum lembrente encontrado'}`,
                                footer: {
                                    text: `${array.length} lembretes contabilizados`
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

        function tradeEmbed(value) {

            if (value === 'firstEmbed') {
                if (control.embedIndex === 0) return
                control.embedIndex = 0
                return msg.edit({ embeds: [control.listData[0]?.embed] }).catch(() => { })
            }

            if (value === 'left') {
                control.embedIndex === 0 ? control.embedIndex = control.listData.length - 1 : control.embedIndex--
                return control.listData[control.embedIndex]?.embed ? msg.edit({ embeds: [control.listData[control.embedIndex]?.embed] }).catch(() => { }) : control.embedIndex++
            }

            if (value === 'right') {
                control.embedIndex === control.listData.length - 1 ? control.embedIndex = 0 : control.embedIndex++
                return control.listData[control.embedIndex]?.embed ? msg.edit({ embeds: [control.listData[control.embedIndex]?.embed] }).catch(() => { }) : control.embedIndex--
            }

            if (value === 'lastEmbed') {
                if (control.embedIndex === control.listData.length) return
                control.embedIndex = control.listData.length - 1
                return control.listData[control.embedIndex]?.embed ? msg.edit({ embeds: [control.listData[control.embedIndex]?.embed] }).catch(() => { }) : control.embedIndex--
            }

            return

        }

        async function deleteReminder(deleteAll = false) {

            let data = control.listData[control.embedIndex],
                reminderId = data?.reminderId,
                listEmbed = data?.embed

            if (!deleteAll && control.deletedReminders.includes(reminderId)) return

            listEmbed.color = client.red
            listEmbed.title += ` | DELETADO`

            deleteAll ? await Database.Reminder.deleteMany({ userId: message.author.id }) : await Database.Reminder.deleteOne({ id: reminderId })

            if (deleteAll) {
                buttons[0].components.splice(1, 1)
                msg.edit({ content: null, embeds: [embed], components: buttons })
                return message.channel.send({
                    embeds: [{ color: client.green, description: `${e.Check} | Todos os **${remindersMember?.length || 0} lembretes** foram deletados.` }]
                })
            }

            control.deletedReminders.push(reminderId)
            msg.edit({ embeds: [listEmbed] }).catch(() => { })
            return message.channel.send(`${e.Check} | ${message.author}, o lembrete \`${reminderId}\` foi deletado com sucesso!`)
        }

    }
}