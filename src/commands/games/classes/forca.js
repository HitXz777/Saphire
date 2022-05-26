const { formatWord } = require('../plugins/gamePlugins')

class Forca {

    async game(client, message, args, prefix, MessageEmbed, Database, isInteraction, author, channelId) {

        let e = Database.Emojis,
            channel = message ? message.channel : client.channels.cache.get(channelId)

        if (['info', 'help', 'ajuda'].includes(args[0]?.toLowerCase())) return forcaInfo()

        let control = { verified: false, endedCollector: true, blocked: false, resend: 0, authorWord: 0 },
            word = isInteraction || getWord()

        if (control.blocked) return
        control.trass = formatWord(word)

        let wordFormated = control.trass.join(''),
            status = 0, msg, embed, lettersUsed = []

        if (isInteraction)
            return init()

        let buttons = [
            {
                type: 1,
                components: [
                    {
                        type: 2,
                        label: 'Palavra aleatória',
                        custom_id: 'randomWord',
                        style: 'PRIMARY'
                    },
                    {
                        type: 2,
                        label: 'Dizer uma palavra',
                        custom_id: 'forcaChooseWord',
                        style: 'PRIMARY'
                    }
                ]
            }
        ]

        let Message = await message.reply({
            content: `${e.Loading} | Qual opção do game?`,
            components: buttons
        })

        return Message.createMessageComponentCollector({
            filter: int => int.user.id === message.author.id,
            time: 60000
        })
            .on('collect', interaction => {

                const { customId } = interaction

                Message.delete().catch(() => { })

                if (customId === 'randomWord') {
                    args[0] = null
                    return init()
                }

                if (customId === 'forcaChooseWord') return
            })
            .on('end', () => {
                return Message.edit({
                    content: `${e.Deny} | Comando cancelado.`,
                    components: []
                })
            })

        function getWord() {

            let words = Database.Frases.get('f.Mix'),
                word = words[Math.floor(Math.random() * words.length)].toLowerCase()

            // if (args[0]) {
            //     word = args[0]

            //     if (word.length < 3 || word.length > 15) {
            //         control.blocked = true
            //         return message.reply(`${e.Deny} | Apenas palavras entre **3~15 caracteres** são aceitas.`)
            //     }

            //     if (!/^[a-z]+$/i.test(word)) {
            //         control.blocked = true
            //         return message.reply(`${e.Deny} | Apenas palavras com caracteres de A-Z são permitidos.\n> *Acentos e caracteres não alfabéticos não são permitidos.*`)
            //     }

            //     control.authorWord = message.author.id
            //     message.delete()
            // }

            if (!/^[a-z]+$/i.test(word)) return getWord()
            return word.split('').join('')
        }

        async function init() {

            if (control.blocked) return

            let channelsBlocked = Database.Cache.get('GameChannels.Forca') || []

            if (channelsBlocked.includes(channel.id))
                return channel.send(`${e.Deny} | Já tem uma forca rolando nesse chat.\n${e.Info} | Se a mensagem for apagada, dentro de 20 segundos esse canal será liberado.`)
            Database.registerChannelControl('push', 'Forca', channel.id)

            embed = new MessageEmbed()
                .setColor(client.blue)
                .setTitle(`${e.duvida} Forca Game - ${status}/7`)
                .setDescription(`\`\`\`txt\n${wordFormated}\n\`\`\``)

            msg = await channel.send({ content: `${e.Info} | Essa palavra possui **${word.length} letras.**${control.authorWord === author.id ? `\n✏️ | Essa palavra foi enviada por ${author}. *(Claro, ele/a não participa dessa rodada)*` : ''}`, embeds: [embed] })

            let collector = channel.createMessageCollector({
                filter: m => true,
                idle: 20000
            })

                .on('collect', async Message => {

                    if (control.authorWord === Message.author.id) return

                    let validate = /^[a-z]+$/i,
                        content = Message.content?.toLowerCase()

                    control.resend++
                    if (control.resend >= 7) refreshMessage()

                    if (!validate.test(content)) return
                    if (lettersUsed.includes(content)) return

                    if (content.length > 1) verifyWord(content)

                    if (control.verified) {

                        embed.setTitle(`${e.duvida} Forca Game - ${status}/7`)
                            .setColor(client.green)
                            .setDescription(`${Message.author} acertou a palavra!\`\`\`txt\n${wordFormated}\n\`\`\``)
                            .setFooter({ text: `Letras usadas: ${lettersUsed.join(' ') || 'Nenhuma'}` })

                        Database.addItem(Message.author.id, 'ForcaCount', 1)
                        control.endedCollector = false
                        collector.stop()
                        msg.delete(() => { })
                        return Message.reply({ content: `${e.SaphireOk} | Boa ${Message.author}. É isso aí!`, embeds: [embed] }).catch(() => { })
                    } else {

                        if (content.length === 1) validateLetter(content)
                        else return

                        if (status >= 7) {
                            control.endedCollector = false
                            collector.stop()
                            embed.setTitle(`${e.duvida} Forca Game - ${status}/7`)
                                .setColor(client.red)
                                .setDescription(`Ninguém acertou a palavra **${word}**\`\`\`txt\n${wordFormated}\n\`\`\``)
                                .setFooter({ text: `Letras usadas: ${lettersUsed.join(' ') || 'Nenhuma'}` })
                            msg.delete(() => { })
                            return Message.channel.send({ content: `${e.Deny} | Forca cancelada.`, embeds: [embed] }).catch(() => { })
                        }

                        if (wordFormated === word) {

                            embed.setTitle(`${e.duvida} Forca Game - ${status}/7`)
                                .setColor(client.green)
                                .setDescription(`${Message.author} acertou a palavra!\`\`\`txt\n${wordFormated}\n\`\`\``)
                                .setFooter({ text: `Letras usadas: ${lettersUsed.join(' ') || 'Nenhuma'}` })

                            Database.addItem(Message.author.id, 'ForcaCount', 1)
                            control.endedCollector = false
                            collector.stop()
                            msg.delete(() => { })
                            return Message.reply({ content: `${e.SaphireOk} | Boa ${Message.author}. É isso aí!`, embeds: [embed] }).catch(() => { })
                        } else {

                            embed.setTitle(`${e.duvida} Forca Game - ${status}/7`)
                                .setDescription(`\`\`\`txt\n${wordFormated}\n\`\`\``)
                                .setFooter({ text: `Letras usadas: ${lettersUsed.join(' ') || 'Nenhuma'}` })

                            return msg.edit({ embeds: [embed] }).catch(() => { })
                        }
                    }
                })
                .on('end', () => {
                    Database.registerChannelControl('pull', 'Forca', channel.id)

                    if (control.endedCollector) {
                        embed.setTitle(`${e.duvida} Forca Game - ${status}/7`)
                            .setColor(client.red)
                            .setDescription(`Ninguém acertou a palavra **${word}**\`\`\`txt\n${wordFormated}\n\`\`\``)
                            .setFooter({ text: `Letras usadas: ${lettersUsed.join(' ') || 'Nenhuma'}` })

                        return msg.edit({ embeds: [embed] }).catch(() => { })
                    }
                    return
                })

            function verifyWord(fullWord) {
                if (fullWord === word) {
                    wordFormated = word
                    control.verified = true
                }
                return
            }
        }

        async function refreshMessage() {
            control.resend = 0
            msg.delete().catch(() => { })
            return msg = await channel.send({ content: `${e.Info} | Essa palavra possui **${word.length} letras.**`, embeds: [embed] })
        }

        function validateLetter(letter) {

            lettersUsed.push(letter)
            let count = 0

            for (let i in word)
                if (word[i] === letter) {
                    control.trass[i] = letter
                    count++
                }

            if (count === 0) status++

            wordFormated = control.trass.join('')
            return wordFormated
        }

        function forcaInfo() {
            return message.reply({
                embeds: [
                    new MessageEmbed()
                        .setColor(client.blue)
                        .setTitle(`${e.duvida} Forca Game Info`)
                        .addFields(
                            {
                                name: `${e.QuestionMark} Como mandar uma palavra?`,
                                value: `Você pode começar um jogo com qualquer palavra utilizando \`${prefix}forca SuaPalavra\`\n> *Lembrando: Palavras com acentos e caracteres não alfabéticos não são aceitos aqui. Apenas letras de A~Z*`
                            },
                            {
                                name: `${e.Check} Comece um jogo`,
                                value: `Use apenas \`${prefix}forca\``
                            },
                            {
                                name: `${e.Info} Informações`,
                                value: `Fale apenas uma letra por vez para sua letra ser validada. As regras são as mesma do jogo da forca que todos conhecem.\nApenas 1 jogo por canal é válido.`
                            }
                        )
                ]
            })
        }

    }

}

module.exports = Forca