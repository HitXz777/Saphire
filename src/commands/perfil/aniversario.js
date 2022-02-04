const { e } = require('../../../database/emojis.json')
const { f } = require('../../../database/frases.json')

module.exports = {
    name: 'aniversario',
    aliases: ['aniversário', 'setniver', 'niver', 'setaniversario'],
    category: 'perfil',
    ClientPermissions: ['ADD_REACTIONS'],
    emoji: '🎉',
    usage: '<niver> <dia> <mes> <ano>',
    description: 'Configure seu aniversário no seu perfil',

    run: async (client, message, args, prefix, db, MessageEmbed, request, sdb) => {

        if (request) return message.reply(`${e.Deny} | ${f.Request}${sdb.get(`Request.${message.author.id}`)}`)

        const NiverEmbed = new MessageEmbed()
            .setColor('#246FE0')
            .setTitle('🎉 Data de Aniversário')
            .setDescription(`Defina sua data de aniversário no seu perfil atráves deste comando.\n \n${e.SaphireObs} | É obrigatório seguir o formato. Ok?\nCom **espaçamento** e no **formato DD MM AAAA**`)
            .addField(`${e.On} Ative`, `\`${prefix}setniver 15 03 2007\``)
            .addField(`${e.Off} Desative`, `\`${prefix}setniver delete\``)
            .setFooter('Siga o formato, ok?')

        if (!args[0]) return message.reply({ embeds: [NiverEmbed] })

        let niver = sdb.get(`Users.${message.author.id}.Perfil.Aniversario`) || false

        if (['off', 'delete', 'del', 'deletar'].includes(args[0]?.toLowerCase())) return DeleteBirthData()
        let dia = parseInt(args[0])
        let mes = parseInt(args[1])
        let ano = parseInt(args[2])
        if (!dia || !mes || !ano) return message.reply(`${e.Info} | Segue esse formato -> **DD MM AAAA** | **26 06 1999**`)
        if (isNaN(dia) || isNaN(mes) || isNaN(ano)) return message.reply(`${e.Deny} | Datas são **NÚMEROS**, ok?`)
        if (args[0].length !== 2) return message.reply(`${e.Deny} | Dias contém apenas 2 caractes, ele vão de 01 a 31`)
        if (args[1].length !== 2) return message.reply(`${e.Deny} | Meses contém apenas 2 caractes, ele vão de 01 a 12`)
        if (args[2].length !== 4) return message.reply(`${e.Deny} | Os anos válidos estão entre 1910 e 2015`)

        // Dia
        if (dia > 31 || dia < 1) return message.reply(`${e.Deny} | Hey, fala um dia do mês! Eu acho que os meses começa no dia 1 e termina no dia 31`)

        // Mês
        if (mes > 12 || mes < 1) return message.reply(`${e.Deny} | Quantos meses tem seu ano?`)
        if (dia > 28 && mes === 02) return message.reply(`${e.Deny} | Fevereiro não tem mais de 28 dias`)
        if ((dia >= 31) && ['02', '04', '06', '09', '10', '11'].includes(args[1])) return message.reply(`${e.Deny} | Esse mês não tem o dia 31, baka.`)

        // Ano
        if (ano > 2015 || ano < 1910) return message.reply(`${e.Deny} | Os anos válidos estão entre 1910 e 2015`)

        if (args[3]) return message.reply(`${e.Deny} | Só a data, ok?`)

        let NewData = `${dia}/${mes}/${ano}`

        niver === NewData ? message.reply(`${e.Info} | Esta já é sua data de aniversário atual.`) : SetNewData(NewData)

        function SetNewData(data) {

            return message.reply(`${e.QuestionMark} | Você confirma a sua data de aniversário? \`${data}\``).then(msg => {
                sdb.set(`Request.${message.author.id}`, `${msg.url}`)
                msg.react('✅').catch(() => { }) // Check
                msg.react('❌').catch(() => { }) // X

                const filter = (reaction, user) => { return ['✅', '❌'].includes(reaction.emoji.name) && user.id === message.author.id }

                msg.awaitReactions({ filter, max: 1, time: 15000, errors: ['time'] }).then(collected => {
                    const reaction = collected.first()

                    if (reaction.emoji.name === '✅') {
                        sdb.delete(`Request.${message.author.id}`)
                        sdb.set(`Users.${message.author.id}.Perfil.Aniversario`, `${data}`)
                        return msg.edit(`${e.Check} | Data de aniversário atualizada com sucesso!`)
                    } else {
                        sdb.delete(`Request.${message.author.id}`)
                        return msg.edit(`${e.Deny} | Comando cancelado.`)
                    }
                }).catch(() => {
                    sdb.delete(`Request.${message.author.id}`)
                    return msg.edit(`${e.Deny} | Comando cancelado por tempo expirado.`)
                })

            })
        }

        function DeleteBirthData() {
            niver ? Delete() : message.reply(`${e.Info} | O sua data de aniversário já está resetada.`)

            function Delete() {
                sdb.delete(`Users.${message.author.id}.Perfil.Aniversario`)
                message.reply(`${e.Check} | ${message.author} resetou sua data de aniversário.`)
            }
        }


    }
}