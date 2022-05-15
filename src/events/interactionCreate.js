const client = require('../../index'),
    Database = require('../../modules/classes/Database')

client.on('interactionCreate', async interaction => {
    interaction.deferUpdate().catch(() => { })

    if (!['joinGiveaway', 'leaveGiveaway'].includes(interaction.customId)) return

    const Sorteio = await Database.Giveaway.findOne({ MessageID: interaction.message.id })

    if (!Sorteio) return
    let participants = Sorteio.Participants || []

    if (interaction.customId === 'joinGiveaway' && Sorteio?.Actived) return addParticipant()
    if (interaction.customId === 'leaveGiveaway' && Sorteio?.Actived) return removeParticipant()

    async function addParticipant() {

        if (participants.includes(interaction.user.id)) return

        return await Database.Giveaway.updateOne(
            { MessageID: interaction.message.id },
            { $push: { Participants: interaction.user.id } }
        )
    }

    async function removeParticipant() {

        if (!participants.includes(interaction.user.id)) return

        return await Database.Giveaway.updateOne(
            { MessageID: interaction.message.id },
            { $pull: { Participants: interaction.user.id } }
        )
    }

    return

})