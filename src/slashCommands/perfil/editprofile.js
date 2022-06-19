module.exports = {
    name: 'editprofile',
    description: '[perfil] Edite as informações do seu perfil',
    dm_permission: false,
    type: 1,
    options: [
        {
            name: 'trabalho',
            description: 'Difina o trabalho do seu perfil',
            type: 3
        },
        {
            name: 'status',
            description: 'Status do seu perfil',
            type: 3
        },
        {
            name: 'aniversário',
            description: 'Qual é a sua data de aniversário?',
            type: 3
        },
        {
            name: 'cor',
            description: 'Troque a cor das suas mensagens usando #HEX',
            type: 3
        },
        {
            name: 'título',
            description: 'Seu título',
            type: 3
        },
        {
            name: 'signo',
            description: 'Defina seu signo',
            type: 3,
            choices: [
                {
                    name: '♓ Peixes',
                    value: '♓ Peixes'
                },
                {
                    name: '♒ Aquário',
                    value: '♒ Aquário'
                },
                {
                    name: '♑ Capricórnio',
                    value: '♑ Capricórnio'
                },
                {
                    name: '♐ Sagitário',
                    value: '♐ Sagitário'
                },
                {
                    name: '♏ Escorpião',
                    value: '♏ Escorpião'
                },
                {
                    name: '♎ Libra',
                    value: '♎ Libra'
                },
                {
                    name: '♈ Áries',
                    value: '♈ Áries'
                },
                {
                    name: '♉ Touro',
                    value: '♉ Touro'
                },
                {
                    name: '♋ Câncer',
                    value: '♋ Câncer'
                },
                {
                    name: '♊ Gêmeos',
                    value: '♊ Gêmeos'
                },
                {
                    name: '♌ Leão',
                    value: '♌ Leão'
                },
                {
                    name: '♍ Virgem',
                    value: '♍ Virgem'
                }
            ]
        },
        {
            name: 'gênero',
            description: 'Defina seu gênero',
            type: 3,
            choices: [
                {
                    name: 'Homem',
                    value: '♂️ Homem',
                },
                {
                    name: 'Mulher',
                    value: '♀️ Mulher',
                },
                {
                    name: 'LGBTQIA+',
                    value: '🏳️‍🌈 LGBTQIA+',
                },
                {
                    name: 'Indefinido',
                    value: '*️⃣ Indefinido',
                },
                {
                    name: 'Helicóptero de Guerra',
                    value: '🚁 Helicóptero de Guerra',
                },
            ]
        }
    ],
    async execute({ interaction: interaction, database: Database, emojis: e }) {

        const { options, user } = interaction
        const { eightyYears, Now } = require('../../../modules/functions/plugins/eventPlugins')

        let data = await Database.User.findOne({ id: user.id }, 'Perfil Color'),
            moment = require('moment'),
            job = options.getString('trabalho'),
            status = options.getString('status'),
            birth = options.getString('aniversário'),
            signo = options.getString('signo'),
            gender = options.getString('gênero'),
            title = options.getString('título'),
            color = options.getString('cor'),
            msg = '', dataToSave = {}

        if (title && title !== data?.Perfil?.Titulo) {
            if (!data?.Perfil?.TitlePerm)
                msg += `\n${e.Deny} | Sem permissão para trocar de título. Que tal compra-la na loja?`
            else {
                msg += `\n${e.Check} | Título`
                dataToSave['Perfil.Titulo'] = title
            }
        }

        if (color && color !== data.Color?.Set) {
            if (!data.Color?.Perm) {
                msg += `${e.Deny} | Você precisa da permissão para trocar de cor. Compre na loja, ok?`
            } else {

                let valid = /^#[0-9A-F]{6}$/i.test(color)
                if (!valid) {
                    msg += `${e.Deny} | Código #HEX inválido.`
                } else {
                    dataToSave['Color.Set'] = color
                    msg += `${e.Check} | Color`
                }
            }
        }

        if (job && job !== data?.Perfil?.Trabalho) {
            if (job?.length < 5 || job?.length > 30)
                msg += `${e.Deny} | O **Trabalho** deve estar entre 5 e 30 caracteres`
            else {
                msg += `\n${e.Check} | Trabalho`
                dataToSave['Perfil.Trabalho'] = job
            }
        }

        if (birth && birth !== data?.Profile?.Aniversario) {
            if (birth?.length < 9 || birth?.length >= 11)
                msg += `\n${e.Check} | Data de aniversário inválida.`
            else {
                const date = moment(birth, "DDMMYYYY"),
                    formatedData = date.locale('BR').format('L')

                if (!date.isValid() || date.isBefore(eightyYears()) || date.isAfter(Now())) {
                    msg += `\n${e.Deny} | As datas disponíveis estão entre: \`${Now(true)}\` & \`${eightyYears(true)}\``
                } else {
                    msg += `\n${e.Check} | Aniversário`
                    dataToSave['Perfil.Aniversario'] = formatedData
                }
            }
        }

        if (status && status !== data?.Perfil?.Status) {
            if (status?.length > 100)
                msg += `\n${e.Deny} | O status não pode ser maior que 100 caracteres`
            else {
                msg += `\n${e.Check} | Status`
                dataToSave['Perfil.Status'] = status
            }
        }

        if (signo && signo !== data?.Perfil?.Signo) {
            msg += `\n${e.Check} | Signo`
            dataToSave['Perfil.Signo'] = signo
            Database.updateUserData(user.id, 'Perfil.Signo', signo)
        }

        if (gender && gender !== data?.Perfil?.Sexo) {
            msg += `\n${e.Check} | Gênero`
            dataToSave['Perfil.Sexo'] = gender
            Database.updateUserData(user.id, 'Perfil.Sexo', gender)
        }

        let valores = Object.keys(dataToSave)
        if (valores.length > 0)
            await Database.User.updateOne({ id: user.id }, dataToSave)

        return await interaction.reply({
            content: msg || `${e.Deny} | Nada foi definido`,
            ephemeral: true
        })
    }
}