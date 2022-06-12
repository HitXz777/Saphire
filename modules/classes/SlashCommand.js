class SlashCommand {
    constructor(interaction, client) {
        this.interaction = interaction
        this.client = client
        this.error = require('../functions/config/errors')
        this.Database = require('./Database')
    }

    async execute() {

        const command = this.client.slashCommands.get(this.interaction.commandName);
        if (!command) return;

        return await command.execute({ interaction: this.interaction, emojis: this.Database.Emojis, database: this.Database, client: this.client, data: this }).catch(async () => {
            return await this.interaction.reply({
                content: "❌ | Ocorreu um erro ao executar este comando.",
                ephemeral: true,
            })
        })

    }
}

module.exports = SlashCommand