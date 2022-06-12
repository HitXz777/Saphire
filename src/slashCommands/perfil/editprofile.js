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
    async execute({ interaction: interaction, database: Database }) {

        const { options, user } = interaction
        const { eightyYears } = require('../../events/plugins/eventPlugins')

        let data = await Database.User.findOne({ id: user.id }, 'Perfil'),
            moment = require('moment'), title = undefined,
            job = options.getString('job'),
            status = options.getString('status'),
            birth = options.getString('birth'),
            msg = 'ℹ | Validação concluída. Resultado:'

        if (data?.Perfil?.TitlePerm)
            title = options.getString('title')

        if (title && title !== data?.Perfil?.Titulo) {
            msg += '\n✅ | Título'
            Database.updateUserData(user.id, 'Perfil.Titulo', title)
        } else msg += '\n❌ | Título'

        if (job && job !== data?.Perfil?.Trabalho) {
            msg += '\n✅ | Trabalho'
            Database.updateUserData(user.id, 'Perfil.Trabalho', job)
        } else msg += '\n❌ | Trabalho'

        if (birth && birth !== data?.Profile?.Aniversario) {

            const date = moment(birth, "DDMMYYYY"),
                formatedData = date.locale('BR').format('L')

            if (!date.isValid() || date.isBefore(eightyYears()) || date.isAfter(Now())) {
                msg += '\n❌ | Aniversário'
            } else {
                msg += '\n✅ | Aniversário'
                Database.updateUserData(user.id, 'Perfil.Aniversario', formatedData)
            }

        } else msg += '\n❌ | Aniversário'

        if (status && status !== data?.Perfil?.Status) {
            msg += '\n✅ | Status'
            Database.updateUserData(user.id, 'Perfil.Status', status)
        } else msg += '\n❌ | Status'


        return await interaction.reply({
            content: msg,
            ephemeral: true
        })
    }
}