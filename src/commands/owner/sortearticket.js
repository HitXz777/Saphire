const { e } = require('../../../database/emojis.json')
const { lotery } = require('../../../Routes/functions/database')
const Moeda = require('../../../Routes/functions/moeda')

module.exports = {
    name: 'sortearticket',
    category: 'owner',
    ClientPermissions: ['EMBED_LINKS'],
    emoji: '🎫',
    usage: '<sortearticket>',
    description: 'Sorteia o prêmio da loteria',

    run: async (client, message, args, prefix, db, MessageEmbed, request, sdb) => {

        let Tickets = lotery.get('Loteria.Users') || []
        if (!Tickets) return message.reply(`${e.Deny} | Não há ninguém participando da loteria.`)

        let TicketsCompradosAoTodo = Tickets.length || false
        if (!TicketsCompradosAoTodo) return message.reply(`${e.Deny} Nenhum ticket foi comprado.`)

        let TicketPremiado = Tickets[Math.floor(Math.random() * Tickets.length)]

        let i = 0
        for (const ts of Tickets) {
            if (ts === TicketPremiado)
                i++
        }

        let TicketsComprados = i || 0
        let Prize = lotery.get('Loteria.Prize') || 0
        let tag = await client.users.cache.get(TicketPremiado)

        const WinEmbed = new MessageEmbed()
            .setColor('GREEN')
            .setTitle(`💸 | Loteria ${client.user.username}`)
            .setDescription(`🎉 Vencedor*(a)*: ${tag.tag}\n:id: *${TicketPremiado}*\n💸 Prêmio: ${Prize} ${Moeda(message)}\n<@${TicketPremiado}> comprou 🎫 ${TicketsComprados} Tickets`)
            .setFooter(`${TicketsCompradosAoTodo} Tickets foram comprados nesta loteria.`)

        NewSorteio()

        function NewSorteio() {
            message.channel.send(`${e.Loading} | Iniciando sorteio...`).then(msg => {
                lotery.set('Loteria.Close', true)
                setTimeout(() => { msg.edit(`${e.Check} | Sorteio iniciado!\n${e.Loading} | Contabilizando Tickets...`).catch(() => { }) }, 3000)
                setTimeout(() => { msg.edit(`${e.Check} | Sorteio iniciado!\n${e.Check} | ${TicketsCompradosAoTodo} 🎫 Tickets contabilizados\n${e.Loading} | Sorteando um Ticket...`).catch(() => { }) }, 7000)
                setTimeout(() => { Winner(msg) }, 12000)
            })
        }

        async function Winner(msg) {
            setTimeout(() => { msg.edit(`${e.Check} | Sorteio iniciado!\n${e.Check} | ${TicketsCompradosAoTodo} 🎫 Tickets contabilizados\n${e.Check} | Ticket sorteado!\n${e.Loading} | Autenticando Ticket...`).catch(() => { }) }, 4500)
            let winner = await client.users.cache.get(TicketPremiado)
            if (!winner) {
                return msg.edit(`${e.Check} | Sorteio iniciado!\n
                ${e.Check} | ${TicketsCompradosAoTodo} 🎫 Tickets contabilizados\n
                ${e.Check} | Ticket sorteado!\n
                ${e.Deny} | O ticket prêmiado pertence a um usuário que não está em nenhum servidor em que eu estou.\n
                ${e.Loading} | Deletando todos os dados deste usuário...`).then(msg => {
                    sdb.delete(`Users.${TicketPremiado}`); db.delete(`${TicketPremiado}`); db.delete(`Bitcoin_${TicketPremiado}`);
                    setTimeout(() => {
                        msg.edit(`${e.Check} | Sorteio iniciado!\n
                ${e.Check} | ${TicketsCompradosAoTodo} 🎫 Tickets contabilizados\n
                ${e.Check} | Ticket sorteado!\n
                ${e.Deny} | O ticket prêmiado pertence a um usuário que não está em nenhum servidor em que eu estou.\n
                ${e.Check} | Todos os dados pertencentes a \`${TicketPremiado}\` foram deletados com sucesso!\n
                ${e.Loading} | Iniciando um novo sorteio...`).catch(() => { })
                    }, 4500)
                    setTimeout(() => { NewSorteio() }, 9500)
                })
            } else {
                setTimeout(() => { NewTicketAwarded(msg, winner) }, 4500)
            }
        }

        function NewTicketAwarded(msg, winner) {
            msg.delete().catch(() => { })
            message.channel.send({ embeds: [WinEmbed] })
            sdb.add(`Users.${winner.id}.Cache.Resgate`, (lotery.get('Loteria.Prize') || 0))
            try {
                winner.send(`${e.PandaProfit} | Oi oi, estou passando aqui para te falar que você foi o ganhador*(a)* da Loteria.\n${e.MoneyWings} | Você ganhou o prêmio de ${Prize} ${e.Coin} Moedas.\n${e.SaphireObs} | Você pode resgatar ele a qualquer momento usando \`-resgate\``)
            } catch (err) {
                message.channel.send(`${e.Deny} | Não foi possível contactar o vencedor(a).`)
            }
            message.channel.send(`${e.Loading} | Alocando prêmio ao vencedor*(a)* e deletando todos os dados da Loteria...`).then(msg => {
                setTimeout(() => { msg.edit(`${e.Check} | Prêmio entregue com sucesso ao cache do vencedor*(a)* e todos os dados da Loteria foram apagados!`).catch(() => { }); NewLotery() }, 3500)
            })
        }

        function NewLotery() {
            message.channel.send(`${e.Loading} | Iniciando uma nova loteria...`).then(msg => {
                setTimeout(() => {
                    lotery.set('Loteria.Prize', 0)
                    lotery.set('Loteria.Users', [])
                    for (i = 0; i <= 19; i++) {
                        sdb.set(`Loteria.Users${i + 1}`, [])
                    }
                    lotery.set('Loteria.Close', false)
                    msg.edit(`${e.Check} | Uma nova loteria foi iniciada com sucesso!`)
                }, 4000)
            })
        }

    }
}