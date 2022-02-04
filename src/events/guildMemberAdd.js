const { DatabaseObj, ServerDb } = require('../../Routes/functions/database') // Database
const { e, config } = DatabaseObj // Emoji Handler e config.json
const { Permissions } = require('discord.js')
const client = require('../../index')
const Notify = require('../../Routes/functions/notify') // Função que manda uma mensagem no canal logs do Servidor
const Super = require('../../Routes/classes/SupremacyClass') // Class do Servidor

// Sempre que um membro entrar em algum servidor, este evento é emitido, porém, o único parametro é o próprio member
client.on('guildMemberAdd', async (member) => {

    if (!member.guild.available) return // Se não tem guild, retorna (Ocorre de vez em quando)

    const Server = new Super.ServerManager(member.guild) // Um new class do servidor

    // Declaração de todas as variáveis (ou quase todas)
    const { prefix, Autorole1, Autorole2, BlockPermissionsArray, Canal, CanalDB, Emoji, Mensagem, Role1, Role2 } = {
        prefix: Server.prefix,
        Autorole1: Server.Autorole.First, // ID do Autorole 1
        Autorole2: Server.Autorole.Second, // ID do Autorole 2
        BlockPermissionsArray: Server.Autorole.BlockPermissionsAutorole, // Permissões bloqueadas pelo autorole
        Canal: await member.guild.channels.cache.get(ServerDb.get(`Servers.${member.guild.id}.WelcomeChannel.Canal`)), // Canal de boas-vindas (Bot manda mensagens de boas-vindas neste canal)
        CanalDB: Server.WelcomeSystem.CanalDB, // ID do Canal de boas-vindas
        Emoji: Server.WelcomeSystem.Emoji, // Emoji da mensagem de boas-vindas
        Mensagem: Server.WelcomeSystem.Mensagem, // Mensagem de boas-vindas
        Role1: await member.guild.roles.cache.get(ServerDb.get(`Servers.${member.guild.id}.Autorole.First`)), // Função que pega o cargo do Autorole 1
        Role2: await member.guild.roles.cache.get(ServerDb.get(`Servers.${member.guild.id}.Autorole.Second`)), // Função que pega o cargo do Autorole 2
    }

    Welcome(); // Bem-vindo
    CheckRoles() // Check das roles para ver se está tudo certo

    async function CheckRoles() {

        // Se tiver algum cargo no autorole e o bot não tiver permissão, ele deleta as autoroles configuradas da database e notifica no canal Logs
        if ((Role1 || Role2) && !member.guild.me.permissions.has(Permissions.FLAGS.MANAGE_ROLES)) {
            Server.Delete.Autorole()
            return Notify(member.guild.id, 'Autorole System', 'Eu não tenho a permissão **GERENCIAR CARGOS**. Por favor, ative-a e configure novamente o autorole.')
        }

        // Se tiver o ID do cargo Autorole na database e não haver o cargo no servidor, deleta o ID da database
        if (Autorole1 && !Role1) Server.Delete.AutoroleFirst()
        if (Autorole2 && !Role2) Server.Delete.AutoroleSecond()

        // Se tem a autorole, ativa a função que adiciona o cargo
        if (Role1) AutoroleSystem(Autorole1)
        if (Role2) AutoroleSystem(Autorole2)

        return
    }

    function AutoroleSystem(RoleDB) {

        const role = member.guild.roles.cache.get(RoleDB)
        if (!role?.id) return DisableAutorole(RoleDB)

        // Aqui pegamos todas as permissões do cargo
        const RolePermissions = role?.permissions.toArray() || []
        // Verificamos em um loop se o cargo do autorole não possui nenhuma permissão que possa prejudicar o servidor
        for (const perm of RolePermissions) {
            if (BlockPermissionsArray.includes(perm)) {
                DisableAutorole(role.id) // Se tem, deletamos o id do cargo na database, desativamos o autorole e notificamos no canal log
                return Notify(member.guild.id, 'Autorole System', `O cargo **${role}** possui a permissão **${perm}** ativada.\nVisando a segurança e o bem-estar do servidor, o **Autorole** deste cargo foi desabilitado.`);
            }
        }

        // Retormos a adição do canal no membro
        return member.roles.add(role).catch(err => {

            // Se por algum motivo o cargo for desconhecido ou o cargo for deletado antes da adição, deletamos o cargo da database e notificação o canal log
            if (err.code === 10011 || err.code === 50028) {
                if (Autorole1 === role.id)
                    Server.Autorole1Delete()

                if (Autorole2 === role.id)
                    Server.Autorole2Delete()

                return Notify(member.guild.id, 'Autorole System', 'O cargo configurado como **Autorole** é desconhecido. As configurações deste cargo foram deletadas do meu banco de dados.')
            }

            return Notify(member.guild.id, 'Autorole System', `Houve um erro na adição de cargo referente ao **Autorole**. Caso não saiba resolver o problema, utilize o comando \`${prefix}bug\` e relate o probrema.\n\`${err}\``)
        })

    }

    // Desativando o autorole 1 e 2 caso necessário
    function DisableAutorole(RoleId) {
        if (Autorole1 === RoleId)
            Server.Delete.AutoroleFirst()

        if (Autorole2 === RoleId)
            Server.Delete.AutoroleSecond()
    }

    async function Welcome() {

        if (!Canal && CanalDB) // Não existe o canal de boas-vindas no servidor, mas o ID do canal está na Database.
            return Server.Delete.WelcomeChannel() // Deleta o ID do canal excluido da Database

        if (!Canal?.id) return // Se não tem o canal, retorna

        // Verificamos se a bot tem permissão para mandar mensagem, caso não tenho, desativamos o welcomesystem e notificamos no canal logs.
        if (!Canal?.permissionsFor(member.guild.me).has(Permissions.FLAGS.SEND_MESSAGES)) {
            Server.Delete.WelcomeChannel()
            return Notify(member.guild.id, 'Sem permissão', `Eu não tenho permissão para enviar mensagens de boas-vindas no canal ${Canal}. Eu desativei este sistema até que corrijam este problema.`)
        }

        // Caso dê algum erro ao enviar a mensagem no canal solicitado pelos administradores do servidor, o bot me notifica (Rody) informando o erro
        Canal.send(`${Emoji} | ${member} ${Mensagem}`).catch(err => {
            Server.Delete.WelcomeChannel()
            client.users.cache.get(config.ownerId).send(`${e.Warn} | Erro no evento "guildMemberAdd" (Linha Emit: 90)\n\`${err}\``)
        })
    }
})