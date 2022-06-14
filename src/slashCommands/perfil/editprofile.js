module.exports = {
    name: 'editprofile',
    description: '[perfil] Edite as informações do seu perfil',
    dm_permission: false,
    type: 1,
    options: [
        {
            name: 'job',
            description: 'Difina o trabalho do seu perfil',
            type: 3
        },
        {
            name: 'status',
            description: 'Status do seu perfil',
            type: 3
        },
        {
            name: 'birth',
            description: 'Sua databa de aniversário',
            type: 3
        },
        {
            name: 'title',
            description: 'Seu título',
            type: 3
        },
    ],
    async execute({ interaction: interaction, database: Database, emojis: e }) {

        const { options, user } = interaction
        const { eightyYears, Now } = require('../../events/plugins/eventPlugins')

        let data = await Database.User.findOne({ id: user.id }, 'Perfil'),
            moment = require('moment'), title = undefined,
            job = options.getString('job'),
            status = options.getString('status'),
            birth = options.getString('birth'),
            msg = `${e.info} | Validação concluída. Resultado:`

        if (job && job?.length < 5 || job?.length > 30)
            return await interaction.reply({
                content: `${e.Deny} | O **Trabalho** deve estar entre 5 e 30 caracteres`,
                ephemeral: true
            })

        if (status && status?.length < 5 || status?.length > 100)
            return await interaction.reply({
                content: `${e.Deny} | O **Status** deve estar entre 5 e 100 caracteres`,
                ephemeral: true
            })

        if (birth && birth?.length !== 10)
            return await interaction.reply({
                content: `${e.Deny} | O **Aniversário** deve conter 10 caracteres \`24/03/2000\``,
                ephemeral: true
            })

        if (data?.Perfil?.TitlePerm)
            title = options.getString('title')

        if (title && title !== data?.Perfil?.Titulo) {
            msg += `\n${e.Check} | Título`
           Database.updateUserData(user.id, 'Perfil.Titulo', title)
        } else msg += `\n${e.Deny} | Título`

        if (job && job !== data?.Perfil?.Trabalho) {
            msg += `\n${e.Check} | Trabalho`
            Database.updateUserData(user.id, 'Perfil.Trabalho', job)
        } else msg += `\n${e.Deny} | Trabalho`

        if (birth && birth !== data?.Profile?.Aniversario) {

            const date = moment(birth, "DDMMYYYY"),
                formatedData = date.locale('BR').format('L')

            if (!date.isValid() || date.isBefore(eightyYears()) || date.isAfter(Now())) {
                msg += `\n${e.Deny} | Aniversário`
            } else {
                msg += `\n${e.Check} | Aniversário`
               Database.updateUserData(user.id, 'Perfil.Aniversario', formatedData)
            }

        } else msg += `\n${e.Deny} | Aniversário`

        if (status && status !== data?.Perfil?.Status) {
            msg += `\n${e.Check} | Status`
            Database.updateUserData(user.id, 'Perfil.Status', status)
        } else msg += `\n${e.Deny} | Status`

        return await interaction.reply({
            content: msg,
            ephemeral: true
        })
    }
}