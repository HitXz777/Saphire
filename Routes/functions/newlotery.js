const { sdb, db, lotery, DatabaseObj } = require('./database')
const { Message, MessageEmbed } = require('discord.js')
const { e, config, Loteria } = DatabaseObj
const client = require('../../index')
const Moeda = require('./moeda')
const { PushTransaction } = require('./transctionspush')

/**
 * @param { Message } message 
 */

async function NewLoteryGiveaway(LoteriaUsers, message) {

    if (lotery.get('Loteria.Started'))
        return

    lotery.set('Loteria.Started', true)
    lotery.set('Loteria.Close', true)

    let TicketsCompradosAoTodo = LoteriaUsers.length || 0,
        TicketPremiado = LoteriaUsers[Math.floor(Math.random() * LoteriaUsers.length)],
        TicketsComprados = 0,
        Prize = lotery.get('Loteria.Prize')?.toFixed(0) || 0

    if (LoteriaUsers.length <= 0)
        return message.channel.send(`${e.Deny} | Sorteio da loteria cancelado por falta de participantes.`).then(() => { NewLotery() }).catch(err => { Error(message, err) })

    let tag = await client.users.cache.get(TicketPremiado)

    const msg = await message.channel.send(`${e.Loading} | Iniciando um novo sorteio da loteria...`)

    if (!tag) {

        setTimeout(() => {
            return msg.edit(`${e.Loading} | O usuário prêmiado não está em nenhum servidor junto comigo. Deletando usuário do meu banco de dados...`).then(msg => {
                setTimeout(() => {
                    sdb.delete(`Users.${TicketPremiado}`); db.delete(`${TicketPremiado}`); db.delete(`Bitcoin_${TicketPremiado}`);
                    msg.edit(`${e.Check} | Usuário deletado com sucesso!\n${e.Loading} | Removendo todos os tickets do usuário para realizar um novo sorteio...`).then(() => {
                        setTimeout(() => {
                            msg.edit(`${e.Check} | Tickets removidos com sucesso!`).catch(() => { })
                            lotery.pull(`Loteria.Users`, TicketPremiado)
                            NewLoteryGiveaway(lotery.get('Loteria.Users'), message)
                        }, 3500)
                    })
                }, 3000)
            }).catch(() => { })
        }, 4500)

    } else {

        for (const TicketUser of LoteriaUsers)
            if (TicketUser === TicketPremiado)
                TicketsComprados++

        const WinEmbed = new MessageEmbed()
            .setColor('GREEN')
            .setTitle(`💸 | Loteria ${client.user.username}`)
            .setDescription(`🎉 Vencedor*(a)*: ${tag.tag}\n:id: *\`${TicketPremiado}\`*\n💸 Prêmio: ${Prize} ${Moeda(message)}\n${tag.username} comprou 🎫 ${TicketsComprados} Tickets e tinha ${parseInt(((TicketsComprados / LoteriaUsers?.length) * 100) || 0).toFixed(2)}% de chance de ganhar`)
            .setFooter(`${TicketsCompradosAoTodo} Tickets foram comprados nesta loteria.`)

        setTimeout(() => { NewTicketAwarded(msg, tag, WinEmbed) }, 4500)
    }


    async function NewTicketAwarded(msg, winner, WinEmbed) {

        msg.edit({ content: `${e.Check} | Sorteio finalizado com sucesso!`, embeds: [WinEmbed] }).catch(() => { })
        let LoteriaChannel = await client.channels.cache.get(config.LoteriaChannel)
        LoteriaChannel?.send({ embeds: [WinEmbed] })
        sdb.add(`Users.${winner.id}.Cache.Resgate`, Loteria.Prize || 0)

        PushTransaction(
            winner.id,
            `💰 Recebeu ${Loteria.Prize || 0} Moedas na loteria`
        )

        winner.send(`${e.PandaProfit} | Oi oi, estou passando aqui para te falar que você foi o ganhador*(a)* da Loteria.\n${e.MoneyWings} | Você ganhou o prêmio de ${Prize} ${e.Coin} Moedas.\n${e.SaphireObs} | Você pode resgata-lo a qualquer momento usando \`-resgate\``).catch(() => { })

        message.channel.send(`${e.Loading} | Alocando prêmio ao vencedor*(a)* e deletando todos os dados da Loteria...`).then(msg => {
            setTimeout(() => {
                msg.edit(`${e.Check} | Prêmio entregue com sucesso ao cache do vencedor*(a)* e todos os dados da Loteria foram apagados!`).catch(() => { })
                NewLotery(`${winner.tag} *\`${winner.id}\`* | ${parseInt(Loteria.Prize)?.toFixed(0) || 'Buguinho de Valores'}`)
            }, 3500)
        })
    }

    async function NewLotery(LastWinner) {
        const msg = await message.channel.send(`${e.Loading} | Iniciando uma nova loteria...`)

        setTimeout(() => {
            lotery.set('Loteria', { Close: false, Prize: 0, Users: [], LastWinner: LastWinner })
            return msg.edit(`${e.Check} | Uma nova loteria foi iniciada com sucesso!`).catch(() => { })
        }, 4000)
    }
}

module.exports = NewLoteryGiveaway