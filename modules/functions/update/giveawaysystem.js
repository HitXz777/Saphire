const client = require('../../../index'),
    { DatabaseObj: { e } } = require('../plugins/database'),
    { MessageEmbed } = require('discord.js'),
    data = require('../plugins/data'),
    Database = require('../../classes/Database')

async function GiveawaySystem() {

    let GiveawaysAllData = await Database.Giveaway.find({}, 'MessageID GuildId') || []

    if (!GiveawaysAllData || GiveawaysAllData.length === 0) return

    for (const gwData of GiveawaysAllData) {

        let Guild = client.guilds.cache.get(gwData?.GuildId)

        if (!Guild) {
            Database.deleteGiveaway(gwData?.GuildId, true)
            await Database.Guild.deleteOne({ id: gwData?.GuildId })
            continue
        }

        start(gwData.MessageID, Guild)
        continue

    }

    return
}

async function start(MessageId, Guild) {

    let sorteio = await Database.Giveaway.findOne({ MessageID: MessageId })

    if (!sorteio) {
        Database.deleteGiveaway(MessageId)
        return
    }

    let DateNow = sorteio?.DateNow || null,
        Data = DateNow !== null && sorteio?.TimeMs - (Date.now() - DateNow) > 0,
        WinnersAmount = sorteio?.Winners,
        Participantes = sorteio?.Participants || 0,
        Channel = Guild?.channels.cache.get(sorteio?.ChannelId),
        Sponsor = sorteio?.Sponsor,
        Prize = sorteio?.Prize,
        MessageLink = sorteio?.MessageLink,
        Actived = sorteio?.Actived,
        timeoutToDelete = sorteio?.TimeToDelete

    if (CheckAndDeleteGiveaway(timeoutToDelete, MessageId))
        return

    if (!Data && Actived) {

        if (!Channel) {
            Database.deleteGiveaway(Guild.id, true)
            return
        }

        if (Participantes.length === 0) {
            Channel.send(`${e.Deny} | Sorteio cancelado por falta de participantes.\n🔗 | Sorteio link: ${sorteio?.MessageLink}`)

            Database.deleteGiveaway(MessageId)
            return
        }

        let vencedores = await GetWinners(Participantes, WinnersAmount, MessageId)

        if (!vencedores || vencedores.length === 0) {
            Channel.send(`${e.Deny} | Sorteio cancelado por falta de participantes.\n🔗 | Giveaway Reference: ${MessageLink || 'Link indisponível'}`)
            Database.deleteGiveaway(MessageId)
            return
        }

        let vencedoresMapped = vencedores.map(memberId => `${GetMember(Guild, memberId, MessageId)}`).join('\n')

        Channel.send({
            embeds: [
                new MessageEmbed()
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
                            name: `${e.Reference} Giveaway Reference`,
                            value: `🔗 [Link do Sorteio](${MessageLink}) | 🆔 *\`${MessageId}\`*`
                        }
                    )
                    .setFooter({ text: 'Este sorteio será deletado em 24 horas' })
            ]

        }).catch(() => Database.deleteGiveaway(MessageId))

        if (sorteio) {

            await Database.Giveaway.updateOne(
                { MessageID: MessageId },
                {
                    Actived: false,
                    TimeToDelete: Date.now(),
                    TimeEnding: data(sorteio?.TimeMs)
                }
            )

        }
    }

    return
}

async function GetWinners(WinnersArray, Amount = 0, MessageId) {

    if (!WinnersArray || Amount === 0 || WinnersArray.length === 0) return []

    let Winners = []

    WinnersArray.length > Amount
        ? (() => {

            for (let i = 0; i < Amount; i++) {
                let memberId = GetUserWinner()
                Winners.push(memberId)
            }

        })()
        : Winners.push(...WinnersArray)

    await Database.Giveaway.updateOne(
        { MessageID: MessageId },
        { WinnersGiveaway: [...Winners] }
    )

    function GetUserWinner() {
        const Winner = WinnersArray[Math.floor(Math.random() * WinnersArray.length)]
        return Winners.includes(Winner) ? GetUserWinner() : Winner
    }

    return Winners
}

function GetMember(guild, memberId, MessageId) {
    const member = guild.members.cache.get(memberId)

    return member?.user?.tag
        ? `${member} *\`${member?.id || '0'}\`*`
        : (async () => {

            await Database.Giveaway.updateOne(
                { MessageID: MessageId },
                { $pull: { Participants: memberId } }
            )

            return `${e.Deny} Usuário não encontrado.`
        })()
}

function CheckAndDeleteGiveaway(TimeToDelete = 0, MessageId = '') {

    const Data = TimeToDelete !== null && 86400000 - (Date.now() - TimeToDelete) > 0

    if (TimeToDelete === 0 || Data) return false

    Database.deleteGiveaway(MessageId)
    return true
}

module.exports = GiveawaySystem