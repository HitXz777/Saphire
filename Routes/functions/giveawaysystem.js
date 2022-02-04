const client = require('../../index'),
    { Giveaway, DatabaseObj: { e } } = require('./database'),
    { MessageEmbed } = require('discord.js'),
    CheckAndDeleteGiveaway = require('./CheckAndDeleteGiveaway'),
    data = require('./data')

function GiveawaySystem() {

    let GuildsId = Object.keys(Giveaway.get('Giveaways') || {}),
        embed = new MessageEmbed()

    for (const guild of GuildsId) {

        let Guild = client.guilds.cache.get(guild)

        if (!Guild) {
            Giveaway.delete(`Giveaways.${guild}`)
            continue
        }

        let MessagesId = Object.keys(Giveaway.get(`Giveaways.${guild}`))

        for (const MessageId of MessagesId) {

            let sorteio = Giveaway.get(`Giveaways.${guild}.${MessageId}`),
                DateNow = sorteio?.DateNow || null,
                Data = DateNow !== null && sorteio?.TimeMs - (Date.now() - DateNow) > 0,
                WinnersAmount = sorteio?.Winners,
                Participantes = sorteio?.Participants,
                Channel = Guild?.channels.cache.get(sorteio?.ChannelId),
                Sponsor = sorteio?.Sponsor,
                Prize = sorteio?.Prize,
                MessageLink = sorteio?.MessageLink,
                Actived = sorteio?.Actived

            if (CheckAndDeleteGiveaway(guild, MessageId))
                continue

            if (!sorteio) {
                Giveaway.delete(`Giveaways.${guild}.${MessageId}`)
                continue
            }

            if (!Data && Actived) {

                if (!Channel) {
                    Giveaway.delete(`Giveaways.${guild}`)
                    continue
                }

                if (Participantes.length === 0) {
                    Channel.send(`${e.Deny} | Sorteio cancelado por falta de participantes.\n🔗 | Sorteio link: ${sorteio?.MessageLink}`)

                    Giveaway.delete(`Giveaways.${guild}.${MessageId}`)
                    continue
                }

                let vencedores = GetWinners(Participantes, WinnersAmount, guild, MessageId)

                if (vencedores.length === 0) {
                    Channel.send(`${e.Deny} | Sorteio cancelado por falta de participantes.\n🔗 | Giveaway Reference: ${MessageLink || 'Link indisponível'}`)
                    Giveaway.delete(`Giveaways.${guild}.${MessageId}`)
                    continue
                }

                let vencedoresMapped = vencedores.map(memberId => `${GetMember(Guild, memberId, guild, MessageId)}`).join('\n')

                Channel.send({
                    embeds: [
                        embed
                            .setColor('GREEN')
                            .setTitle(`${e.Tada} Sorteio Finalizado`)
                            .setURL(`${MessageLink}`)
                            .addFields(
                                {
                                    name: `${e.CoroaDourada} Vencedores`,
                                    value: `${vencedoresMapped || 'Ninguém'}`,
                                    inline: true
                                },
                                {
                                    name: `${e.ModShield} Patrocinador`,
                                    value: `${Guild.members.cache.get(Sponsor) || `${e.Deny} Patrocinador não encontrado`}`,
                                    inline: true
                                },
                                {
                                    name: `${e.Star} Prêmio`,
                                    value: `${Prize}`,
                                    inline: true
                                },
                                {
                                    name: `🔗 Giveaway Reference`,
                                    value: `[Link do Sorteio](${MessageLink})`
                                }
                            )
                            .setFooter('Este sorteio será deletado em 24 horas')
                    ]

                }).catch(() => Giveaway.delete(`Giveaways.${guild}.${MessageId}`))

                if (Giveaway.get(`Giveaways.${guild}.${MessageId}`)) {

                    Giveaway.set(`Giveaways.${guild}.${MessageId}.Actived`, false)
                    Giveaway.set(`Giveaways.${guild}.${MessageId}.TimeToDelete`, Date.now())
                    Giveaway.set(`Giveaways.${guild}.${MessageId}.TimeEnding`, data(sorteio?.TimeMs))

                }
            }

            continue

        }

    }
}

function GetWinners(WinnersArray, Amount, guildId, MessageId) {

    let Winners = []

    if (WinnersArray.length === 0)
        return []

    WinnersArray.length > Amount
        ? (() => {

            for (let i = 0; i < Amount; i++) {

                let memberId = GetUserWinner()

                Winners.push(memberId)
                Giveaway.push(`Giveaways.${guildId}.${MessageId}.WinnersGiveaway`, memberId)
            }

        })()
        : (() => {

            Winners.push(...WinnersArray)
            Giveaway.set(`Giveaways.${guildId}.${MessageId}.WinnersGiveaway`, [...Winners])

        })()

    function GetUserWinner() {

        const Winner = WinnersArray[Math.floor(Math.random() * WinnersArray.length)]
        return Winners.includes(Winner) ? GetUserWinner() : Winner

    }

    return Winners
}

function GetMember(guild, memberId, guildId, MessageId) {
    const member = guild.members.cache.get(memberId)

    return member?.user?.tag
        ? `${member} *\`${member?.id || 'Id desconhecido'}\`*`
        : (() => {
            Giveaway.pull(`Giveaways.${guildId}.${MessageId}.Participants`, memberId)
            return `${e.Deny} Usuário não encontrado.`
        })()
}

module.exports = GiveawaySystem
