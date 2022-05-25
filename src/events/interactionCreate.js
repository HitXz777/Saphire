const client = require('../../index'),
    Database = require('../../modules/classes/Database'),
    { Emojis: e } = Database

client.on('interactionCreate', async interaction => {

    if (!interaction.isButton()) return

    // interaction.deferUpdate().catch(() => { })
    if (!['newRole', 'delRole'].includes(interaction.customId)) return

    let { customId, channel, user, message } = interaction

    let role = channel.guild.roles.cache.get('914925531529609247'),
        member = channel.guild.members.cache.get(user.id)

    if (!member || !role)
        return await interaction.reply({
            content: '❌ | Não foi possível acionar o cargo.',
            ephemeral: true
        })

    if (customId === 'newRole') return addRole()
    if (customId === 'delRole') return delRole()
    return

    async function addRole() {

        if (member.roles.cache.has('914925531529609247'))
            return await interaction.reply({
                content: '❌ | Você já possui o cargo de notificações.',
                ephemeral: true
            })

        member.roles.add(role).catch(async (err) => {

            return await interaction.reply({
                content: `❌ | Houve um erro ao adicionar o cargo.\n${err}`,
                ephemeral: true
            })

        })

        return await interaction.reply({
            content: '✅ | Cargo **adicionado** com sucesso!',
            ephemeral: true
        })
    }

    async function delRole() {

        if (!member.roles.cache.has('914925531529609247'))
            return await interaction.reply({
                content: '❌ | Você não possui o cargo de notificações.',
                ephemeral: true
            })

        member.roles.remove(role).catch(async (err) => {

            return await interaction.reply({
                content: `❌ | Houve um erro ao remover o cargo.\n${err}`,
                ephemeral: true
            })

        })

        return await interaction.reply({
            content: '✅ | Cargo **removido** com sucesso!',
            ephemeral: true
        })
    }
})