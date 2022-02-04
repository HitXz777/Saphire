const client = require('../../index'),
    { Giveaway } = require('../../Routes/functions/database')

client.on('messageReactionRemove', async (reaction, user) => {

    if (reaction.message.partial) await reaction.message.fetch()
    if (reaction.partial) await reaction.fetch()
    if (user.bot) return
    if (!reaction.message.guild) return

    if (reaction.emoji.name !== '🎉') return

    const message = reaction.message,
        Sorteio = Giveaway.get(`Giveaways.${message.guild.id}.${message.id}`)

    if (Sorteio?.Actived)
        return Giveaway.pull(`Giveaways.${message.guild.id}.${message.id}.Participants`, user.id)

    return

})