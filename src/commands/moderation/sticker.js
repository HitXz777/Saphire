const { e } = require('../../../JSON/emojis.json')
const IsUrl = require('../../../modules/functions/plugins/isurl')

module.exports = {
    name: 'sticker',
    aliases: ['stickers', 'figura', 'figurinha', 'figuras', 'figurinhas'],
    category: 'modearation',
    UserPermissions: ['MANAGE_EMOJIS_AND_STICKERS'],
    ClientPermissions: ['MANAGE_EMOJIS_AND_STICKERS'],
    emoji: '🖼️',
    usage: '<sticker> |messageMention| [stickerName]',
    description: 'Adicione figurinhas facilmente no servidor.',

    execute: async (client, message, args, prefix, MessageEmbed, Database) => {

        let tierGuild = message.guild.premiumTier
        if (tierGuild === 'NONE') return message.reply(`${e.Deny} | O servidor tem que estar pelo menos no nível 1 *(2 boots)* cada liberar está opção.`)

        if (['new', 'add'].includes(args[0]?.toLowerCase())) return addNewStickerByUrl()
        if (['edit', 'editar'].includes(args[0]?.toLowerCase())) return editSticker()
        if (['del', 'delete', 'remove', 'excluir'].includes(args[0]?.toLowerCase())) return deleteSticker()

        let Message = message.channel.messages.cache.get(message?.reference?.messageId) || message,
            sticker = Message?.stickers?.first() || null

        if (!sticker)
            return message.reply(`${e.Deny} | Não existe nenhum sticker na mensagem. Tenta usar o comando com algúm sticker ou mencione a mensagem com sticker.`)


        let stickerName = args[0] || sticker.name

        return message.guild.stickers.create(`https://media.discordapp.net/stickers/${sticker.id}.png`, stickerName, 'SaphireAddStickerSystem')
            .then(sticker => message.reply(`${e.Check} | O sticker foi adicionado com sucesso com o nome \`${sticker.name}\`.`))
            .catch(err => reportError(err))

        function addNewStickerByUrl() {

            let image = message?.attachments?.first(),
                url = args[1],
                stickerName = args[2]

            if (image) return addImageAsSticker()

            if (!url)
                return message.reply(`${e.Info} | Forneça a url ou a imagem para o sticker. \`${prefix}sticker new linkDoSticker.com/algumaCoisa nomeDoSticker\``)

            if (!IsUrl(url))
                return message.reply(`${e.Deny} | O link fornecido não é uma URL.`)

            if (!stickerName)
                return message.reply(`${e.Info} | Forneça um nome para o sticker. \`${prefix}sticker new linkDoSticker.com/algumaCoisa nomeDoSticker\``)

            return message.guild.stickers.create(url, stickerName, 'SaphireAddStickerSystem')
                .then(sticker => message.reply(`${e.Check} | O sticker foi adicionado com sucesso com o nome \`${sticker.name}\`.\n${sticker}`))
                .catch(err => reportError(err))

            function addImageAsSticker() {
                return message.guild.stickers.create(image.url, args[1] || image.name, 'SaphireAddStickerSystem')
                    .then(sticker => message.reply(`${e.Check} | O sticker foi adicionado com sucesso com o nome \`${sticker.name}\``))
                    .catch(err => reportError(err))
            }
        }

        function reportError(err) {
            if (err.code === 30039) // Maximum Stickers Fields
                return message.reply(`${e.Deny} | Este servidor atingiu o número máximo de figurinhas.`)

            if (err.code === 50046) // Invalid Format
                return message.reply(`${e.Deny} | O formato do arquivo não é válido ou o link fornecido não contém um arquivo legítimo.`)

            if (err.code === 50035) // 2~30 caracters name
                return message.reply(`${e.Deny} | O nome do sticker deve estar entre 2~30 caracteres.`)

            return message.reply(`${e.Warn} | Houve um erro ao adicionar o sticker.\n> \`${err}\``)
        }

        function editSticker() {

            let Message = message.channel.messages.cache.get(message?.reference?.messageId) || message,
                stickerData = Message?.stickers?.first() || null

            if (!stickerData)
                return message.reply(`${e.Deny} | Poxa... Procurei mas não achei nenhum ticket. Tentar marcar a mensagem com um sticker ou envia um junto com o comando.`)

            let sticker = message.guild.stickers.cache.get(stickerData.id)

            if (!sticker)
                return message.reply(`${e.Deny} | Este servidor não possui o sticker mencionado.`)

            let name = args[1]

            if (args[2]) return message.reply(`${e.Deny} | O nome do sticker deve ser apenas um argumento/palavra, ok?`)

            if (!name)
                return message.reply(`${e.Deny} | Você fez tudo certo, só esqueceu de falar o novo nome do Sticker`)

            return sticker.edit({ name: name })
                .then(s => message.reply(`${e.Check} | O nome do sticker foi alterado para: \`${s.name}\``))
                .catch(err => reportError(err))

        }

        function deleteSticker() {

            let Message = message.channel.messages.cache.get(message?.reference?.messageId) || message,
                stickerData = Message?.stickers?.first() || null

            if (!stickerData)
                return message.reply(`${e.Deny} | Poxa... Procurei mas não achei nenhum ticket. Tentar marcar a mensagem com um sticker ou envia um junto com o comando.`)

            let sticker = message.guild.stickers.cache.get(stickerData.id)

            if (!sticker)
                return message.reply(`${e.Deny} | Este servidor não possui o sticker mencionado.`)

            return sticker.delete(sticker)
                .then(() => message.reply(`${e.Check} | Sticker deletado com sucesso!`))
                .catch(err => reportError(err))

        }

    }
}