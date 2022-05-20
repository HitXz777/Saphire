const { e } = require('../../../JSON/emojis.json')
const Notify = require('../../../modules/functions/plugins/notify')

module.exports = {
    name: 'setlevel',
    aliases: ['setlevelchannel', 'levelup', 'levelchannel', 'xpchannel'],
    category: 'config',
    UserPermissions: ['MANAGE_GUILD'],
    ClientPermissions: ['ADD_REACTIONS'],
    emoji: `${e.ModShield}`,
    usage: '<levelchannel> [on/off]',
    description: 'Escolha um canal para eu notificar todos que passam de nível',

    execute: async (client, message, args, prefix, MessageEmbed, Database) => {

        let channel = message.mentions.channels.first() || message.channel,
            guildData = await Database.Guild.findOne({ id: message.guild.id }, 'XpSystem'),
            canalDB = guildData?.XpSystem?.Canal,
            text = guildData?.XpSystem?.Mensagem || 'alcançou o level',
            CanalAtual = message.guild.channels.cache.get(canalDB)

        if (canalDB && !CanalAtual) {
            deleteLevelChannel()
            return message.reply(`${e.Deny} | O canal atual de Notificações de Level Up não foi encontrado. Eu desabilitei o Xp Channel neste servidor do meu banco de dados.`)
        }

        if (['off', 'desligar', 'desativar'].includes(args[0]?.toLowerCase())) return DisableLevelChannel()
        if (['info', 'help', 'ajuda'].includes(args[0]?.toLowerCase())) return LevelChannelInfo()
        if (['message', 'mensagem'].includes(args[0]?.toLowerCase())) return LevelChannelMessage()
        return EnableLevelChannel()

        async function DisableLevelChannel() {

            if (!CanalAtual)
                return message.reply(`${e.Deny} | Este servidor não tem um canal de Level Up definido. Use \`${prefix}levelchannel [#canal]\` para ativa-lo.`)

            let msg = await message.reply(`${e.QuestionMark} | Você deseja desativar o canal de Notificações de Level Up? Canal atual: ${CanalAtual}`),
                emojis = ['✅', '❌'],
                validate = false

            for (let i of emojis) msg.react(i).catch(() => { })

            const collector = msg.createReactionCollector({
                filter: (reaction, user) => emojis.includes(reaction.emoji.name) && user.id === message.author.id,
                time: 30000,
                errors: ['time']
            })

            collector.on('collect', (reaction) => {

                if (reaction.emoji.name === emojis[0]) {
                    deleteLevelChannel()
                    msg.edit(`${e.Check} | O canal de Notificações Level Up foi desativado.`).catch(() => { })
                    validate = true
                    Notify(message.guild.id, 'Recurso desabilitado', `<@${message.author.id}> *\`${message.author.id}\`* desativou o sistema de Notificações Level Up.`)
                }

                return collector.stop()

            })

            collector.on('end', () => {
                if (!validate) return msg.edit(`${e.Deny} | Comando cancelado.`)
                return
            })


        }

        async function EnableLevelChannel() {

            if (channel.id === canalDB) return message.reply(`${e.Info} | Este já é o canal de level up.`)

            let msg = await message.reply(`${e.QuestionMark} | Você deseja autenticar o canal ${channel} como Canal de Notificações de Level Up?`),
                emojis = ['✅', '❌'],
                validate = false

            for (let i of emojis) msg.react(i).catch(() => { })

            const collector = msg.createReactionCollector({
                filter: (reaction, user) => emojis.includes(reaction.emoji.name) && user.id === message.author.id,
                time: 30000,
                errors: ['time']
            })

            collector.on('collect', async (reaction) => {

                if (reaction.emoji.name === emojis[0]) {

                    await Database.Guild.updateOne(
                        { id: message.guild.id },
                        { 'XpSystem.Canal': channel.id }
                    )

                    validate = true
                    msg.edit(`${e.Check} | Prontinho! O canal de level up foi ativado no servidor e eu vou avisar todos que passarem de nível no canal ${channel}\n${e.Info} | Você pode mudar a mensagem padrão usando o comando \`${prefix}setlevel message <A nova mensagem de level up>\`\nMensagem padrão: "${e.Tada} | ${message.author} alcançou o level 10 ${e.RedStar}"`).catch(() => { })
                    Notify(message.guild.id, 'Recurso Ativado', `<@${message.author.id}> *\`${message.author.id}\`* ativou o sistema de Notificações Level Up. Avisarei todos que passarem de nível no canal ${channel}`)
                }

                return collector.stop()

            })

            collector.on('end', () => {

                if (!validate) return msg.edit(`${e.Deny} | Comando cancelado.`).catch(() => { })
                return
            })

        }

        async function LevelChannelMessage() {

            if (!CanalAtual) return message.reply(`${e.Info} | Para utilizar este sub-comando, é preciso que o sistema de level esteja ativado no servidor. Para ativar é simples, use o comando \`${prefix}setlevel #canal\``)

            if (['del', 'delete', 'reset', 'apagar', 'excluir'].includes(args[1]?.toLowerCase())) return delLevelMessage()

            let Mensagem = args.slice(1).join(' ')
            if (!Mensagem) return message.reply(`${e.Deny} | Você precisa fornecer a nova mensagem do level-up.`)

            if (Mensagem === text) return message.reply(`${e.Deny} | Este já é a mensagem de level atual.`)

            if (Mensagem.length > 300) return message.reply(`${e.Deny} | A mensagem de level não pode passar de 300 caracteres.`)

            for (const word of ['@everyone', '@here'])
                if (Mensagem.includes(word))
                    return message.reply(`${e.Deny} | Esta mensagem contém palavras proíbidas pelo meu sistema.`)

            await Database.Guild.updateOne(
                { id: message.guild.id },
                { 'XpSystem.Mensagem': Mensagem }
            )

            return message.reply(`${e.Check} | Mensagem salva com sucesso!\n> ${e.Tada} | ${message.author} ${Mensagem} 10 ${e.RedStar}\n${e.QuestionMark} | Não gostou da nova mensagem? Use o comando \`${prefix}setlevel message delete\``)
                
            async function delLevelMessage() {

                if (!guildData?.XpSystem?.Mensagem)
                    return message.reply(`${e.Deny} | Esse servidor não tem nenhum mensagem personalizada.`)

                await Database.Guild.updateOne(
                    { id: message.guild.id },
                    { $unset: { 'XpSystem.Mensagem': 1 } }
                )
                return message.reply(`${e.Check} | A mensagem de level do servidor foi restaurada para o padrão.`)
            }
        
        }

        async function LevelChannelInfo() {

            let user = await Database.User.findOne({ id: message.author.id }, 'Level'),
                level = user?.Level || 0

            return message.reply({
                embeds: [
                    new MessageEmbed()
                        .setColor('#246FE0')
                        .setTitle(`${e.Tada} Canal de Level Up`)
                        .setDescription('O canal de level up, pertece ao meu sistema de experiência. Sempre que um membro passar de level, eu vou avisar no canal configurado.')
                        .addFields(
                            {
                                name: `${e.Gear} Comandos`,
                                value: `\`${prefix}setlevel [#Canal]\` Ative o canal de level up\n\`${prefix}setlevel off\` Desative o canal\n\`${prefix}channel levelup\` Se quiser, eu crio e configuro o canal e deixo tudo pronto\n\`${prefix}setlevel message <Nova mensagem>\` Mude a mensagem de boas-vindas\n\`${prefix}setlevel message delete\` Reset a mensagem para o padrão`
                            },
                            {
                                name: 'Mensagem',
                                value: `${e.Tada} ${message.author} ${text} ${level} ${e.RedStar}`
                            },
                            {
                                name: 'Observações',
                                value: `O canal será desativado do meu sistema se:\nO canal for excluído.\nEu for bloqueada de enviar mensagens.\nEu for removida do servidor.`
                            }
                        )
                ]
            })
        }

        async function deleteLevelChannel() {
            await Database.Guild.updateOne(
                { id: message.guild.id },
                { $unset: { XpSystem: 1 } }
            )
            return
        }

    }
}