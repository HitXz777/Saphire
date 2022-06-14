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
                            name: 'administrator',
                            value: 'adm'
                        },
                        {
                            name: 'moderator',
                            value: 'mod'
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
                            name: 'administrator',
                            value: 'admRemove'
                        },
                        {
                            name: 'moderator',
                            value: 'modRemove'
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

        switch (func) {
            case 'money': AddMoney(); break;
            case 'bonus': AddBonus(); break;
            case 'xp': AddXp(); break;
            case 'level': AddLevel(); break;
            case 'subtract_money': subtract_Money(); break;
            case 'subtract_xp': subtract_Xp(); break;
            case 'subtract_level': subtract_Level(); break;
            case 'adm': setNewAdministrator(); break;
            case 'admRemove': RemoveAdministrator(); break;
            case 'modRemove': RemoveMod(); break;
            case 'mod': AddMod(); break;

            default: await interaction.reply({
                content: `${e.Deny} | **${args[0]?.toLowerCase()}** | Não é um argumento válido.`,
                ephemeral: true
            }); break;
        }

        async function AddLevel() {
            Database.addItem(user.id, 'Level', amount)
            return await interaction.reply({
                content: `${e.RedStar} | ${amount} níveis foram adicionados a ${user.tag}.`,
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

        async function AddXp() {
            Database.addItem(user.id, 'Xp', amount)
            return await interaction.reply({
                content: `${e.RedStar} | ${amount} experiências foram adicionadas a ${user.tag}.`,
                ephemeral: true
            })
        }

        async function setNewAdministrator() {

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

        async function RemoveAdministrator() {

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

        async function RemoveMod() {

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

        async function AddMod() {

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

        async function subtract_Money() {
            Database.add(user.id, -amount)
            Database.PushTransaction(user.id, `${e.Admin} Remoção de ${amount} Safiras por um Administrador`)
            return await interaction.reply({
                content: `${e.Coin} | ${amount} Safiras foram removidas de ${user.tag}.`,
                ephemeral: true
            })
        }

        async function AddMoney() {
            Database.add(user.id, amount)
            Database.PushTransaction(user.id, `${e.Admin} Recebeu ${amount} Safiras de um Administrador`)
            return await interaction.reply({
                content: `${e.Coin} | ${amount} Safiras foram adicionados a ${user.tag}.`,
                ephemeral: true
            })
        }

        async function AddBonus() {
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