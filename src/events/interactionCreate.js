const client = require('../../index'),
    submitModalFunctions = require('./Modal/submitModalFunctions'),
    buttonsFunctions = require('./Buttons/buttonsFunctions')

client.on('interactionCreate', async interaction => {

    if (interaction.isModalSubmit()) return submitModalFunctions(interaction, client)
    if (interaction.isButton()) return buttonsFunctions(interaction, client)
    return
})