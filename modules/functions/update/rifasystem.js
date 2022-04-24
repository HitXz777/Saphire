const Database = require('../../classes/Database'),
    e = Database.Emojis,
    client = require('../../../index'),
    { config } = require('../../../JSON/config.json'),
    { MessageEmbed } = require('discord.js')

async function RaffleSystem() {

    const rifas = await Database.Raffle.find({}) || [],
        data = rifas.find(d => d.ClientId === client.user.id)

    if (!data || !rifas || rifas.length === 0) return

    const date = new Date()
    date.setHours(date.getHours() - 3)

    const saturday = date.getDay() === 6,
        validateRaffles = rifas.filter(data => data.id)

    if (validateRaffles.length < 20) return

    if (validateRaffles.length >= 90 || saturday)
        return RaffleValidate(validateRaffles, saturday, data)

    if (data.AlreadyRaffle && !saturday) return disableRaffleBlock()

    return
}

async function RaffleValidate(raffles = [], saturday, data) {

    if (!data || data.AlreadyRaffle && saturday) return

    if (raffles.length < 20) return

    const ticketWin = getTicketWinner(),
        channel = client.channels.cache.get(config.rifaChannel),
        ticketNumber = ticketWin.id,
        memberId = ticketWin.MemberId,
        member = client.users.cache.get(memberId)?.tag

    if (!member) return deleteUserAndTicketsUser(memberId)
    else {
        Database.add(memberId, data.Prize)
        Database.PushTransaction(memberId, `${e.gain} Ganhou ${data.Prize} Safiras na rifa.`)
    }

    await Database.Raffle.deleteMany({})

    new Database.Raffle(
        {
            ClientId: client.user.id,
            AlreadyRaffle: true,
            LastWinner: memberId,
            LastPrize: data.Prize
        }
    ).save()

    return channel?.send({
        embeds: [
            new MessageEmbed()
                .setColor(client.blue)
                .setTitle(`${e.ticketRifa} Resultado da Rifa`)
                .addFields(
                    {
                        name: `${e.CoroaDourada} Vencedor*(a)*`,
                        value: `> Rifa: \`${ticketNumber}\`\n> ${member || 'Membro não encontrado'} - *\`${memberId || 'Id Desconhecido'}\`*`
                    },
                    {
                        name: `${e.MoneyWings} Prêmio`,
                        value: `> ${data.Prize || 'Valor desconhecido'} ${e.Coin} Safiras`
                    },
                    {
                        name: `${e.Info} Rifas compradas`,
                        value: `> \`${raffles.length || 'Valor desconhecido'}\` rifas foram compradas nesta rodada.`
                    }
                )
                .setTimestamp()

        ]
    }).catch(err => {
        const owner = client.users.cache.get(config.ownerId)
        return owner.send(`${e.Deny} | Erro ao enviar o resultado da rifa no canal *\`(${config.rifaChannel})\`*\n\`${err}\``).catch(() => { })
    })

    function getTicketWinner() {
        let ticket = raffles[Math.floor(Math.random() * raffles.length)]

        if (!ticket.id || !ticket.MemberId) getTicketWinner()
        return ticket
    }

}

async function deleteUserAndTicketsUser(userId) {
    await Database.Raffle.deleteMany({ MemberId: userId })
    return
}

async function disableRaffleBlock() {
    await Database.Raffle.updateOne(
        { ClientId: client.user.id },
        { $unset: { AlreadyRaffle: 1 } }
    )
    return
}

module.exports = RaffleSystem