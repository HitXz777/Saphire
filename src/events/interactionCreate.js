const client = require('../../index'),
    SubmitModalInteraction = require('./Modal/SubmitModalInteraction'),
    ButtonInteraction = require('./Button/ButtonInteraction'),
    SelectMenuInteraction = require('./SelectMenu/SelectMenuInteraction')

client.on('interactionCreate', async interaction => {

    if (interaction.isModalSubmit()) return new SubmitModalInteraction(interaction, client).submitModalFunctions()
    if (interaction.isButton()) return new ButtonInteraction(interaction, client).execute()
    if (interaction.isSelectMenu()) return new SelectMenuInteraction(interaction).filterAndChooseFunction()
    return
})