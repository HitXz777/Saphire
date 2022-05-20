const { Permissions } = require('discord.js'),
    { e } = require('../../../JSON/emojis.json')

module.exports = {
    name: 'autorole',
    aliases: ['autorolestats'],
    category: 'config',
    UserPermissions: ['MANAGE_ROLES'],
    ClientPermissions: ['MANAGE_ROLES', 'ADD_REACTIONS'],
    emoji: `${e.Verify}`,
    usage: '<autorole> <1/2> <role> | <status> | <1/2> <off>',
    description: 'Selecione um cargo para todos que entrem no servidor.',

    execute: async (client, message, args, prefix, MessageEmbed, Database) => {

        let role = message.mentions.roles.first(),
            guild = await Database.Guild.findOne({ id: message.guild.id }, 'Autorole'),
            rolesId = guild?.Autorole || []

        if (!args[0]) return message.reply({
            embeds: [
                new MessageEmbed()
                    .setColor('#246FE0')
                    .setTitle(`${e.Verify} Autorole System`)
                    .setDescription(`O Sistema ${client.user.username}'s Autorole garante até 10 cargos.`)
                    .addField(`${e.QuestionMark} **O que é Autorole?**`, `Autorole é um sistema automático em que todo membro que entrar no servidor, receberá um cargo (dado por mim) pré definido pela staff do servidor.`)
                    .addField(`${e.Warn} ATENÇÃO`, `\n1. Para perfeito funcionamento, o meu cargo **DEVE** estar **ACIMA** dos cargos definidos.\n \n2. Não é permito cargos com a permissões **administrativas** ativadas. Caso ative pós configuração, o cargo será deletado da configuração autorole na entrada de um novo membro.\n \n3. Cargos em que eu não tenho poder de manusea-los, também serão removidos.`)
                    .addField('• Comandos do Autorole', `\`${prefix}autorole add @cargo\`\n\`${prefix}autorole Status\``, true)
                    .addField('• Comando de desativação', `\`${prefix}autorole remove all\`\n\`${prefix}autorole remove @cargo\``, true)
                    .addField(`${e.SaphireObs} Forte recomendação`, `Ative a função \`${prefix}logs\`.\nLá eu mandarei relatórios se qualquer coisa der errado ou algum bobinho(a) fizer besteira com os cargos.`)
            ]
        })

        if (['status', 'stats', 'info'].includes(args[0]?.toLowerCase())) return GetAndSendAutoroleStatus()
        if (['off', 'desligar', 'desativar', 'remove', 'del', 'delete', 'excluir', 'tirar'].includes(args[0]?.toLowerCase())) return DisableAutorole()
        if (['add', 'adicionar', 'colocar'].includes(args[0]?.toLowerCase())) return AddAutorole()
        return message.reply(`${e.Deny} | Você está nas profundezas do código do autorole. Use \`${prefix}help autorole\` ou apenas \`${prefix}autorole\` que eu te mando todos os comandos do sistema.`)

        async function AddAutorole() {

            if (!role)
                return message.reply(`${e.Info} | Para adicionar cargos ao autorole, basta usar o comando: \`${prefix}autorole add @cargo\``)

            if (rolesId.length >= 10)
                return message.reply(`${e.Deny} | O autorole deste servidor já atingiu o limite máximo de 10 cargos cadastrados.`)

            if (['@here', '@everyone'].includes(args[1])) {
                const msg = await message.reply(`${e.Hmmm}`)
                return setTimeout(() => msg.edit(`Olha... Eu não vou nem comentar sob tal atrocidade.`).catch(() => { }), 3000)
            }

            if (role.botRole) return message.reply(`${e.Deny} | Sério que você quer configurar um cargo de bot como autorole? ${e.SaphireWhat}`)
            if (!role.editable) return message.reply(`${e.Deny} | Eu não tenho permissão para gerenciar o cargo selecionado.`)
            if (rolesId.includes(role.id)) return message.reply(`${e.Deny} | O cargo mencionado já foi configurado como autorole.`)
            if (message.author.id !== message.guild.ownerId && role.comparePositionTo(message.member.roles.highest) > -1) return message.reply(`${e.Deny} | Você não tem permissão para gerenciar este cargo.`)
            if (role.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) return message.reply(`${e.Deny} | Você não pode configurar um cargo com permissão de "ADMINISTRADOR" ativada como Autorole.`)

            const emojis = ['✅', '❌'],
                msg = await message.reply(`${e.QuestionMark} | Você deseja configurar o cargo "${role} *\`${role.id}\`*" como autorole?`)

            for (const emoji of emojis) msg.react(emoji).catch(() => { })

            return msg.createReactionCollector({
                filter: (reaction, user) => emojis.includes(reaction.emoji.name) && user.id === message.author.id,
                time: 30000,
                errors: ['time']
            })

                .on('collect', async (reaction) => {

                    if (reaction.emoji.name === emojis[0]) {

                        await Database.Guild.updateOne(
                            { id: message.guild.id },
                            { $push: { Autorole: role.id } },
                            { upsert: true }
                        )

                        return msg.edit(`${e.Check} | O cargo ${role} foi adicionado e configurado com sucesso!`).catch(() => { })

                    } else { return msg.edit(`${e.Deny} | Comando cancelado.`).catch(() => { }) }

                })

                .on('end', collected => {

                    if (collected.size === 0)
                        return msg.edit(`${e.Deny} | Comando cancelado.`).catch(() => { })

                })

        }

        async function DisableAutorole() {

            if (['all', 'tudo', 'todos', 'todas'].includes(args[0]?.toLowerCase())) return DeleteRole('', true)

            if (rolesId.length <= 0)
                return message.reply(`${e.Deny} | O autorole deste servidor não possui nenhum cargo definido como autorole.`)

            if (!role)
                return message.reply(`${e.Info} | Para remover cargos do autorole, basta usar o comando: \`${prefix}autorole remove @cargo\``)

            if (!rolesId.includes(role.id))
                return message.reply(`${e.Deny} | Este cargo não está configurado como autorole.`)

            const emojis = ['✅', '❌'],
                msg = await message.reply(`${e.QuestionMark} | Você deseja remover o cargo "${role} *\`${role.id}\`*" do autorole?`)

            for (const emoji of emojis) msg.react(emoji).catch(() => { })

            return msg.createReactionCollector({
                filter: (reaction, user) => emojis.includes(reaction.emoji.name) && user.id === message.author.id,
                time: 30000,
                errors: ['time']
            })

                .on('collect', async (reaction) => {

                    if (reaction.emoji.name === emojis[0]) {

                        await Database.Guild.updateOne(
                            { id: message.guild.id },
                            { $pull: { Autorole: role.id } }
                        )

                        return msg.edit(`${e.Check} | O cargo ${role} foi removido do autorole com sucesso!`).catch(() => { })

                    } else { return msg.edit(`${e.Deny} | Comando cancelado.`).catch(() => { }) }

                })

                .on('end', collected => {

                    if (collected.size === 0)
                        return msg.edit(`${e.Deny} | Comando cancelado.`).catch(() => { })

                })

        }

        function GetAndSendAutoroleStatus() {

            let validate = []

            for (const id of rolesId) {
                validate.includes(id)
                    ? DeleteRole(id)
                    : validate.push(id)
            }

            const RolesMapped = validate.map((roleId, i) => {

                let Cargo = message.guild.roles.cache.get(`${roleId}`)
                if (!Cargo) DeleteRole(roleId)

                return Cargo ? `${i + 1}. ${Cargo}` : `${i + 1} ${e.Deny} | Cargo não encontrado. (Removido da Database)`

            }).join('\n')

            return message.reply({
                embeds: [
                    new MessageEmbed()
                        .setColor('#246FE0')
                        .setTitle(':satellite: | Autorole System Status')
                        .setDescription(`${RolesMapped || 'Nenhum cargo foi configurado ainda'}`)
                ]
            })

        }

        async function DeleteRole(roleId, all = false) {

            if (all) {

                if (!rolesId || rolesId.length === 0)
                    return message.reply(`${e.Deny} | Este servidor não tem nenhum cargo configurado no autorole.`)

                await Database.Guild.updateOne(
                    { id: message.guild.id },
                    { $unset: { Autorole: 1 } }
                )
                return message.reply(`${e.Check} | Todos os cargos configurados como autorole foram removidos e o sistema foi desativado.`)
            }

            await Database.Guild.updateOne(
                { id: message.guild.id },
                { $pull: { Autorole: roleId } }
            )
            return
        }

    }
}