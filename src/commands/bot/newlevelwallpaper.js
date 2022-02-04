const { BgLevel, DatabaseObj } = require('../../../Routes/functions/database')
const { e, config } = DatabaseObj
const Moeda = require('../../../Routes/functions/moeda')
const Error = require('../../../Routes/functions/errors')

// #246FE0 - Azul Saphire
module.exports = {
    name: 'newlevelwallpaper',
    aliases: ['setwall', 'newbg', 'bg'],
    category: 'bot',
    emoji: `${e.OwnerCrow}`,
    usage: '<setwall> <bgCode> <Price> <LinkImage> <Name>',
    description: 'Permite os administradores do Sistema de Level configurar os wallpapers',

    run: async (client, message, args, prefix, db, MessageEmbed, request) => {

        if (message.author.id !== config.ownerId) {
            if (message.author.id !== config.designerId)
                return message.reply(`${e.Deny} | Este comando é privado aos administradores do Sistema de Level.`)
        }

        let bg = BgLevel.get('LevelWallpapers')

        if (['new', 'add', 'adicionar', 'novo'].includes(args[0]?.toLowerCase())) return CheckAndSetWallpaper()
        if (['edit', 'editar'].includes(args[0]?.toLowerCase())) return EditWallpaper()
        if (['del', 'delete', 'deletar'].includes(args[0]?.toLowerCase())) return DelWallpaper()
        return message.reply(`${e.Info} | Comando disponíveis: \`new | edit | del\``)

        function CheckAndSetWallpaper() {
            let Code = parseInt(args[1])?.toFixed(0)
            let Image = args[2]
            let Price = parseInt(args[3])
            let Name = args.slice(4).join(" ")

            if (!args[1])
                return message.reply(`${e.Info} | Para adicionar algum wallpaper na database é necessário usar o comando com os seguintes parâmetros: **\`Number | ImageLink | Price | Name\`**\n\`${prefix}bg new 1 Link Price Name\` - Exemplo: \`${prefix}bg new 0 https://media.discordapp.net/attachments/899493577623756801/899852259154866276/unknown.png?width=708&height=409 1000 Fundo Padrão\`\n \nAs primeiras letras **devem** ser **maiúsculas**. O **número** do registro deve ser um número. O **nome** deve ser único. O **link** da mensagem deve ser o **link da foto da mensagem**. O **preço** deve ser justificado, justo e coerente.`)

            if (isNaN(Code))
                return message.reply(`${e.Deny} | O número de registro **${args[1]}** não é válido. Certifique-se de que isso é mesmo um número.`)

            if (BgLevel.get(`LevelWallpapers.bg${Code}`))
                return message.reply(`${e.Deny} | O código **bg${Code}** já foi registrado na database.`)

            if (!IsUrl(Image))
                return message.reply(`${e.Deny} | O link da imagem não é um link. Para ver o comando, use \`${prefix}bg\`.`)

            try {

                for (const walls of Object.values(bg)) {
                    if (Name === walls.Name)
                        return message.reply(`${e.Deny} | O nome já foi registrado na database.`)

                    if (Image === walls.Image)
                        return message.reply(`${e.Deny} | Este wallpaper já foi configurado como **${walls.Name}**.`)
                }

            } catch (err) {
                return message.reply(`${e.Warn} | Houve um erro ao buscar os links de comprovação.\n\`${err}\``)
            }

            if (isNaN(Price))
                return message.reply(`${e.Deny} | O preço deve ser um número. Certifique-se de que **(${Price})** é um número.`)

            if (!Name)
                return message.reply(`${e.Deny} | Forneça o nome do wallpaper para adição a database.`)

            return SetNewLevelWallpaper(Code, Name, Image, Price)

            function SetNewLevelWallpaper(Code, Name, Image, Price) {

                try {
                    BgLevel.set(`LevelWallpapers.bg${Code}`, { Name: Name, Image: Image, Price: Price })
                    return message.reply(`${e.Check} | O background **${Name}** foi adicionado com sucesso a database com o código de registro **\`bg${Code}\`** e preço configurado em **${Price} ${Moeda(message)}**.`)
                } catch (err) {
                    return message.channel.send(`${e.Deny} | Houve um erro ao adicionar o novo wallpaper.\n\`${err}\``)
                }
            }
        }

        function EditWallpaper() {

            if (message.author.id !== config.ownerId)
                return message.reply(`${e.Deny} | Este sub-comando é privado ao meu criador.`)

            let bgCode = args[1]
            let NewArgs = args.slice(3).join(' ')

            if (!args[1])
                return message.reply(`${e.Info} | Para alterar alguma informação na database é necessário usar o comando com os seguintes parâmetros: **\`Code | Image | Price | Name\`**\n\`${prefix}bg edit **bgCode** "Code/Image/Price/Name" Novo Argumento\` - Exemplo: \`${prefix}bg edit **bgCode** Price NovoPreço\``)

            if (!bg[`${bgCode}`])
                return message.reply(`${e.Deny} | O número de registro **${args[1]}** não é válido ou não existe na minha database.`)

            if (!NewArgs)
                return message.reply(`${e.Deny} | Forneça um novo argumento para a edição de dado do bgCode.`)

            if (['code', 'código', 'codigo'].includes(args[2]?.toLowerCase())) return EditCode()
            if (['image', 'imagem'].includes(args[2]?.toLowerCase())) return EditImage()
            if (['preço', 'price'].includes(args[2]?.toLowerCase())) return EditPrice()
            if (['name', 'nome'].includes(args[2]?.toLowerCase())) return EditName()
            return message.reply(`${e.Info} | Opções do sub-comando edit: **\`Code | Image | Price | Name\`**`)

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

                if (!IsUrl(NewArgs))
                    return message.reply(`${e.Deny} | O argumento **${NewArgs}** não é um link. Para ver o comando, use \`${prefix}bg\`.`)

                try {

                    for (const walls of Object.values(bg)) {

                        if (NewArgs === walls.Image)
                            return message.reply(`${e.Info} | Este wallpaper já foi configurado como **${walls.Name}**. Deseja trocar as imagens mesmo assim?`).then(msg => {
                                sdb.set(`Request.${message.author.id}`, `${msg.url}`)
                                msg.react('✅').catch(() => { }) // Check
                                msg.react('❌').catch(() => { }) // X

                                const filter = (reaction, user) => { return ['✅', '❌'].includes(reaction.emoji.name) && user.id === message.author.id }

                                msg.awaitReactions({ filter, max: 1, time: 15000, errors: ['time'] }).then(collected => {
                                    const reaction = collected.first()

                                    if (reaction.emoji.name === '✅') {
                                        sdb.delete(`Request.${message.author.id}`)
                                        return EditBgImage()
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

                try {

                    for (const walls of Object.values(bg)) {
                        if (NewArgs === walls.Name)
                            return message.reply(`${e.Info} | Este nome já existe na minha database.`)
                    }

                } catch (err) {
                    return message.reply(`${e.Warn} | Houve um erro ao buscar os nomes de comprovação.\n\`${err}\``)
                }

                BgLevel.set(`LevelWallpapers.${bgCode}.Name`, NewArgs)
                return message.reply(`${e.Check} | Nome atualizado com sucesso!`)

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
                sdb.set(`Request.${message.author.id}`, `${msg.url}`)
                msg.react('✅').catch(() => { }) // Check
                msg.react('❌').catch(() => { }) // X

                const filter = (reaction, user) => { return ['✅', '❌'].includes(reaction.emoji.name) && user.id === message.author.id }

                msg.awaitReactions({ filter, max: 1, time: 15000, errors: ['time'] }).then(collected => {
                    const reaction = collected.first()

                    if (reaction.emoji.name === '✅') {
                        sdb.delete(`Request.${message.author.id}`)

                        BgLevel.delete(`LevelWallpapers.bg${bgCode}`)
                        return message.reply(`${e.Check} | Wallpaper deletado com sucesso!`)

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

        function IsUrl(str) {
            let regexp = /^(?:(?:https?|ftp):\/\/)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/\S*)?$/;
            if (regexp.test(str)) { return true } else { return false }
        }

    }
}