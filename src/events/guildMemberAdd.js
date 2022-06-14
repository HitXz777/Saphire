const { DatabaseObj: { e, config } } = require('../../modules/functions/plugins/database'),
    { Permissions } = require('discord.js'),
    client = require('../../index'),
    Notify = require('../../modules/functions/plugins/notify'),
    Database = require('../../modules/classes/Database')

client.on('guildMemberAdd', async (member) => {

    if (!member.guild.available) return

    const guild = await Database.Guild.findOne({ id: member.guild.id }, 'Prefix Autorole WelcomeChannel Antifake LogChannel'),
        clientData = await Database.Client.findOne({ id: client.user.id }, 'PremiumServers')

    if (!guild) return Database.registerServer(member.guild, client)

    if (guild.Antifake && !clientData?.PremiumServers?.includes(member.guild.id)) {

        await Database.Guild.updateOne(
            { id: member.guild.id },
            { $unset: { Antifake: 1 } }
        )
        return Notify(member.guild.id, 'ANTIFAKE PREMIUM SYSTEM - DESATIVADO', 'Este servidor não faz mais parte da lista de Servidores Premium.')

    }

    if (guild.Antifake && clientData?.PremiumServers?.includes(member.guild.id)) {

        if (!member.guild.me.permissions.toArray().includes('KICK_MEMBERS')) {

            await Database.Guild.updateOne(
                { id: member.guild.id },
                { $unset: { Antifake: 1 } }
            )
            return Notify(member.guild.id, 'ANTIFAKE PREMIUM SYSTEM - DESATIVADO', `Eu não tenho a permissão **Expulsar Membros** ativada. Ative a permissão e reative o sistema usando \`${guild.Prefix || '-'}antifake on\``)

        }

        let timeCreate = member.user.createdAt.getTime()
        if ((Date.now() - timeCreate) < 604800000) return kick()

        function kick() {
            member.kick(['ANTIFAKE SYSTEM']).then(() => {
                Notify(member.guild.id, 'ANTIFAKE SYSTEM', `Entrada impedida do usuário **${member.user.tag}** *\`${member.id}\`* por ter a conta criada a menos de 7 dias.\n📅 **${client.formatTimestamp(timeCreate)}**`)
                return
            }).catch(async (err) => {
                await Database.Guild.updateOne(
                    { id: member.guild.id },
                    { $unset: { Antifake: 1 } }
                )
                return Notify(member.guild.id, 'ANTIFAKE SYSTEM - DESATIVADO', `Houve um erro na expulsão de um usuário fake.\n\`${err}\``)
            })
        }
    }

    const
        prefix = guild.Prefix || config.prefix,
        RolesId = guild?.Autorole || [],
        CanalDB = guild?.WelcomeChannel?.Canal,
        Mensagem = guild?.WelcomeChannel?.Mensagem || `$member entrou no servidor.`,
        Canal = member?.guild.channels.cache.get(guild?.WelcomeChannel?.Canal)

    Welcome()
    return AutoroleSystem()

    function AutoroleSystem() {

        if (!member.guild.me.permissions.has(Permissions.FLAGS.MANAGE_ROLES) && RolesId.length > 0) {

            DeleteAutorole()
            return Notify(member.guild.id, 'Autorole System', 'Eu não tenho a permissão **GERENCIAR CARGOS**. Todos os cargos configurados foram removidos do banco de dados e o sistema Autorole foi desativado.')
        }

        if (RolesId.length < 1) return

        for (const roleId of RolesId) {

            let role = member.guild.roles.cache.get(`${roleId}`),
                validate = true

            if (!role) {
                RemoveRole(roleId)
                validate = false
            }

            const RolePermissions = role?.permissions.toArray() || [],
                BlockPermissionsArray = ['KICK_MEMBERS', 'BAN_MEMBERS', 'MANAGE_GUILD', 'MANAGE_MESSAGES', 'MUTE_MEMBERS', 'DEAFEN_MEMBERS', 'MOVE_MEMBERS', 'MANAGE_NICKNAMES', 'MANAGE_ROLES', 'ADMINISTRATOR', 'MODERATE_MEMBERS']

            for (const perm of RolePermissions) {
                if (BlockPermissionsArray.includes(perm)) {
                    RemoveRole(role.id)
                    validate = false
                    Notify(member.guild.id, 'Autorole System', `O cargo **${role}** possui a permissão **${config.Perms[perm]}** ativada.\nVisando a segurança e o bem-estar do servidor, o **Autorole** deste cargo foi desabilitado.`);
                }
            }

            if (validate) addRole(role)
            continue
        }

        return

    }

    function addRole(role) {

        return member.roles.add(role).catch(err => {

            if (err.code === 10011 || err.code === 50028) {
                RemoveRole(role.id)
                return Notify(member.guild.id, 'Autorole System', 'Um dos cargos configurado como **Autorole** é desconhecido. As configurações deste cargo foram deletadas do meu banco de dados.')
            }

            return Notify(member.guild.id, 'Autorole System', `Houve um erro na adição de cargo referente ao **Autorole**. Caso não saiba resolver o problema, utilize o comando \`${prefix}bug\` e relate o probrema.\n\`${err}\``)
        })
    }

    async function Welcome() {

        if (!Canal && CanalDB) return DelWelcomeSystem()

        if (!Canal) return

        if (!Canal?.permissionsFor(member.guild.me).has(Permissions.FLAGS.SEND_MESSAGES)) {
            DelWelcomeSystem()
            return Notify(member.guild.id, 'Sem permissão', `Eu não tenho permissão para enviar mensagens de boas-vindas no canal ${Canal}. Eu desativei este sistema até que corrijam este problema.`)
        }

        let newMessage = Mensagem.replace('$member', member).replace('$servername', member.guild.name)

        return Canal.send(`${newMessage}`).catch(async err => {
            DelWelcomeSystem()
            return client.users.cache.get(config.ownerId).send(`${e.Warn} | Erro no evento "guildMemberAdd"\n\`${err}\``)
        })
    }

    async function DelWelcomeSystem() {

        await Database.Guild.updateOne(
            { id: member.guild.id },
            { $unset: { WelcomeChannel: 1 } }
        )

        Notify(member.guild.id, 'Recurso desabilitado - Boas-Vindas', `O canal presente no meu banco de dados é compátivel com nenhum dos canais deste servidor. Reconfigure utilizando o comando \`${prefix}welcomechannel\``)
        return
    }

    async function DeleteAutorole() {

        return await Database.Guild.updateOne(
            { id: member.guild.id },
            { $unset: { Autorole: 1 } }
        )

    }

    async function RemoveRole(roleId) {
        return await Database.Guild.updateOne(
            { id: member.guild.id },
            { $pull: { Autorole: roleId } }
        )
    }
})