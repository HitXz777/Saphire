const client = require('../../index'),
    Database = require('../../modules/classes/Database')

client.on('messageReactionAdd', async (reaction, user) => {

    if (reaction.message.partial) await reaction.message.fetch()
    if (reaction.partial) await reaction.fetch()
    if (user.bot) return
    if (!reaction.message.guild) return

    const message = reaction.message
    if (reaction.emoji.name !== '🎉') return

    const Sorteio = await Database.Giveaway.findOne({ MessageID: message.id })

    if (Sorteio?.Actived) {
        await Database.Giveaway.updateOne(
            { MessageID: message.id },
            { $push: { Participants: user.id } }
        )
    }

    return

})