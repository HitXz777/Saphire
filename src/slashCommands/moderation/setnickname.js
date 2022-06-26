const util = require('../../structures/util')

module.exports = {
    name: 'setnickname',
    description: '[moderation] Troque o seu nome ou de outras pessoas',
    dm_permission: false,
    default_member_permissions: util.slashCommandsPermissions.CHANGE_NICKNAME,
    type: 1,
    options: [
        {
            name: 'new_name',
            description: 'Novo nome',
            type: 3
        },
        {
            name: 'member',
            description: 'Membro a ter o nome editado',
            type: 6
        }
    ],
    async execute({ interaction: interaction, client: client, emojis: e }) {

        const { options, guild, user: author } = interaction

        if (!guild.clientPermissions('MANAGE_NICKNAMES'))
            return await interaction.reply({
                content: `${e.Info} | Eu preciso da permissão **\`GERENCIAR APELIDOS\`** para seguir com este comando.`
            })

        let newName = options.getString('new_name') || null
        let user = options.getUser('member')
        let authorAsMember = guild.members.cache.get(author.id)
        let member = guild.members.cache.get(user?.id)

        if (user) {

            if (!authorAsMember.memberPermissions('MANAGE_NICKNAMES'))
                return await interaction.reply({
                    content: `${e.Deny} | Permissão Necessária: Gerenciar Nicknames (Nomes/Apelidos)`,
                    ephemeral: true
                })


            if (author.id !== guild.ownerId && member.permissions.toArray()?.includes('ADMINISTRATOR'))
                return await interaction.reply({
                    content: `${e.Deny} | Pelo decreto internacional das nações desunidas. Eu, ${client.user.username}, não posso mudar nicknames de administradores.`
                })


            if (user.id === guild.ownerId)
                return await interaction.reply({
                    content: `${e.Deny} | Opa, não posso alterar o nick do grande ser e honrado/a dono/a do servidor.`,
                    ephemeral: true
                })

            if (newName?.length > 32)
                return await interaction.reply({
                    content: `${e.Deny} | O nome não pode ultrapassar **32 caracteres**`,
                    ephemeral: true
                })

            return member.setNickname(newName, `Nickname alterado por: ${author.tag}`)
                .then(async m => {
                    return await interaction.reply({
                        content: `${e.Check} | O nome de ${member} foi alterado com sucesso para: ${m.displayName}.`
                    })
                })
                .catch(async err => {
                    return await interaction.reply({
                        content: `${e.Deny} | Eu não posso mudar o nome deste ser poderoso. ||*(Zoeira, só deu algum erro bobo)*||\n\`${err}\``
                    })
                })
        }

        if (newName?.length > 32)
            return await interaction.reply({
                content: `${e.Deny} | O nome não pode ultrapassar **32 caracteres**`,
                ephemeral: true
            })

        if (authorAsMember.id === guild.ownerId)
            return await interaction.reply({
                content: `${e.Deny} | Opa, não posso alterar o nick do grande ser e honrado/a dono/a do servidor.`,
                ephemeral: true
            })

        if (!authorAsMember.manageable)
            return await interaction.reply({
                content: `${e.Deny} | Foi maaal, mas não consigo editar o nickname dessa pessoa ☹`
            })

        if (authorAsMember.displayName === newName)
            return await interaction.reply({
                content: `${e.Deny} | Este já é o seu nome atual.`,
                ephemeral: true
            })

        return authorAsMember.setNickname(newName, `Nickname alterado por: ${author.tag}`)
            .then(async m => {
                return await interaction.reply({
                    content: `${e.Check} | O seu nome foi alterado com sucesso para: ${m.displayName}.`
                })
            }).catch(async err => {
                if (err.code === 10009)
                    return await interaction.reply({
                        content: `${e.Deny} | Eu não tenho permissão suficiente, poxa! Pode ativar a permissão \`GERENCIAR APELIDOS\` não? É rapidinho ${e.SaphireCry}`
                    })

                if (err.code === 50013)
                    return await interaction.reply({
                        content: `${e.SaphireCry} | Eu não tenho poder suficiente... Poxa...`
                    })

                return await interaction.reply({
                    content: `${e.Deny} | Vish, algo deu errado aqui...\n\`${err}\``
                })
            })

    }
}