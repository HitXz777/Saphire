const { e } = require('../../../JSON/emojis.json'),
    moment = require('moment')

module.exports = {
    name: 'aniversario',
    aliases: ['aniversário', 'setniver', 'niver', 'setaniversario'],
    category: 'perfil',
    ClientPermissions: ['ADD_REACTIONS'],
    emoji: '🎉',
    usage: '<niver> <dia> <mes> <ano>',
    description: 'Configure seu aniversário no seu perfil',

    run: async (client, message, args, prefix, MessageEmbed, Database) => {

        if (!args[0]) return message.reply({
            embeds: [
                new MessageEmbed()
                    .setColor('#246FE0')
                    .setTitle('🎉 Data de Aniversário')
                    .setDescription('Defina sua data de aniversário no seu perfil atráves deste comando.')
                    .addField(`${e.On} Ative`, `\`${prefix}setniver 15/03/2007\``)
                    .addField(`${e.Off} Desative`, `\`${prefix}setniver delete\``)
                    .setFooter({ text: 'Siga o formato, ok? Idade limite: 80 Anos' })
            ]
        })

        let user = await Database.User.findOne({ id: message.author.id }, 'Perfil.Aniversario'),
            niver = user?.Perfil?.Aniversario

        if (['off', 'delete', 'del', 'deletar'].includes(args[0]?.toLowerCase())) return DeleteBirthData()

        if (args[2]) return message.reply(`${e.Deny} | Só a data, ok?`)

        if (!args[0].includes('/')) return message.reply(`${e.Deny} | Segue a forma certa, ok? \`15/03/2007\` - DD/MM/AAAA`)

        let check = args[0].split('/')

        if (!check[0] || !check[1] || !check[2] || !check[0].length > 2 || !check[1].length > 2 || !check[2].length > 4)
            return message.reply(`${e.Deny} | Segue a forma certa, ok? \`15/03/2007\` - DD/MM/AAAA`)

        const data = moment(args[0], "DDMMYYYY"),
            formatedData = data.locale('BR').format('L')

        if (!data.isValid())
            return message.reply(`${e.Deny} | A sua data de aniversário está errada. Você certinho e tenta de novo, ok?`)

        if (data.isBefore(eightyYears()) || data.isAfter(Now()))
            return message.reply(`${e.Deny} | As datas disponíveis estão entre: \`${Now(true)}\` & \`${eightyYears(true)}\``)

        return niver === formatedData ? message.reply(`${e.Info} | Esta já é sua data de aniversário atual.`) : SetNewData(formatedData)

        async function SetNewData(data) {

            const msg = await message.reply(`${e.QuestionMark} | Você confirma alterar sua data de aniversário para: \`${data}\`?`)

            msg.react('✅').catch(() => { }) // Check
            msg.react('❌').catch(() => { }) // X

            return msg.awaitReactions({
                filter: (reaction, user) => ['✅', '❌'].includes(reaction.emoji.name) && user.id === message.author.id,
                max: 1,
                time: 15000,
                errors: ['time']
            }).then(collected => {
                const reaction = collected.first()

                if (reaction.emoji.name === '✅') {
                    Database.updateUserData(message.author.id, 'Perfil.Aniversario', data)
                    return msg.edit(`${e.Check} | Data de aniversário atualizada com sucesso!`)
                } else { return msg.edit(`${e.Deny} | Comando cancelado.`) }
            }).catch(() => msg.edit(`${e.Deny} | Comando cancelado por tempo expirado.`))


        }

        function DeleteBirthData() {

            if (niver) {
                Database.delete(message.author.id, 'Perfil.Aniversario')
                return message.channel.send(`${e.Check} | ${message.author} deletou sua data de aniversário.`)
            }

            return message.reply(`${e.Info} | O sua data de aniversário já está resetada.`)
        }

    }
}

function Now(formatBr = false) {

    const date = new Date(Date.now() - 410248800000)
    date.setHours(date.getHours() - 3)

    let Dia = FormatNumber(date.getDate()),
        Ano = date.getFullYear()

    if (formatBr)
        return `${Dia}/${FormatNumber(date.getMonth() + 1)}/${Ano}`

    return `${Ano}-${FormatNumber(date.getMonth() + 1)}-${Dia}`
}

function eightyYears(formatBr = false) {

    const date = new Date(Date.now() - 3155760000000)
    date.setHours(date.getHours() - 3)

    let Dia = FormatNumber(date.getDate()),
        Ano = date.getFullYear()

    if (formatBr)
        return `${Dia}/${FormatNumber(date.getMonth() + 1)}/${Ano}`

    return `${Ano}-${FormatNumber(date.getMonth() + 1)}-${Dia}`
}

function FormatNumber(data) {
    return data < 10 ? `0${data}` : data
}