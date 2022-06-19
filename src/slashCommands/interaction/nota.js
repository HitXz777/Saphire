module.exports = {
    name: 'nota',
    description: '[interaction] De uma nota para alguém',
    dm_permission: false,
    type: 1,
    options: [
        {
            name: 'user',
            description: 'Escolha um usuário',
            type: 6
        }
    ],
    async execute({ interaction: interaction, client: client, database: Database, emojis: e }) {

        const { options } = interaction,
            user = options.getUser('user') || interaction.user,
            { Config } = Database

        if (user.id === Config.ownerId)
            return await interaction.reply({
                content: `${e.SaphireObs} | Huum... Minha nota para ${user} é 1000. Ele é liiiiiiindo, perfeeeeito!!!`
            })

        if (user.id === client.user.id)
            return await interaction.reply({
                content: 'Uma nota pra mim? Que tal infinito?'
            })

        let nota = Math.floor(Math.random() * 14),
            objNotes = {
                0: `🤔 Huum... Minha nota para ${user} é 0. Até me faltou palavras.`,
                1: `🤔 Huum... Minha nota para ${user} é 1. Sabe? Nem sei o que pensar...`,
                2: `🤔 Huum... Minha nota para ${user} é 2. Mas 2 não é 0, ok?`,
                3: `🤔 Huum... Minha nota para ${user} é 3. Mas calma, não desista.`,
                4: `🤔 Huum... Minha nota para ${user} é 4. Acho que sei alguém que pegava.`,
                5: `🤔 Huum... Minha nota para ${user} é 5. Na escola pública passa em...`,
                6: `🤔 Huum... Minha nota para ${user} é 6. Não é Itachi mais me deixou em um genjutsu.`,
                7: `🤔 Huum... Minha nota para ${user} é 7. Não é Neji mas atingiu meu ponto fraco.`,
                8: `🤔 Huum... Minha nota para ${user} é 8. Se fosse um avião, me levava as alturas.`,
                9: `🤔 Huum... Minha nota para ${user} é 9. Tô fugindo de problemas mas se o problema for ${user}, eu vou até buscar.`,
                10: `🤔 Huum... Minha nota para ${user} é 10. Vou juntar as esferas do dragão e pedir você.`
            }[nota]

        return await interaction.reply({
            content: objNotes || `Viiish, uma nota pra ${user}? Nem tenho nota pra essa maravilha.`
        })

    }
}