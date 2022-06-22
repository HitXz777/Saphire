const Database = require('./Database'),
    { Config: config, Emojis: e } = Database,
    { getEmoji } = require('../functions/plugins/eventPlugins'),
    client = require('../../index'),
    Modals = require('./Modals')

class SelectMenuInteraction extends Modals {
    constructor(interaction) {
        super()
        this.interaction = interaction
        this.customId = interaction.customId
        this.values = interaction.values
        this.message = interaction.message
        this.user = interaction.user
        this.guild = interaction.guild
        this.channel = interaction.channel
        this.value = this.values[0]
    }

    filterAndChooseFunction() {

        if (this.customId === 'reactionRole') return this.reactionRole()
        if (this.customId === 'toEdit') return this.toEditReactionRole()

        switch (this.value) {
            case 'newGiveaway': this.newGiveaway(); break;
            case 'newReminder': this.newReminder(this.interaction); break;
            case 'report': this.letterReport(); break;
            case 'reportTransactions': this.reportTransactions(); break;
            default: this.checkEditReactionRole(); break;
        }

        return
    }

    async refreshReactionRole(val) {

        const { interaction, guild, user, message, value } = this

        await interaction.update({})

        let member = guild.members.cache.get(user.id)
        if (!member) return

        let perms = member.permissions.toArray() || []

        if (!perms.includes('MANAGE_ROLES') && !perms.includes('ADMINISTRATOR'))
            return await interaction.followUp({
                content: '❌ | Você não tem permissão para mexer no sistema de reaction roles.',
                ephemeral: true
            })

        let collectionID = val.replace(/refreshReactionRole /g, ''),
            placeholder = interaction.message?.components[0]?.components[0]?.placeholder?.replace(/Escolher cargos da coleção /g, '') || ''

        let data = await Database.Guild.findOne({ id: guild.id }, 'ReactionRole'),
            ReactionRoleData = data?.ReactionRole || [],
            collection = ReactionRoleData?.find(coll =>
                coll.collectionID === collectionID
                || [value, placeholder].includes(coll.name)
            )

        if (!ReactionRoleData || ReactionRoleData.length === 0)
            return await interaction.followUp({
                content: '❌ | Este servidor não possui nenhuma coleção de reaction role. Delete esta mensagem ou reconfigure tudo novamente.',
                ephemeral: true
            })

        if (!collection)
            return await interaction.followUp({ content: '❌ | Coleção não encontrada', ephemeral: true })

        let selectMenuObject = {
            type: 1,
            components: [{
                type: 3,
                custom_id: 'reactionRole',
                placeholder: `Escolher cargos da coleção ${collection.name}`,
                options: []
            }]
        }

        if (!collection.uniqueSelection)
            selectMenuObject.components[0].minValues = 1

        for (let data of collection.rolesData) {

            let objData = { label: data.title, value: data.roleId }

            if (data.emoji)
                objData.emoji = data.emoji

            if (data.description)
                objData.description = data.description

            selectMenuObject.components[0].options.push(objData)
        }

        let newID = collection.collectionID || await this.registerCollectionID(Database, collection, guild)

        selectMenuObject.components[0].options.push({
            label: 'Refresh',
            emoji: '🔄',
            description: 'Atualize o reaction role',
            value: `refreshReactionRole ${newID}`
        })

        let embed = { color: client.blue, title: collection.embedTitle || `Cargos da Coleção ${collection.name}` }

        let mapResult = collection.rolesData.map(data => `${getEmoji(data.emoji, guild)}${guild.roles.cache.get(data.roleId) || 'Not Found'}` || '\`Cargo não encontrado\`').join('\n')

        embed.description = mapResult || '> *Esta coleção não possui nenhum cargo*'

        return message.edit({ components: [selectMenuObject], embeds: [embed] })
            .then(async () => {
                return await interaction.followUp({
                    content: '✅ | Refresh realizado com sucesso!',
                    embeds: [],
                    components: [],
                    ephemeral: true
                }).catch(() => { })
            })
            .catch(async err => {
                return await interaction.followUp({
                    content: `❌ | O lançamento falhou.\n> \`${err}\``,
                    embeds: [],
                    components: [],
                    ephemeral: true
                }).catch(() => { })
            })
    }

    async checkEditReactionRole() {

        let guildData = await Database.Guild.findOne({ id: this.guild.id }, 'ReactionRole'),
            collections = guildData?.ReactionRole || [],
            collection = collections?.find(d => d.collectionID === this.value)

        if (collection)
            return this.collectionEdit(collection)
        else return

    }

