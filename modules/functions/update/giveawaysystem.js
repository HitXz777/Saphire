const client = require('../../../index'),
    { MessageEmbed } = require('discord.js'),
    data = require('../plugins/data'),
    Database = require('../../classes/Database'),
    { Emojis: e } = Database

async function GiveawaySystem() {

    let GiveawaysAllData = await Database.Giveaway.find({}, 'MessageID GuildId ChannelId Actived TimeToDelete') || []

    if (!GiveawaysAllData || GiveawaysAllData.length === 0) return

    for (const gwData of GiveawaysAllData) {

        if (!gwData?.GuildId)
            return await Database.Giveaway.deleteOne({ _id: gwData._id })

        let Guild = client.guilds.cache.get(gwData?.GuildId)

        if (!Guild) {
            Database.deleteGiveaway(gwData?.GuildId, true)
            await Database.Guild.deleteOne({ id: gwData?.GuildId })
            continue
        }

        if (gwData.Actived)
            start(gwData.MessageID, Guild, gwData.ChannelId)
        else continue

        if (CheckAndDeleteGiveaway(gwData?.TimeToDelete, gwData.MessageID))
            return
    }

    return
}

async function start(MessageId, Guild, ChannelId) {

    let sorteio = await Database.Giveaway.findOne({ MessageID: MessageId })


    if (!sorteio) {
        Database.deleteGiveaway(MessageId)
        return
    }

    let emoji = sorteio.Emoji || '🎉',
        channel = await Guild.channels.cache.get(ChannelId),
        message = await channel?.messages.fetch(MessageId),
        reaction = message?.reactions.cache.get(emoji)

    if (!reaction || !message) {
        Database.deleteGiveaway(MessageId)
        return
    }

    let reactionUsers = await reaction?.users.fetch()

    let DateNow = sorteio?.DateNow || null,
        Data = DateNow !== null && sorteio?.TimeMs - (Date.now() - DateNow) > 0,
        WinnersAmount = sorteio?.Winners,
        Participantes = reactionUsers.filter(u => !u.bot).map(u => u.id) || [],
        Channel = Guild?.channels.cache.get(sorteio?.ChannelId),
        Sponsor = sorteio?.Sponsor,
        Prize = sorteio?.Prize,
        MessageLink = sorteio?.MessageLink,
        Actived = sorteio?.Actived

    if (!Data && Actived) {

        if (!Channel) {
            Database.deleteGiveaway(Guild.id, true)
            return
        }

        let embedToEdit = message.embeds[0]

        embedToEdit.color = client.red
        embedToEdit.description = null
        embedToEdit.title += ' | Sorteio encerrado'
        embedToEdit.timestamp = new Date(),
            embedToEdit.footer.text = `Giveaway ID: ${MessageId} | ${Participantes.length} Participantes | Terminou`
        message.edit({ embeds: [embedToEdit], components: [] }).catch(() => { })

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

        let vencedoresMapped = vencedores.map(memberId => `${GetMember(Guild, memberId)}`)

        Channel.send({
            content: `${e.Notification} | ${[Sponsor, ...vencedores].map(id => Channel.guild.members.cache.get(id)).join(', ').slice(0, 4000)}`,
            embeds: [
                new MessageEmbed()
                    .setColor('GREEN')
                    .setTitle(`${e.Tada} Sorteio Finalizado`)
                    .setURL(`${MessageLink}`)
                    .addFields(
                        {
                            name: `${e.CoroaDourada} Vencedores`,
                            value: `${vencedoresMapped.join('\n') || 'Ninguém'}`,
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

        if (sorteio)
            await Database.Giveaway.updateOne(
                { MessageID: MessageId },
                {
                    Actived: false,
                    TimeToDelete: Date.now(),
                    Participants: Participantes,
                    TimeEnding: data(sorteio?.TimeMs)
                }
            )
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
        const Winner = WinnersArray.random()
        return Winners.includes(Winner) ? GetUserWinner() : Winner
    }

    return Winners
}

function GetMember(guild, memberId) {
    const member = guild.members.cache.get(memberId)

    return member
        ? `${member} *\`${member?.id || '0'}\`*`
        : `${e.Deny} Usuário não encontrado.`
}

function CheckAndDeleteGiveaway(TimeToDelete = 0, MessageId = '') {

    const Data = TimeToDelete !== null && 86400000 - (Date.now() - TimeToDelete) > 0

    if (TimeToDelete === 0 || Data) return false

    Database.deleteGiveaway(MessageId)
    return true
}

module.exports = GiveawaySystem