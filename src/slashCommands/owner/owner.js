module.exports = {
    name: 'owner',
    description: '[owner] Comandos privados para meu criador',
    dm_permission: false,
    type: 1,
    options: [
        {
            name: 'add',
            description: '[owner] Adicionar valores',
            type: 1,
            options: [
                {
                    name: 'function',
                    description: '[add] Função a ser executada',
                    type: 3,
                    required: true,
                    choices: [
                        {
                            name: 'money',
                            value: 'money'
                        },
                        {
                            name: 'bonus',
                            value: 'bonus'
                        },
                        {
                            name: 'experience',
                            value: 'xp'
                        },
                        {
                            name: 'level',
                            value: 'level'
                        }
                    ]
                },
                {
                    name: 'value',
                    description: '[add] Valor a ser adicionado',
                    type: 4,
                    required: true
                },
                {
                    name: 'mention',
                    description: '[add] By Mention',
                    type: 6,
                },
                {
                    name: 'id',
                    description: '[add] By Id',
                    type: 3,
                }
            ]
        },
        {
            name: 'subtract',
            description: '[owner] Remover valores',
            type: 1,
            options: [
                {
                    name: 'function',
                    description: '[remove] Função a ser executada',
                    type: 3,
                    required: true,
                    choices: [
                        {
                            name: 'money',
                            value: 'subtract_money'
                        },
                        {
                            name: 'experience',
                            value: 'subtract_xp'
                        },
                        {
                            name: 'level',
                            value: 'subtract_level'
                        }
                    ]
                },
                {
                    name: 'value',
                    description: '[remove] Valor a ser removido',
                    type: 4,
                    required: true
                },
                {
                    name: 'mention',
                    description: '[remove] By Mention',
                    type: 6,
                },
                {
                    name: 'id',
                    description: '[remove] By Id',
                    type: 3,
                }
            ]
        },
        {
            name: 'set',
            description: '[owner] Definir valores',
            type: 1,
            options: [
                {
                    name: 'function',
                    description: '[set] Função a ser executada',
                    type: 3,
                    required: true,
                    choices: [
                        {
                            name: 'developer',
                            value: 'developer'
                        },
                        {
                            name: 'administrator',
                            value: 'adm'
                        },
                        {
                            name: 'moderator',
                            value: 'mod'
                        },
                        {
                            name: 'designer',
                            value: 'designer'
                        },
                        {
                            name: 'halloween',
                            value: 'halloween'
                        },
                        {
                            name: 'bughunter',
                            value: 'bughunter'
                        },
                        {
                            name: 'backgroundacess',
                            value: 'bgacess'
                        },
                        {
                            name: 'estrela1',
                            value: 'estrela1'
                        },
                        {
                            name: 'estrela2',
                            value: 'estrela2'
                        },
                        {
                            name: 'estrela3',
                            value: 'estrela3'
                        },
                        {
                            name: 'estrela4',
                            value: 'estrela4'
                        },
                        {
                            name: 'estrela5',
                            value: 'estrela5'
                        },
                        {
                            name: 'estrela6',
                            value: 'estrela6'
                        }
                    ]
                },
                {
                    name: 'mention',
                    description: '[set] By Mention',
                    type: 6,
                },
                {
                    name: 'id',
                    description: '[set] By Id',
                    type: 3,
                }
            ]
        },
        {
            name: 'delete',
            description: '[owner] Deletar valores',
            type: 1,
            options: [
                {
                    name: 'function',
                    description: '[delete] Função a ser executada',
                    type: 3,
                    required: true,
                    choices: [
                        {
                            name: 'developer',
                            value: 'developerRemove'
                        },
                        {
                            name: 'administrator',
                            value: 'admRemove'
                        },
                        {
                            name: 'moderator',
                            value: 'modRemove'
                        },
                        {
                            name: 'designer',
                            value: 'designerRemove'
                        },
                        {
                            name: 'bughunter',
                            value: 'bughunterRemove'
                        },
                        {
                            name: 'halloween',
                            value: 'halloweenRemove'
                        },
                        {
                            name: 'backgroundacess',
                            value: 'bgacessRemove'
                        },
                        {
                            name: 'estrela1',
                            value: 'estrelaDel1'
                        },
                        {
                            name: 'estrela2',
                            value: 'estrelaDel2'
                        },
                        {
                            name: 'estrela3',
                            value: 'estrelaDel3'
                        },
                        {
                            name: 'estrela4',
                            value: 'estrelaDel4'
                        },
                        {
                            name: 'estrela5',
                            value: 'estrelaDel5'
                        },
                        {
                            name: 'estrela6',
                            value: 'estrelaDel6'
                        }
                    ]
                },
                {
                    name: 'mention',
                    description: '[set] By Mention',
                    type: 6,
                },
                {
                    name: 'id',
                    description: '[set] By Id',
                    type: 3,
                }
            ]
        }
    ],
    async execute({ interaction: interaction, client: client, database: Database, emojis: e, clientData: clientData }) {

        const { Config: config } = Database

        if (interaction.user.id !== config.ownerId)
            return await interaction.reply({
                content: `${e.OwnerCrow} | Este é um comando privado para meu desenvolvedor.`,
                ephemeral: true
            })

        let func = interaction.options.getString('function')
        let userMention = interaction.options.getUser('mention')
        let userId = interaction.options.getString('id')
        let user = client.users.cache.get(userId) || userMention
        let amount = interaction.options.getInteger('value')

        if (!user)
            return await interaction.reply({
                content: `${e.Deny} | Nenhum usuário encontrado.`,
                ephemeral: true
            })

        if (func.includes('estrelaDel')) return delete_estrela()
        if (func.includes('estrela')) return set_estrela()

        switch (func) {
            case 'money': add_Money(); break;
            case 'bonus': add_Bonus(); break;
            case 'xp': add_Xp(); break;
            case 'level': add_Level(); break;

            case 'subtract_money': subtract_Money(); break;
            case 'subtract_xp': subtract_Xp(); break;
            case 'subtract_level': subtract_Level(); break;

            case 'adm': set_Administrator(); break;
            case 'mod': set_Moderator(); break;
            case 'halloween': set_Halloween(); break;
            case 'bughunter': set_Bughunter(); break;
            case 'bgacess': set_BgAcess(); break;
            case 'developer': set_Developer(); break;
            case 'designer': set_Designer(); break;

            case 'admRemove': delete_Administrator(); break;
            case 'modRemove': delete_Moderator(); break;
            case 'bughunterRemove': delete_Bughunter(); break;
            case 'bgacessRemove': delete_BgAcess(); break;
            case 'halloweenRemove': delete_Halloween(); break;
            case 'developerRemove': delete_Developer(); break;
            case 'designerRemove': delete_Designer(); break;

            default: await interaction.reply({
                content: `${e.Deny} | **${func}** | Não é um argumento válido.`,
                ephemeral: true
            }); break;
        }

        async function set_estrela() {

            let estrelaData = {}

            switch (func) {
                case 'estrela1': estrelaData = {
                    route: 'Perfil.Estrela.Um',
                    userResponse: '1º Estrela',
                    number: 'Um'
                }; break;
                case 'estrela2': estrelaData = {
                    route: 'Perfil.Estrela.Dois',
                    userResponse: '2º Estrela',
                    number: 'Dois'
                }; break;
                case 'estrela3': estrelaData = {
                    route: 'Perfil.Estrela.Tres',
                    userResponse: '3º Estrela',
                    number: 'Tres'
                }; break;
                case 'estrela4': estrelaData = {
                    route: 'Perfil.Estrela.Quatro',
                    userResponse: '4º Estrela',
                    number: 'Quatro'
                }; break;
                case 'estrela5': estrelaData = {
                    route: 'Perfil.Estrela.Cinco',
                    userResponse: '5º Estrela',
                    number: 'Cinco'
                }; break;
                case 'estrela6': estrelaData = {
                    route: 'Perfil.Estrela.Seis',
                    userResponse: '6º Estrela',
                    number: 'Seis'
                }; break;
            }

            let get = await Database.User.findOne({ id: user.id }, estrelaData.route)

            if (!get) return await interaction.reply({
                content: `${e.Database} | DATABASE | Usuário não encontrado.`,
                ephemeral: true
            })

            let data = get.Perfil?.Estrela[estrelaData.number]

            if (data)
                return await interaction.reply({
                    content: `${e.Info} | ${user.username} já tem a ${estrelaData.userResponse}.`,
                    ephemeral: true
                })

            Database.updateUserData(user.id, estrelaData.route, true)

            return await interaction.reply({
                content: `${e.Check} | ${user.username} agora possui a **${estrelaData.userResponse}**.`,
                ephemeral: true
            })
        }

        async function delete_estrela() {

            let estrelaData = {}

            switch (func) {
                case 'estrelaDel1': estrelaData = {
                    route: 'Perfil.Estrela.Um',
                    userResponse: '1º Estrela',
                    number: 'Um'
                }; break;
                case 'estrelaDel2': estrelaData = {
                    route: 'Perfil.Estrela.Dois',
                    userResponse: '2º Estrela',
                    number: 'Dois'
                }; break;
                case 'estrelaDel3': estrelaData = {
                    route: 'Perfil.Estrela.Tres',
                    userResponse: '3º Estrela',
                    number: 'Tres'
                }; break;
                case 'estrelaDel4': estrelaData = {
                    route: 'Perfil.Estrela.Quatro',
                    userResponse: '4º Estrela',
                    number: 'Quatro'
                }; break;
                case 'estrelaDel5': estrelaData = {
                    route: 'Perfil.Estrela.Cinco',
                    userResponse: '5º Estrela',
                    number: 'Cinco'
                }; break;
                case 'estrelaDel6': estrelaData = {
                    route: 'Perfil.Estrela.Seis',
                    userResponse: '6º Estrela',
                    number: 'Seis'
                }; break;
            }

            let get = await Database.User.findOne({ id: user.id }, estrelaData.route)

            if (!get) return await interaction.reply({
                content: `${e.Database} | DATABASE | Usuário não encontrado.`,
                ephemeral: true
            })

            let data = get.Perfil?.Estrela[estrelaData.number]

            if (!data)
                return await interaction.reply({
                    content: `${e.Info} | ${user.username} não possui a ${estrelaData.userResponse}.`,
                    ephemeral: true
                })

            Database.delete(user.id, estrelaData.route)

            return await interaction.reply({
                content: `${e.Check} | ${user.username} não possui mais a **${estrelaData.userResponse}**.`,
                ephemeral: true
            })
        }

        async function set_Halloween() {

            let data = clientData.Titles?.Halloween || []

            if (data.includes(user.id))
                return await interaction.reply({
                    content: `${e.Info} | ${user.tag} já possui o título **🎃 Halloween 2021**`,
                    ephemeral: true
                })

            await Database.Client.updateOne(
                { id: client.user.id },
                { $push: { 'Titles.Halloween': user.id } }
            )

            return await interaction.reply({
                content: `${e.Check} | ${user.username} agora possui o título **🎃 Halloween 2021**!`,
                ephemeral: true
            })
        }

        async function delete_Halloween() {

            let data = clientData.Titles?.Halloween || []

            if (!data.includes(user.id))
                return await interaction.reply({
                    content: `${e.Info} | ${user.tag} não possui o título **🎃 Halloween 2021**`,
                    ephemeral: true
                })

            await Database.Client.updateOne(
                { id: client.user.id },
                { $pull: { 'Titles.Halloween': user.id } }
            )

            return await interaction.reply({
                content: `${e.Check} | ${user.username} não possui mais o título **🎃 Halloween 2021**!`,
                ephemeral: true
            })
        }

        async function add_Level() {
            Database.addItem(user.id, 'Level', amount)
            return await interaction.reply({
                content: `${e.RedStar} | ${amount} níveis foram adicionados a ${user.tag}.`,
                ephemeral: true
            })
        }

        async function set_Designer() {

            let dataUsers = clientData.Titles?.OfficialDesigner || []

            if (dataUsers.includes(user.id))
                return await interaction.reply({
                    content: `${e.Info} | ${user.username} já é um Designer Official & Emojis Productor.`,
                    ephemeral: true
                })

            await Database.Client.updateOne(
                { id: client.user.id },
                { $push: { 'Titles.OfficialDesigner': user.id } }
            )

            return await interaction.reply({
                content: `${e.Check} | ${user.username} agora é um Designer Official & Emojis Productor`,
                ephemeral: true
            })
        }

        async function delete_Designer() {

            let dataUsers = clientData.Titles?.OfficialDesigner || []

            if (!dataUsers.includes(user.id))
                return await interaction.reply({
                    content: `${e.Info} | ${user.username} não é um Designer Official.`,
                    ephemeral: true
                })

            await Database.Client.updateOne(
                { id: client.user.id },
                { $pull: { 'Titles.OfficialDesigner': user.id } }
            )

            return await interaction.reply({
                content: `${e.Check} | ${user.username} não é mais é um Designer Official & Emojis Productor`,
                ephemeral: true
            })
        }

        async function subtract_Level() {
            Database.addItem(user.id, 'Level', -amount)
            return await interaction.reply({
                content: `${e.RedStar} | ${amount} níveis foram removidos de ${user.tag}.`,
                ephemeral: true
            })
        }

        async function subtract_Xp() {
            Database.addItem(user.id, 'Xp', -amount)
            return await interaction.reply({
                content: `${e.RedStar} | ${amount} experiências foram removidas de ${user.tag}.`,
                ephemeral: true
            })
        }

        async function set_BgAcess() {

            let bgData = clientData.BackgroundAcess || []

            if (bgData.includes(user.id))
                return await interaction.reply({
                    content: `${e.Info} | ${user.username} já possui acesso aos background.`,
                    ephemetral: true
                })

            await Database.Client.updateOne(
                { id: client.user.id },
                { $push: { BackgroundAcess: user.id } }
            )

            return await interaction.reply({
                content: `${e.Check} | ${user.username} Agora possui acesso livre aos backgrounds.`,
                ephemetral: true
            })
        }

        async function delete_BgAcess() {

            let bgData = clientData.BackgroundAcess || []

            if (!bgData.includes(user.id))
                return interaction.reply({
                    content: `${e.Info} | ${user.username} já possui acesso aos background.`,
                    ephemeral: true
                })

            await Database.Client.updateOne(
                { id: client.user.id },
                { $pull: { BackgroundAcess: user.id } }
            )

            return interaction.reply({
                content: `${e.Info} | ${user.username} não possui mais acesso aos background.`,
                ephemeral: true
            })
        }

        async function set_Developer() {

            let dataUsers = clientData.Titles?.Developer || []

            if (dataUsers.includes(user.id))
                return await interaction.reply({
                    content: `${e.Info} | ${user.username} já é um Developer.`,
                    ephemeral: true
                })

            await Database.Client.updateOne(
                { id: client.user.id },
                { $push: { 'Titles.Developer': user.id } }
            )

            return await interaction.reply({
                content: `${e.Check} | ${user.username} agora é um Developer!`,
                ephemeral: true
            })
        }

        async function delete_Developer() {

            let dataUsers = clientData.Titles?.Developer || []

            if (!dataUsers.includes(user.id))
                return await interaction.reply({
                    content: `${e.Info} | ${user.username} não é um Developer.`,
                    ephemeral: true
                })

            await Database.Client.updateOne(
                { id: client.user.id },
                { $pull: { 'Titles.Developer': user.id } }
            )

            return await interaction.reply({
                content: `${e.Check} | ${user.username} não é mais é um Developer.`,
                ephemeral: true
            })
        }

        async function add_Xp() {
            Database.addItem(user.id, 'Xp', amount)
            return await interaction.reply({
                content: `${e.RedStar} | ${amount} experiências foram adicionadas a ${user.tag}.`,
                ephemeral: true
            })
        }

        async function set_Administrator() {

            let adms = clientData?.Administradores || []

            if (adms.includes(user.id))
                return await interaction.reply({
                    content: `${e.Deny} | ${user.tag} já é um administrador.`,
                    ephemeral: true
                })

            await Database.Client.updateOne(
                { id: client.user.id },
                { $push: { Administradores: user.id } },
                { upsert: true }
            )

            user.send(`Parabéns! Você agora é um **${e.Admin} Official Administrator** do meu sistema.`).catch(() => { })
            return await interaction.reply({
                content: `${e.Check} | **${user.username} *\`${user.id}\`*** agora é um ${e.Admin} Administrador*(a)*.`,
                ephemeral: true
            })

        }

        async function delete_Administrator() {

            let adms = clientData?.Administradores || []

            if (!adms.includes(user.id))
                return await interaction.reply({
                    content: `${e.Deny} | ${user.tag} não é um administrador.`,
                    ephemeral: true
                })

            await Database.Client.updateOne(
                { id: client.user.id },
                { $pull: { Administradores: user.id } },
                { upsert: true }
            )

            return await interaction.reply({
                content: `${e.Check} | **${user.username} *\`${user.id}\`*** foi removido do cargo ${e.Admin} Administrador.`,
                ephemeral: true
            })

        }

        async function delete_Moderator() {

            let adms = clientData?.Moderadores || []

            if (!adms.includes(user.id))
                return await interaction.reply({
                    content: `${e.Deny} | ${user.tag} não é um moderador.`,
                    ephemeral: true
                })

            await Database.Client.updateOne(
                { id: client.user.id },
                { $pull: { Moderadores: user.id } },
                { upsert: true }
            )

            return await interaction.reply({
                content: `${e.Check} | **${user.username} *\`${user.id}\`*** foi removido do cargo ${e.Admin} Moderador.`,
                ephemeral: true
            })

        }

        async function set_Moderator() {

            let adms = clientData?.Moderadores || []

            if (adms.includes(user.id))
                return await interaction.reply({
                    content: `${e.Deny} | ${user.tag} já é um moderador.`,
                    ephemeral: true
                })

            await Database.Client.updateOne(
                { id: client.user.id },
                { $push: { Moderadores: user.id } },
                { upsert: true }
            )

            return await interaction.reply({
                content: `${e.Check} | **${user.username} *\`${user.id}\`*** agora é um ${e.Admin} Moderador*(a)*.`,
                ephemeral: true
            })

        }

        async function delete_Bughunter() {

            let dataUsers = clientData.Titles?.BugHunter || []

            if (!dataUsers.includes(user.id))
                return await interaction.reply({
                    content: `${e.Info} | ${user.username} não é um Bug Hunter.`,
                    ephemeral: true
                })

            await Database.Client.updateOne(
                { id: client.user.id },
                { $pull: { 'Titles.BugHunter': user.id } }
            )

            return await interaction.reply({
                content: `${e.Check} | ${user.tag} \`${user.id}\` não é mais é um Bug Hunter.`,
                ephemeral: true
            })
        }
        async function set_Bughunter() {

            let dataUsers = clientData.Titles?.BugHunter || []

            if (dataUsers.includes(user.id))
                return await interaction.reply({
                    content: `${e.Info} | ${user.username} já é um Bug Hunter.`,
                    ephemeral: true
                })

            await Database.Client.updateOne(
                { id: client.user.id },
                { $push: { 'Titles.BugHunter': user.id } }
            )

            return await interaction.reply({
                content: `${e.Check} | ${user.tag} \`${user.id}\` agora é um Bug Hunter.`,
                ephemeral: true
            })
        }

        async function subtract_Money() {
            Database.add(user.id, -amount)
            Database.PushTransaction(user.id, `${e.Admin} Remoção de ${amount} Safiras por um Administrador`)
            return await interaction.reply({
                content: `${e.Coin} | ${amount} Safiras foram removidas de ${user.tag}.`,
                ephemeral: true
            })
        }

        async function add_Money() {
            Database.add(user.id, amount)
            Database.PushTransaction(user.id, `${e.Admin} Recebeu ${amount} Safiras de um Administrador`)
            return await interaction.reply({
                content: `${e.Coin} | ${amount} Safiras foram adicionados a ${user.tag}.`,
                ephemeral: true
            })
        }

        async function add_Bonus() {
            Database.add(user.id, amount)
            user.send(`${e.SaphireFeliz} | Você recebeu um bônus de **${amount} ${moeda}**. Parabéns!`).catch(() => { })
            return await interaction.reply({
                content: `${e.Check} | Bônus de ${amount} ${e.Coin} Safiras foram entregues a ${user.tag}.`,
                ephemeral: true
            })
        }

        return
    }
}