const options = []

for (let i = 1; i < 26; i++)
    options.push({ name: `escolha_${i}`, description: `Defina a escolha ${i}`, type: 3 })

module.exports = {
    name: 'choose',
    description: '[random] Deixa que eu escolho pra você',
    dm_permission: false,
    type: 1,
    options,
    async execute({ interaction: interaction, emojis: e }) {

        const { options } = interaction, chooses = []

        for (let i = 1; i < 26; i++) {
            let has = options.getString(`escolha_${i}`)
            if (has) chooses.push(has)
        }

        if (chooses.length < 2)
            return await interaction.reply({
                content: `${e.Deny} | Você deve fornecer ao menos 2 opções de escolhas`,
                ephemeral: true
            })

        let response = chooses.random()
        if (response.length > 2000) response = response.slice(0, 1997) + '...'
        return await interaction.reply({ content: `${e.SaphireQ} | Dentre as ${chooses.length} opções, eu escolho...\n${e.ReminderBook} | ${response}` })
    }
}