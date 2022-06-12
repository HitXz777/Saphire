module.exports = {
    name: "say",
    type: 1,
    description: "Fale algo atráves de mim",
    options: [
        {
            name: 'mensagem',
            description: 'Qual a mensagem que você quer enviar?',
            type: 3,
            required: true
        }
    ],
    async execute({ interaction: interaction, client: client, database: Database, data: data }) {

        let content = interaction.options.getString('mensagem')

        if (content.length > 1500)
            return await interaction.reply({
                content: '❌ | O limite de caracteres é de 1500 caracteres'
            })

        return await interaction.reply({ content: content })
    }
}