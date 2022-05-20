const { DatabaseObj: { e, config } } = require('../../../modules/functions/plugins/database'),
    Moeda = require('../../../modules/functions/public/moeda'),
    Error = require('../../../modules/functions/config/errors'),
    isUrl = require('../../../modules/functions/plugins/isurl')

module.exports = {
    name: 'bgconfig',
    aliases: ['setwall', 'newbg', 'bg'],
    category: 'bot',
    emoji: `${e.OwnerCrow}`,
    usage: '<bg> <bgCode> <Price> <LinkImage> <DesignerId> <Name>',
    description: 'Permite os administradores do Sistema de Level configurar os wallpapers',

    execute: async (client, message, args, prefix, MessageEmbed, Database) => {

        let clientData = await Database.Client.findOne({ id: client.user.id }, 'Administradores'),
            adms = clientData?.Administradores || []

        if (!adms.includes(message.author.id) && message.author.id !== config.ownerId && message.author.id !== config.designerId)
            return message.reply(`${e.RedStar} | Este comando é privado aos administradores do Sistema de Level.`)

        let BgLevel = Database.BgLevel
        let bg = BgLevel.get('LevelWallpapers')

        if (['new', 'add', 'adicionar', 'novo'].includes(args[0]?.toLowerCase())) return CheckAndSetWallpaper()
        if (['edit', 'editar'].includes(args[0]?.toLowerCase())) return EditWallpaper()
        if (['del', 'delete', 'deletar'].includes(args[0]?.toLowerCase())) return DelWallpaper()
        if (['give', 'doar', 'dar'].includes(args[0]?.toLowerCase())) return addWallpaperToUser()
        if (['remover', 'remove'].includes(args[0]?.toLowerCase())) return removeWallpaperFromUser()
        if (['info', 'help', 'ajuda'].includes(args[0]?.toLowerCase())) return sendInfo()
        return message.reply(`${e.Info} | Comando disponíveis: \`new | edit | del\``)

        function sendInfo() {
            return message.reply(
                {
                    embeds: [
                        new MessageEmbed()
                            .setColor(client.blue)
                            .setTitle(`${e.Gear} | Background Code Info`)
                            .setDescription('Todas as informações e comandos estão aqui')
                            .addFields(
                                {
                                    name: 'Criar um novo Wallpaper',
                                    value: `\`${prefix}bg new NúmeroDoWallpaper LinkDaImagem Preço IdDoDesigner \*Limite Nome Do Wallpaper\`\n${e.Info} \*Limite: \`-1\` Sem limite, \`0\` Esgotado, \`Maior que 1\` Limite configurado`
                                },
                                {
                                    name: 'Deletar um Wallpaper',
                                    value: `\`${prefix}bg delete NúmeroDoWallpaper\``
                                },
                                {
                                    name: 'Doar wallpaper para um usuário',
                                    value: `\`${prefix}bg give @user/id bgCode\``
                                },
                                {
                                    name: 'Remover wallpaper de um usuário',
                                    value: `\`${prefix}bg remove @user/id bgCode/all\``
                                },
                                {
                                    name: 'Editar informações de wallpaper',
                                    value: `\`${prefix}bg edit *classe\`\n${e.Info} *classe: \`Code | Image | Price | Name | Limit | Designer\``
                                }
                            )
                    ]
                }
            )
        }

        function CheckAndSetWallpaper() {

            let Code = parseInt(args[1])?.toFixed(0)
            let Image = args[2]
            let Price = parseInt(args[3])
            let DesignerId = args[4]
            let limit = Math.floor(args[5])
            let Name = args.slice(6).join(" ")

            if (!args[1])
                return message.reply(`${e.Info} | Para adicionar algum wallpaper na database é necessário usar o comando com os seguintes parâmetros: **\`Number | ImageLink | Price | DesignerId | Name\`**\n\`${prefix}bg new 1 Link Price IdDoDesigner Name\` - Exemplo: \`${prefix}bg new 0 https://media.discordapp.net/attachments/899493577623756801/899852259154866276/unknown.png?width=708&height=409 1000 1234567891234 Fundo Padrão\`\n \nAs primeiras letras **devem** ser **maiúsculas**. O **número** do registro deve ser um número. O **nome** deve ser único. O **link** da mensagem deve ser o **link da foto da mensagem**. O **preço** deve ser justificado, justo e coerente.`)

            if (isNaN(Code))
                return message.reply(`${e.Deny} | O número de registro **${args[1]}** não é válido. Certifique-se de que isso é mesmo um número.`)

            if (BgLevel.get(`LevelWallpapers.bg${Code}`))
                return message.reply(`${e.Deny} | O código **bg${Code}** já foi registrado na database.`)

            if (!isUrl(Image))
                return message.reply(`${e.Deny} | O link da imagem não é um link. Para ver o comando, use \`${prefix}bg\`.`)

            for (const walls of Object.values(bg || {})) {
                if (Name === walls.Name)
                    return message.reply(`${e.Deny} | O nome já foi registrado na database.`)

                if (Image === walls.Image)
                    return message.reply(`${e.Deny} | Este wallpaper já foi configurado como **${walls.Name}**.`)
            }

            if (isNaN(Price))
                return message.reply(`${e.Deny} | O preço deve ser um número. Certifique-se de que **(${Price})** é um número.`)

            if (!client.users.cache.has(DesignerId))
                return message.reply(`${e.Deny} | O id informado não confere com nenhum usuário de nenhum servidor.`)

            if (!limit)
                return message.reply(`${e.Deny} | O número limite é inválido.`)

            if (!Name)
                return message.reply(`${e.Deny} | Forneça o nome do wallpaper para adição a database.`)

            return SetNewLevelWallpaper(Code, Name, Image, Price)

            async function SetNewLevelWallpaper(Code, Name, Image, Price) {

                try {
                    BgLevel.set(`LevelWallpapers.bg${Code}`, {
                        Name: Name,
                        Image: Image,
                        Price: Price,
                        DesignerId: DesignerId,
                        Limit: limit === -1 ? undefined : limit
                    })

                    return message.reply(`${e.Check} | O background **${Name}** foi adicionado com sucesso a database com o código de registro **\`bg${Code}\`**, preço configurado em **${Price} ${await Moeda(message)}** com o Designer **${client.users.cache.get(DesignerId)?.tag || 'Indefinido'}**.`)
                } catch (err) {
                    return message.channel.send(`${e.Deny} | Houve um erro ao adicionar o novo wallpaper.\n\`${err}\``)
                }
            }
        }

        function EditWallpaper() {

            let bgCode = args[1]
            let NewArgs = args.slice(3).join(' ')

            if (!args[1])
                return message.reply(`${e.Info} | Para alterar alguma informação na database é necessário usar o comando com os seguintes parâmetros: **\`Code | Image | Price | Name\`**\n\`${prefix}bg edit **bgCode** "Code/Image/Price/Name" Novo Argumento\` - Exemplo: \`${prefix}bg edit **bgCode** Price NovoPreço\``)

            if (!bg[`${bgCode}`])
                return message.reply(`${e.Deny} | O número de registro **${args[1]}** não é válido ou não existe na minha database.`)

            if (['code', 'código', 'codigo'].includes(args[2]?.toLowerCase())) return EditCode()
            if (['image', 'imagem'].includes(args[2]?.toLowerCase())) return EditImage()
            if (['preço', 'price'].includes(args[2]?.toLowerCase())) return EditPrice()
            if (['name', 'nome'].includes(args[2]?.toLowerCase())) return EditName()
            if (['designer', 'autor'].includes(args[2]?.toLowerCase())) return EditDesigner()
            if (['limited', 'limit', 'limite'].includes(args[2]?.toLowerCase())) return EditLimit()
            return message.reply(`${e.Info} | Opções do sub-comando edit: **\`Code | Image | Price | Name | Designer | Limit\`**`)

            function EditCode() {

                let newbgCode = parseInt(NewArgs)?.toFixed(0)

                if (isNaN(newbgCode))
                    return message.reply(`${e.Deny} | O novo bgCode deve ser um número.`)

                if (BgLevel.get(`LevelWallpapers.bg${newbgCode}`)) {
                    return message.reply(`${e.Deny} | O código **bg${newbgCode}** já está registrado no banco de dados.`)

                } else {

                    try {

                        BgLevel.set(`LevelWallpapers.bg${newbgCode}`, {
                            Name: BgLevel.get(`LevelWallpapers.${bgCode}.Name`),
                            Image: BgLevel.get(`LevelWallpapers.${bgCode}.Image`),
                            Price: BgLevel.get(`LevelWallpapers.${bgCode}.Price`)
                        })
                        BgLevel.delete(`LevelWallpapers.${bgCode}`)
                        return message.reply(`${e.Check} | O código **bg${bgCode}** foi alterado para **bg${newbgCode}**.`)

                    } catch (err) {
                        return message.reply(`${e.Warn} | Ocorreu um erro ao editar o bgCode.\n\`\`${err}`)
                    }

                }

            }

            function EditImage() {

                if (!isUrl(NewArgs))
                    return message.reply(`${e.Deny} | O argumento **${NewArgs}** não é um link. Para ver o comando, use \`${prefix}bg\`.`)

                try {

                    for (const walls of Object.values(bg || {})) {

                        if (NewArgs === walls.Image)
                            return message.reply(`${e.Info} | Este wallpaper já foi configurado como **${walls.Name}**. Deseja trocar as imagens mesmo assim?`).then(msg => {

                                msg.react('✅').catch(() => { }) // Check
                                msg.react('❌').catch(() => { }) // X

                                const filter = (reaction, user) => { return ['✅', '❌'].includes(reaction.emoji.name) && user.id === message.author.id }

                                msg.awaitReactions({ filter, max: 1, time: 15000, errors: ['time'] }).then(collected => {
                                    const reaction = collected.first()

                                    if (reaction.emoji.name === '✅') {

                                        return EditBgImage()
                                    } else {

                                        msg.edit(`${e.Deny} | Comando cancelado.`).catch(() => { })
                                    }
                                }).catch(() => {

                                    msg.edit(`${e.Deny} | Comando cancelado por tempo expirado.`).catch(() => { })
                                })

                            }).catch(err => {
                                Error(message, err)
                                message.channel.send(`${e.SaphireCry} | Ocorreu um erro durante o processo. Por favor, reporte o ocorrido usando \`${prefix}bug\`\n\`${err}\``)
                            })
                    }

                } catch (err) {
                    return message.reply(`${e.Warn} | Houve um erro ao buscar os links de comprovação.\n\`${err}\``)
                }

                function EditBgImage() {
                    BgLevel.set(`LevelWallpapers.${bgCode}.Image`, NewArgs)
                    return message.reply(`${e.Check} | Background atualizado com sucesso!`)
                }
                return EditBgImage()
            }

            function EditPrice() {

                let NewPrice = parseInt(NewArgs)?.toFixed(0)

                if (args[4])
                    return message.reply(`${e.Deny} | Nada além do preço.`)

                if (isNaN(NewPrice))
                    return message.reply(`${e.Deny} | O preço deve ser um número. Certifique-se de que **${NewPrice}** é um número.`)

                if (BgLevel.get(`LevelWallpapers.bg${bgCode}.Price`) === NewPrice)
                    return message.reply(`${e.Info} | Este já é o preço atual deste background.`)

                BgLevel.set(`LevelWallpapers.${bgCode}.Price`, NewPrice)
                return message.reply(`${e.Check} | Preço atualizado com sucesso!`)

            }

            function EditName() {

                for (const walls of Object.values(bg || {})) {
                    if (NewArgs === walls.Name)
                        return message.reply(`${e.Info} | Este nome já existe na minha database.`)
                }

                BgLevel.set(`LevelWallpapers.${bgCode}.Name`, NewArgs)
                return message.reply(`${e.Check} | Nome atualizado com sucesso!`)

            }

            function EditDesigner() {

                let newDesignerId = args[3],
                    userCached = client.users.cache.get(newDesignerId)

                if (!newDesignerId || !userCached)
                    return message.channel.send(`${e.Deny} | Forneça um novo designer legítimo. \`${prefix}bg edit ${bgCode} designer NovoId\``)

                BgLevel.set(`LevelWallpapers.${bgCode}.Designer`, newDesignerId)
                return message.reply(`${e.Check} | ${userCached.tag} foi autenticado como designer do wallpaper ${bgCode}!`)

            }

            function EditLimit() {

                let newLimit = parseInt(args[3])

                if (isNaN(newLimit))
                    return message.channel.send(`${e.Info} | Forneça um limite númerico. \`${prefix}bg edit ${bgCode} limite <newLimit>\`. Para retirar, use \`-1\` como limite que eu desativo.`)

                if (BgLevel.get(`LevelWallpapers.${bgCode}.Limit`) === newLimit) return message.reply(`${e.Deny} | Este já é o limite atual.`)

                if (newLimit < -1) return message.reply(`${e.Deny} | Limite inválido.`)

                if (newLimit === -1) {

                    if (!BgLevel.get(`LevelWallpapers.${bgCode}.Limit`))
                        return message.reply(`${e.Deny} | Este wallpaper não tem limite para ser cancelado.`)

                    BgLevel.delete(`LevelWallpapers.${bgCode}.Limit`)
                    return message.reply(`${e.Check} | O limite do wallpaper ${bgCode} foi cancelado.`)
                }

                BgLevel.set(`LevelWallpapers.${bgCode}.Limit`, newLimit)
                return message.reply(`${e.Check} | O limite do wallpaper ${bgCode} foi configurado com **${newLimit} unidades**.`)

            }

        }

        function DelWallpaper() {

            if (message.author.id !== config.ownerId)
                return message.reply(`${e.Deny} | Este comando é válido somento para o meu criador.`)

            let bgCode = args[1]?.toLowerCase()

            if (!bgCode)
                return message.reply(`${e.Deny} | Forneça um bgCode válido`)

            if (!BgLevel.get(`LevelWallpapers.${bgCode}`))
                return message.reply(`${e.Deny} | Este wallpaper não existe no meu banco de dados.`)

            return message.reply(`Tem certeza que deseja deletar o wallpaper **${BgLevel.get(`LevelWallpapers.bg${bgCode}.Name`)}**?`).then(msg => {

                msg.react('✅').catch(() => { }) // Check
                msg.react('❌').catch(() => { }) // X

                msg.awaitReactions({
                    filter: (reaction, user) => ['✅', '❌'].includes(reaction.emoji.name) && user.id === message.author.id,
                    max: 1,
                    time: 15000,
                    errors: ['time']
                }).then(collected => {
                    const reaction = collected.first()

                    if (reaction.emoji.name === '✅') {

                        BgLevel.delete(`LevelWallpapers.bg${bgCode}`)
                        return message.reply(`${e.Check} | Wallpaper deletado com sucesso!`)

                    }

                    return msg.edit(`${e.Deny} | Comando cancelado.`).catch(() => { })

                }).catch(() => msg.edit(`${e.Deny} | Comando cancelado por tempo expirado.`).catch(() => { }))

            }).catch(err => {
                Error(message, err)
                message.channel.send(`${e.SaphireCry} | Ocorreu um erro durante o processo. Por favor, reporte o ocorrido usando \`${prefix}bug\`\n\`${err}\``)
            })

        }

        async function addWallpaperToUser() {

            if (!adms.includes(message.author.id) && message.author.id !== config.designerId)
                return message.reply(`${e.Admin} | Este é um comando privado da classe Administrador.`)

            let user = message.mentions.users.first() || message.mentions.repliedUser || client.users.cache.get(args[1]),
                bgCode = args[2]

            if (!user) return message.reply(`${e.Info} | Tenta assim: \`${prefix}bg doar <@user/id> <bgCode>\``)

            if (!args[2]) return message.reply(`${e.Deny} | Informe um bgCode para prosseguir.`)

            if (!bg[`${bgCode}`])
                return message.reply(`${e.Deny} | O bgCode informado não é válido ou não existe na minha database.`)

            let userData = await Database.User.findOne({ id: user.id }, 'Walls.Bg'),
                userBgs = userData?.Walls.Bg || []

            if (userBgs.includes(bgCode)) return message.reply(`${e.Deny} | Este usuário já possui este wallpaper`)

            Database.pushUserData(user.id, 'Walls.Bg', bgCode)
            return message.reply(`${e.Check} | O usuário **${user.tag} *\`${user.id}\`*** recebeu o wallpaper \`${bgCode}\` com sucesso!`)
        }

        async function removeWallpaperFromUser() {

            if (!adms.includes(message.author.id))
                return message.reply(`${e.Admin} | Este é um comando privado da classe Administrador.`)

            let user = message.mentions.users.first() || message.mentions.repliedUser || client.users.cache.get(args[1]),
                bgCode = args[2]

            if (!user) return message.reply(`${e.Info} | Tenta assim: \`${prefix}bg remove <@user/id>\` <bgCode>/all`)

            if (['all', 'tudo', 'todos'].includes(args[3]?.toLowerCase())) return removeAllWallpapers()

            if (!args[2]) return message.reply(`${e.Deny} | Informe um bgCode para prosseguir.`)

            if (!bg[`${bgCode}`])
                return message.reply(`${e.Deny} | O bgCode informado não é válido ou não existe na minha database.`)

            let userData = await Database.User.findOne({ id: user.id }, 'Walls.Bg'),
                userBgs = userData?.Walls.Bg || []

            if (!userBgs.includes(bgCode)) return message.reply(`${e.Deny} | Este usuário não possui este wallpaper`)

            Database.pullUserData(user.id, 'Walls.Bg', bgCode)
            return message.reply(`${e.Check} | O usuário **${user.tag} *\`${user.id}\`*** teve o wallpaper \`${bgCode}\` removido com sucesso!`)

            async function removeAllWallpapers() {
                await Database.User.updateOne(
                    { id: user.id },
                    { $unset: { Walls: 1 } }
                )
            }
        }
    }
}