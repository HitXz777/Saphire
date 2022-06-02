const client = require('../../index'),
    submitModals = require('./Modal/submitModalFunctions'),
    buttonsFunctions = require('./Buttons/buttonsFunctions'),
    selectMenuFunctions = require('./SelectMenus/selectMenuFunctions')

client.on('interactionCreate', async interaction => {

    if (interaction.isModalSubmit()) return new submitModals(interaction, client).submitModalFunctions()
    if (interaction.isButton()) return buttonsFunctions(interaction, client)
    if (interaction.isSelectMenu()) return selectMenuFunctions(interaction, client)
    return
})