    async reactionRole() {

        let { value, values, guild, interaction, user } = this

        if (value.includes('refreshReactionRole') || value.length === 5) return this.refreshReactionRole(value)

        for (let val of values)
            if (val.includes('refreshReactionRole')) return this.refreshReactionRole(val)

        await interaction.update({}) // By: 793343792048635924 & 196679829800747017
        let permsArray = guild.me.permissions.toArray() || []

        if (!permsArray.includes('MANAGE_ROLES') && !permsArray.includes('ADMINISTRATOR'))
            return await interaction.followUp({
                content: '❌ | Eu não tenho a permissão **Gerenciar Cargos** ativada. A adição de cargo está suspensa.',
                ephemeral: true
            })

        let msgConfirmation = 'ℹ | Feedback'

        let data = await Database.Guild.findOne({ id: guild.id }, 'ReactionRole')
        let ReactionRole = data?.ReactionRole || [],
            collection = ReactionRole.find(d => d.rolesData?.find(x => x.roleId === value))

        if (!collection || !collection?.collectionID)
            return await interaction.followUp({
                content: '⚠ | Esta coleção necessita ser atualizada. Peça para um Administrador clicar em "Refresh".',
                ephemeral: true
            })

        if (collection?.uniqueSelection) {

            let rolesId = []
            collection.rolesData.map(d => rolesId.push(d.roleId))
            rolesId = rolesId.filter(id => id !== value)

            await addRole(value, rolesId)
        }
        else
            for (let roleId of values)
                await addRole(roleId)

        async function addRole(roleId, toRemoveRolesId = []) {

            let role = guild.roles.cache.get(roleId),
                member = guild.members.cache.get(user.id)

            for (let id of toRemoveRolesId)
                if (member.roles.cache.has(id))
                    await member.roles.remove(id)
                        .then(() => msgConfirmation += `\n⚠️ | ${guild.roles.cache.get(id)} - **REMOVIDO**`)
                        .catch(() => msgConfirmation += `\n❌ | ${guild.roles.cache.get(id) || 'Not Found'} - **Erro ao remover o cargo**`)

            if (!role)
                return msgConfirmation += `\n⚠️ | ${role?.name || 'NOT FOUND'} - **ERRO**`

            if (!role.editable) {
                return msgConfirmation += `\n⚠️ | ${role?.name || 'NOT FOUND'} - **Não posso manusear este cargo.**`
            }

            const RolePermissions = role?.permissions.toArray() || [],
                BlockPermissionsArray = ['KICK_MEMBERS', 'BAN_MEMBERS', 'MANAGE_GUILD', 'MANAGE_MESSAGES', 'MUTE_MEMBERS', 'DEAFEN_MEMBERS', 'MOVE_MEMBERS', 'MANAGE_NICKNAMES', 'MANAGE_ROLES', 'ADMINISTRATOR', 'MODERATE_MEMBERS']

            if (member.roles.cache.has(roleId)) {
                member.roles.remove(roleId)
                    .catch(() => msgConfirmation += `\n⚠️ | ${role || 'NOT FOUND'} - **ERRO**`)

                return msgConfirmation += `\n❌ | ${role || 'NOT FOUND'} - **REMOVIDO**`

            } else {

                for (const perm of RolePermissions)
                    if (BlockPermissionsArray.includes(perm)) {
                        this.deleteReaction(roleId, collection?.name)
                        return msgConfirmation += `\n❌ | ${role || 'NOT FOUND'} - Este cargo possui a permissão **${config.Perms[perm]}** ativada. Adição ignorada.`
                    }

                await member.roles.add(roleId)
                    .catch(() => msgConfirmation += `\n⚠️ | ${role || 'NOT FOUND'} - **ERRO**`)

                return msgConfirmation += `\n✅ | ${role || 'NOT FOUND'} - **ADICIONADO**`
            }

        }

        return await interaction.followUp({
            content: msgConfirmation,
            ephemeral: true
        })

    }

    async deleteReaction(roleId, collectionName) {
        if (!collectionName || !roleId) return

        return await Database.Guild.updateOne(
            { id: this.guild.id, ['ReactionRole.name']: collectionName },
            { $pull: { [`ReactionRole.$.rolesData`]: { roleId: roleId } } }
        )
    }

    async collectionEdit(collection) {

        if (!collection)
            return await this.interaction.reply({
                content: '❌ | Coleção não detectada.',
                ephemeral: true
            })

        return await this.interaction.showModal(this.editCollection(collection))
            .catch(err => {
                if (err.code === 40060) return
            })
    }

    reportTransactions = async () => await this.interaction.showModal(this.transactionsReport)

    async toEditReactionRole() {

        let guildData = await Database.Guild.findOne({ id: this.guild.id }, 'ReactionRole'),
            collections = guildData?.ReactionRole || [],
            collection = collections.find(coll => coll.rolesData.find(role => role.roleId === this.value)),
            roleData = collection?.rolesData.find(role => role.roleId === this.value)

        if (!roleData) return

        return await this.interaction.showModal(this.editReactionRole(roleData))
    }

}

module.exports = SelectMenuInteraction
