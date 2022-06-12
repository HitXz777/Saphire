const client = require('../../index'),
    ModalInteraction = require('./Modal/ModalInteraction'),
    ButtonInteraction = require('./Button/ButtonInteraction'),
    SelectMenuInteraction = require('./SelectMenu/SelectMenuInteraction'),
    SlashCommand = require('../../modules/classes/SlashCommand.js')

client.on('interactionCreate', async interaction => {

    if (interaction.isModalSubmit()) return new ModalInteraction(interaction, client).submitModalFunctions()
    if (interaction.isButton()) return new ButtonInteraction(interaction, client).execute()
    if (interaction.isSelectMenu()) return new SelectMenuInteraction(interaction).filterAndChooseFunction()
    if (interaction.isCommand()) return new SlashCommand(interaction, client).CheckBeforeExecute()
    return
})