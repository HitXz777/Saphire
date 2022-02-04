const
    { e } = require('../../../database/emojis.json'),
    { f } = require('../../../database/frases.json'),
    { Permissions } = require('discord.js'),
    Error = require('../../../Routes/functions/errors'),
    Colors = require('../../../Routes/functions/colors'),
    { config } = require('../../../database/config.json')

// #246FE0 - Azul Saphire
module.exports = {
    name: 'cargo',
    aliases: ['cargos', 'role', 'roles'],
    category: 'moderation',
    emoji: `${e.ModShield}`,
    usage: '<role> <add/remove/edit>... Usa role info aí vai...',
    description: 'Gerencie os cargos do servidor',

    run: async (client, message, args, prefix, db, MessageEmbed, request, sdb) => {

        let Role = message.mentions.roles.first() || message.guild.roles.cache.get(args[2]) || message.guild.roles.cache.get(args[1]) || message.guild.roles.cache.find(r => r.name == args[1]) || message.guild.roles.cache.find(r => r.name == args[2])
        if (['info', 'help', 'ajuda', 'informações'].includes(args[0]?.toLowerCase()))
            return Role ? RoleInfo() : RoleInfoEmbed()

        if (!message.guild.me.permissions.has(Permissions.FLAGS.ADMINISTRATOR))
            return message.reply(`${e.Info} | Eu preciso da permissão \`**ADMINISTRADOR**\` ativada para gerenciar e buscar informações dos cargos mencionados.`)

        if (request) return message.reply(`${e.Deny} | ${f.Request}${sdb.get(`Request.${message.author.id}`)}`)

        let user = message.mentions.members.first() || message.mentions.repliedUser || message.guild.members.cache.get(args[2]) || message.guild.members.cache.get(args[1]) || message.member

        if (!message.member.permissions.has(Permissions.FLAGS.MANAGE_ROLES))
            return message.reply(`${e.Deny} | Permissão necessária: **Gerenciar cargos**`)

        if (['criar', 'crie', 'create'].includes(args[0]?.toLowerCase())) return CreateNewRole()
        if (['delete', 'excluir', 'deletar', 'apagar'].includes(args[0]?.toLowerCase())) return DeleteRole()
        if (['edit', 'editar', 'mudar'].includes(args[0]?.toLowerCase())) return EditRole()
        if (['add', 'adicionar', 'colocar'].includes(args[0]?.toLowerCase())) return AddRole()
        if (['remove', 'remover', 'tirar'].includes(args[0]?.toLowerCase())) return RemoveRole()
        return InvalidArgument()

        function CreateNewRole() {
            if (['mod', 'moderador', 'moderator'].includes(args[1]?.toLowerCase())) return CreateNewModRole()
            if (['adm', 'administrador', 'administrator'].includes(args[1]?.toLowerCase())) return CreateNewAdmRole()

            if (!args[1]) return message.reply(`${e.SaphireObs} | Só faltou o nome do cargo.`)
            let NameRole = args.slice(1).join(" ")
            NameRole.length > 100 ? message.reply(`${e.Deny} | O nome do cargo não pode ultrapassar **100 caracteres**.`) : CreateNewRole()

            function CreateNewRole() {
                message.guild.roles.create({
                    name: `${NameRole}`,
                    reason: `${message.author.tag} pediu para eu criar este cargo.`
                }).then(NewRole => {
                    message.reply(`${e.Check} | O cargo ${NewRole} foi criado com sucesso!\n*As permissões padrões foram concedidas a este cargo. Caso queira limpar as permissões, use \`${prefix}cargo edit @${NewRole.name} perms delete\`*`)
                }).catch(err => {
                    if (err.code === 30005)
                        return message.reply(`${e.Info} | O servidor atingiu o limite de **250 cargos**.`)

                    message.reply(`${e.Deny} | Aconteceu algum erro na criação do cargo.\n\`${err}\``)
                })
            }

            function CreateNewModRole() {
                if (!message.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR))
                    return message.reply(`${e.Deny} | Permissão necessária: **Administrador**`)

                message.guild.roles.create({
                    name: 'Mod',
                    reason: `${message.author.tag} pediu para eu criar este cargo.`,
                    permissions: ['KICK_MEMBERS', 'BAN_MEMBERS', 'MANAGE_MESSAGES', 'MANAGE_NICKNAMES']
                }).then(NewRole => {
                    message.reply(`${e.Check} | O cargo ${NewRole} foi criado com sucesso!\n*Permissões concedidas: Expulsar membros, Banir membros, Ver canais, Enviar mensagens, Gerenciar apelidos*`)
                }).catch(err => {
                    message.reply(`${e.Deny} | Aconteceu algum erro na criação do cargo.\n\`${err}\``)
                })
            }

            function CreateNewAdmRole() {
                if (!message.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR))
                    return message.reply(`${e.Deny} | Permissão necessária: **Administrador**`)

                message.guild.roles.create({
                    name: 'Adm',
                    reason: `${message.author.tag} pediu para eu criar este cargo.`,
                    permissions: ['ADMINISTRATOR']
                }).then(NewRole => {
                    message.reply(`${e.Check} | O cargo ${NewRole} foi criado com sucesso!\n*Permissão concedida: Administrador*`)
                }).catch(err => {
                    message.reply(`${e.Deny} | Aconteceu algum erro na criação do cargo.\n\`${err}\``)
                })
            }
        }

        function DeleteRole() {

            if (!Role) return message.channel.send(`${e.Info} | @Marque, diga o ID ou o nome do cargo para que eu possa deletar.`)
            if (Role.deleted) return message.reply(`${e.Info} | Este cargo já foi deletado.`)
            if (!Role.editable) return message.reply(`${e.Deny} | Eu não tenho permissão para gerenciar este cargo.`)

            if (message.author.id !== message.guild.ownerId) {
                if (Role.comparePositionTo(message.member.roles.highest) >= 0)
                    return message.reply(`${e.Deny} | Você não tem permissão para gerenciar este cargo.`)
            }

            return message.reply(`${e.QuestionMark} | Confirme a exclusão do cargo: ${Role}`).then(msg => {
                sdb.set(`Request.${message.author.id}`, `${msg.url}`)
                msg.react('✅').catch(() => { }) // Check
                msg.react('❌').catch(() => { }) // X

                const filter = (reaction, user) => { return ['✅', '❌'].includes(reaction.emoji.name) && user.id === message.author.id }

                msg.awaitReactions({ filter, max: 1, time: 15000, errors: ['time'] }).then(collected => {
                    const reaction = collected.first()

                    if (reaction.emoji.name === '✅') {
                        sdb.delete(`Request.${message.author.id}`)
                        Role.delete(`${message.author.tag} solicitou a exclusão deste cargo.`)
                            .then(DeletedRole => { msg.edit(`${e.Check} | O cargo **${DeletedRole.name}** foi deletado com sucesso!`).catch(() => { }) })
                            .catch(err => {
                                if (err.code === 10011)
                                    return message.reply(`${e.Deny} | Cargo Desconhecido.`)

                                if (err.code === 50028)
                                    return message.reply(`${e.Deny} | Cargo Inválido`)

                                message.channel.send(`${e.Warn} | Houve um erro ao deletar este cargo.\n\`${err}\``)
                            });
                    } else {
                        sdb.delete(`Request.${message.author.id}`)
                        msg.edit(`${e.Deny} | Comando cancelado.`).catch(() => { })
                    }
                }).catch(() => {
                    sdb.delete(`Request.${message.author.id}`)
                    msg.edit(`${e.Deny} | Comando cancelado por tempo expirado.`).catch(() => { })
                })

            }).catch(err => {
                Error(message, err)
                message.channel.send(`${e.SaphireCry} | Ocorreu um erro durante o processo. Por favor, reporte o ocorrido usando \`${prefix}bug\`\n\`${err}\``)
            })
        }

        function EditRole() {

            if (!Role) return message.reply(`${e.Deny} | Forneça um @cargo.`)
            if (Role.deleted) return message.reply(`${e.Info} | Este cargo foi deletado.`)
            if (!Role.editable) return message.reply(`${e.Deny} | Eu não tenho permissão para gerenciar este cargo.`)

            if (message.author.id !== message.guild.ownerId) {
                if (Role.comparePositionTo(message.member.roles.highest) >= 0) {
                    return message.reply(`${e.Deny} | Você não tem permissão para gerenciar esse cargo.`)
                }
            }

            if (['name', 'nome'].includes(args[2]?.toLowerCase())) return EditRoleName()
            if (['cor', 'color'].includes(args[2]?.toLowerCase())) return EditRoleColor()
            if (['hoist', 'hoisted', 'mostrar', 'visivel', 'visível', 'exibir'].includes(args[2]?.toLowerCase())) return EditRoleHoist()
            if (['permissões', 'permissions', 'perm', 'perms'].includes(args[2]?.toLowerCase())) return EditRolePermissions()
            return InvalidArgument()

            function EditRoleName() {

                let NovoNome = args?.slice(3).join(" ")
                if (!NovoNome) return message.reply(`${e.Info} | Modo de uso: \`${prefix}role edit @cargo name <Novo Nome>\``)
                if (NovoNome.length > 100) return message.reply(`${e.Deny} | Nomes de cargos não podem ultrapassar **100 caracteres**.`)

                return message.reply(`${e.Check} | Você confirma trocar o nome do cargo de **${Role.name}** para **${NovoNome}**?`).then(msg => {
                    sdb.set(`Request.${message.author.id}`, `${msg.url}`)
                    msg.react('✅').catch(() => { }) // Check
                    msg.react('❌').catch(() => { }) // X

                    const filter = (reaction, user) => { return ['✅', '❌'].includes(reaction.emoji.name) && user.id === message.author.id }

                    msg.awaitReactions({ filter, max: 1, time: 15000, errors: ['time'] }).then(collected => {
                        const reaction = collected.first()

                        if (reaction.emoji.name === '✅') {
                            sdb.delete(`Request.${message.author.id}`)
                            Role.setName(NovoNome, `${message.author.tag} alterou o nome deste cargo.`)
                                .then(updated => msg.edit(`${e.Check} | O nome do cargo foi alterado para: ${updated.name}`).catch(() => { }))
                                .catch(err => {
                                    if (err.code === 10011)
                                        return message.reply(`${e.Deny} | Cargo Desconhecido.`)

                                    if (err.code === 50028)
                                        return message.reply(`${e.Deny} | Cargo Inválido`)
                                    message.channel.send(`${e.Warn} | Houve um erro ao editar este cargo.\n\`${err}\``)
                                });
                        } else {
                            sdb.delete(`Request.${message.author.id}`)
                            msg.edit(`${e.Deny} | Comando cancelado.`).catch(() => { })
                        }
                    }).catch(() => {
                        sdb.delete(`Request.${message.author.id}`)
                        msg.edit(`${e.Deny} | Comando cancelado por tempo expirado.`).catch(() => { })
                    })

                }).catch(err => {
                    if (err.code === 10011)
                        return message.reply(`${e.Deny} | Cargo Desconhecido.`)

                    if (err.code === 50028)
                        return message.reply(`${e.Deny} | Cargo Inválido`)

                    Error(message, err)
                    message.channel.send(`${e.SaphireCry} | Ocorreu um erro durante o processo. Por favor, reporte o ocorrido usando \`${prefix}bug\`\n\`${err}\``)
                })
            }

            function EditRoleColor() {

                let NovaCor = args.slice(3).join(" ").toUpperCase()
                if (!NovaCor) return message.reply(`${e.Info} | Este comando necessita de um código #HEX. É um código composto por letras e número, por exemplo: #8B0000 (Vermelho).\nVocê pode ver algumas cores usando o comando \`${prefix}cor\`. Se quiser deixar o cargo na padrão, use \`${prefix}role edit @cargo cor off\``)
                if (['reset', 'resetar', 'padrão', 'delete', 'deletar', 'apagar', 'excluir', 'off', 'null'].includes(args[3]?.toLowerCase())) return SetNewRoleColor(null)

                isHex(NovaCor) ? SetNewRoleColor(NovaCor) : InvalidHex(args[3])

                function isHex(value) { return /^#[0-9A-F]{6}$/i.test(`${value}`) } // True/False
                function InvalidHex(value) { return message.reply(`${e.Deny} | \`${value}\` | Não é um código #HEX válido.`) }

                function SetNewRoleColor(value) {
                    value === null ? NovaCor = 'Cinza Padrão' : NovaCor = NovaCor

                    return message.reply(`${e.QuestionMark} | Confirma trocar a cor do cargo **${Role.name}** para \`${NovaCor}\``).then(msg => {
                        sdb.set(`Request.${message.author.id}`, `${msg.url}`)
                        msg.react('✅').catch(() => { }) // Check
                        msg.react('❌').catch(() => { }) // X

                        const filter = (reaction, user) => { return ['✅', '❌'].includes(reaction.emoji.name) && user.id === message.author.id }

                        msg.awaitReactions({ filter, max: 1, time: 15000, errors: ['time'] }).then(collected => {
                            const reaction = collected.first()

                            if (reaction.emoji.name === '✅') {
                                sdb.delete(`Request.${message.author.id}`)
                                Role.setColor(value, `${message.author.tag} alterou a cor deste cargo.`)
                                    .then(() => msg.edit(`${e.Check} | A cor do cargo foi atualizada com sucesso!`).catch(() => { }))
                                    .catch(err => {
                                        if (err.code === 10011)
                                            return message.reply(`${e.Deny} | Cargo Desconhecido.`)

                                        if (err.code === 50028)
                                            return message.reply(`${e.Deny} | Cargo Inválido`)

                                        message.channel.send(`${e.Warn} | Houve um erro ao editar este cargo.\n\`${err}\``)
                                    })
                            } else {
                                sdb.delete(`Request.${message.author.id}`)
                                msg.edit(`${e.Deny} | Comando cancelado.`).catch(() => { })
                            }
                        }).catch(() => {
                            sdb.delete(`Request.${message.author.id}`)
                            msg.edit(`${e.Deny} | Comando cancelado por tempo expirado.`).catch(() => { })
                        })

                    }).catch(err => {
                        if (err.code === 10011)
                            return message.reply(`${e.Deny} | Cargo Desconhecido.`)

                        if (err.code === 50028)
                            return message.reply(`${e.Deny} | Cargo Inválido`)

                        Error(message, err)
                        message.channel.send(`${e.SaphireCry} | Ocorreu um erro durante o processo. Por favor, reporte o ocorrido usando \`${prefix}bug\`\n\`${err}\``)
                    })
                }
            }

            function EditRoleHoist() {
                let value
                if (!['on', 'off'].includes(args[3]?.toLowerCase())) return message.reply(`${e.Deny} | Apenas **ON/OFF**.`)
                args[3]?.toLowerCase() === 'on' ? value = true : value = false

                Role.setHoist(value)
                    .then(() => message.reply(`${e.Check} | Cargo atualizado com sucesso!`))
                    .catch(err => {
                        if (err.code === 10011)
                            return message.reply(`${e.Deny} | Cargo Desconhecido.`)

                        if (err.code === 50028)
                            return message.reply(`${e.Deny} | Cargo Inválido`)
                        message.channel.send(`${e.Warn} | Houve um erro ao editar este cargo.\n\`${err}\``)
                    })
            }

            function EditRolePermissions() {

                if (!['reset', 'resetar', 'limpar', 'delete', 'excluir'].includes(args[3]?.toLowerCase())) return InvalidArgument()

                Role.setPermissions(0n)
                    .then(() => message.reply(`${e.Check} | Todas as permissões do cargo ${Role} foram apagadas.`))
                    .catch(err => {
                        if (err.code === 10011)
                            return message.reply(`${e.Deny} | Cargo Desconhecido.`)

                        if (err.code === 50028)
                            return message.reply(`${e.Deny} | Cargo Inválido`)
                        message.channel.send(`${e.Warn} | Houve um erro ao editar este cargo.\n\`${err}\``)
                    })
            }
        }

        function RoleInfo() {
            
            if (!Role) return message.channel.send(`${e.Info} | @Marque, diga o ID ou o nome do cargo para que eu possa pegar as informações.`)

            let permissions = Role.permissions.toArray() || [],
                PermissionsFormated = permissions.map(perm => config.Perms[perm]) || false,
                RoleSize = Role.members.size || 0,
                RoleId = Role.id || 'Indefinido',
                RoleHex = Role.hexColor || 'Indefinido',
                RoleHoist = Role.hoist ? `${e.Check} Sim` : `${e.Deny} Não`,
                RoleMention = Role.mentionable ? `${e.Check} Sim` : `${e.Deny} Não`,
                RoleName = Role.name || 'Indefinido',
                data = Role.createdAt,
                RoleData = (data.getDate() + "/" + (data.getMonth() + 1) + "/" + data.getFullYear() + " ás " + data.getHours() + "h " + data.getMinutes() + 'm e ' + data.getSeconds() + 's') || 'Indefinido',
                RoleEmbed = new MessageEmbed()
                    .setColor(RoleHex)
                    .setTitle(`${e.Info} Informações do Cargo: ${RoleName}`)
                    .addFields(
                        {
                            name: '📄 Nome',
                            value: `${RoleName}`
                        },
                        {
                            name: '🫂 Contagem',
                            value: `${RoleSize} membros possuem este cargo`
                        },
                        {
                            name: '🆔 ID do Cargo',
                            value: `\`${RoleId}\``
                        },
                        {
                            name: '⬅️ Cor #HEX',
                            value: `\`${RoleHex.toUpperCase()}\``
                        },
                        {
                            name: '👀 Exibir aos membros',
                            value: `${RoleHoist}`
                        },
                        {
                            name: '🔔 Mencionável',
                            value: `${RoleMention}`
                        },
                        {
                            name: '📆 Cargo criado em',
                            value: `\`${RoleData}\``
                        },
                        {
                            name: `${e.ModShield} Permissões`,
                            value: PermissionsFormated?.join(' | ') || 'Nenhuma'
                        }
                    )

            return message.channel.send({ embeds: [RoleEmbed] })
        }

        function AddRole() {

            if (!Role) return message.channel.send(`${e.Info} | @Marque, diga o ID ou o nome do cargo para que eu possa adiciona-lo.`)
            if (Role.deleted) return message.reply(`${e.Info} | Este cargo foi deletado.`)
            if (!Role.editable) return message.reply(`${e.Deny} | Eu não tenho permissão para gerenciar este cargo.`)

            if (message.author.id !== message.guild.ownerId) {
                if (Role.comparePositionTo(message.member.roles.highest) >= 0)
                    return message.reply(`${e.Deny} | Você não tem permissão para gerenciar este cargo.`)
            }

            user.roles.add(Role)
                .then(() => {
                    return message.channel.send(`${e.Check} | Cargo adicionado com sucesso!`)
                })
                .catch(err => {
                    if (err.code === 10011)
                        return message.reply(`${e.Deny} | Cargo Desconhecido.`)

                    if (err.code === 50028)
                        return message.reply(`${e.Deny} | Cargo Inválido`)

                    message.channel.send(`${e.Warn} | Houve um erro ao adicionar este cargo.\n\`${err}\``)
                })
        }

        function RemoveRole() {

            if (!Role) return message.channel.send(`${e.Info} | @Marque, diga o ID ou o nome do cargo para que eu possa remove-lo.`)
            if (Role.deleted) return message.reply(`${e.Info} | Este cargo foi deletado.`)
            if (!Role.editable) return message.reply(`${e.Deny} | Eu não tenho permissão para gerenciar este cargo.`)

            if (message.author.id !== message.guild.ownerId) {
                if (Role.comparePositionTo(message.member.roles.highest) >= 0)
                    return message.reply(`${e.Deny} | Você não tem permissão para gerenciar este cargo.`)
            }

            let Who
            user.id === message.author.id ? Who = 'Você' : Who = user.user.username
            if (!user.roles.cache.has(Role.id)) return message.reply(`${e.Deny} | ${Who} não possui este cargo.`)

            user.roles.remove(Role)
                .then(() => {
                    return message.channel.send(`${e.Check} | Cargo removido com sucesso!`)
                })
                .catch(err => {
                    if (err.code === 10011)
                        return message.reply(`${e.Deny} | Cargo Desconhecido.`)

                    if (err.code === 50028)
                        return message.reply(`${e.Deny} | Cargo Inválido`)

                    message.channel.send(`${e.Warn} | Houve um erro ao remover este cargo.\n\`${err}\``)
                })
        }

        function InvalidArgument() {
            return message.reply(`${e.Info} | Você não sabe usar este comando? Tenta usar \`${prefix}cargo info\``)
        }

        function RoleInfoEmbed() {
            return message.reply({
                embeds:
                    [
                        new MessageEmbed()
                            .setColor(Colors(message.member))
                            .setTitle(`${e.Gear} Gerenciamento Avançado de Cargos ${client.user.username}`)
                            .setDescription(`Com esse comando é possível gerenciar os cargos do servidor de uma maneira simples, sem precisar ficar entrando nas configurações. E o comando inteiro é divido em categorias.`)
                            .addFields(
                                [
                                    {
                                        name: `${e.SaphireObs} Guia de Argumentos`,
                                        value: '\`<obrigatório>\` \`[opicional]\`'
                                    },
                                    {
                                        name: '🔀 Comandos de Ativação',
                                        value: `\`${prefix}cargo\` \`${prefix}cargos\` \`${prefix}role\` \`${prefix}roles\`\n*Obs: **role** em inglês significa **cargo***.`
                                    },
                                    {
                                        name: '🛡️ Permissões',
                                        value: `**${client.user.username}**: \`Administrador\`\n**Usuário**: \`Gerenciar cargos\``
                                    },
                                    {
                                        name: '🚫 Bloqueios de Segurança',
                                        value: `Não é possível \`editar/deletar/adicionar/remover\` cargos acima ou iguais aos seus.\n*Isso também se aplica a ${client.user.username}*`
                                    },
                                    {
                                        name: '🔍 Suporte de Pesquisa aos Cargos',
                                        value: '\`[@menção]\` Mencione o cargo\n\`[132659...]\` Forneça o ID do cargo\n\`[cargo]\` Escreva o nome do cargo\n*(Meu sistema irá diferenciar as letras **maiúsculas** e **minúsculas** e não é capaz de achar cargos com mais de 1 palavra quando escrito sem @menção ou id)*'
                                    },
                                    {
                                        name: `${e.Info} Informações`,
                                        value: `\`${prefix}role <info> [@cargo]\`\nVeja todas *(ou quase todas)* as informações referente ao cargo. Caso não mencione o @cargo, você virá para esse painel de informações.\n**Sub-atalhos**: \`info\` \`help\` \`ajuda\` \`informações\``
                                    },
                                    {
                                        name: '🆕 Crie Cargos',
                                        value: `\`${prefix}role <create> <Nome do novo cargo>\`\nVale lembrar que o limite de caracteres suportados nos nomes dos cargos no Discord são de **100 caracteres** e as permissões são configuradas seguindo o padrão do Discord.\n**Sub-atalhos**: \`criar\` \`crie\` \`create\``
                                    },
                                    {
                                        name: `${e.ModShield} Crie cargos de Mod/Adm`,
                                        value: `\`${prefix}role <create> [Mod/Adm]\`\n**Permissões Ativadas**: \`Expulsar membros\` \`Banir membros\` \`Gerenciar mensagens\` \`Gerenciar apelidos\` | Adm -> \`Administrador\`\n*(Para criar cargos Mod/Adm, é necessário ser um Administrador)*\n**Sub-atalhos**: \`mod\` \`moderador\` \`moderator\` | \`adm\` \`administrador\` \`administrator\``
                                    },
                                    {
                                        name: '🚽 Jogue na Descarga',
                                        value: `\`${prefix}role <delete> <@cargo>\`\nAdeus carguinho ${e.SaphireCry}\n**Sub-atalhos**: \`delete\` \`excluir\` \`deletar\` \`apagar\``
                                    },
                                    {
                                        name: '📝 Edite Cargos',
                                        value: `\`${prefix}role <edit> <@cargo> [nome] <Novo nome do cargo>\`\nAs regras de limite de caracteres também se aplicam aqui, ok?\n\`${prefix}role <edit> <@cargo> [cor] <#CódigoHex>\`\nSiiim, dá pra mudar a cor, legal né?\n\`${prefix}role <edit> <@cargo> [exibir] <on/off>\`\nAqui você liga/desliga o cargo que fica em destaque.\n\`${prefix}role <edit> <@cargo> [perms] <off>\`\nDesliga todas as permissões do cargo mencionado.\n \n**Sub-atalhos**: \`edit\` \`editar\` \`mudar\` | \`name\` \`nome\` | \`cor\` \`color\` | \`hoist\` \`hoisted\` \`mostrar\` \`visivel\` \`visível\` \`exibir\` \`permissões\` \`permissions\` \`perm\` \`perms\``
                                    },
                                    {
                                        name: `${e.Upvote} Adicione Cargos`,
                                        value: `\`${prefix}role <add> [@cargo/@user]\`\nÉ... Não importa se @user ou @cargo vem primeiro, vou adicionar de qualquer jeito.\n**Sub-atalhos**: \`add\` \`adicionar\` \`colocar\``
                                    },
                                    {
                                        name: `${e.DownVote} Remova Cargos`,
                                        value: `\`${prefix}role <remove> [@user/@cargo]\`\nAqui também! Eu vou tirar o cargo e não importa quem @marcou primeiro.\n**Sub-atalhos**: \`remove\` \`remover\` \`tirar\``
                                    }
                                ]
                            )
                            .setFooter('Esse comando levou 5 horas para ser feito')
                    ]
            })
        }

    }
}