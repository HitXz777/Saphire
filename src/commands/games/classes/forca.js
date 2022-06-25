const { formatWord } = require('../plugins/gamePlugins')

class Forca {

    async game(client, Database, theWord, interaction, isRandom) {

        const { MessageEmbed } = require('discord.js')

        let e = Database.Emojis

        let { user, channel } = interaction

        let control = { verified: false, endedCollector: true, blocked: false, resend: 0, authorWord: 0 },
            word = isRandom ? getWord() : theWord

        if (control.blocked) return
        control.trass = formatWord(word)

        let wordFormated = control.trass.join(''),
            status = 0, msg, embed, lettersUsed = []

        if (!isRandom)
            control.authorWord = user.id

        return init()

        function getWord() {

            let words = Database.Frases.get('f.Mix'),
                word = words[Math.floor(Math.random() * words.length)].toLowerCase()

            if (!/^[a-z]+$/i.test(word)) return getWord()
            return word.split('').join('')
        }

        async function init() {

            if (control.blocked) return

            let channelsBlocked = Database.Cache.get('GameChannels.Forca') || []

            if (channelsBlocked.includes(channel.id))
                return await interaction.reply({
                    content: `${e.Deny} | Já tem uma forca rolando nesse chat.\n${e.Info} | Se a mensagem for apagada, dentro de 20 segundos esse canal será liberado.`,
                    ephemeral: true
                })

            Database.registerChannelControl('push', 'Forca', channel.id)

            embed = new MessageEmbed()
                .setColor(client.blue)
                .setTitle(`${e.duvida} Forca Game - ${status}/7`)
                .setDescription(`\`\`\`txt\n${wordFormated}\n\`\`\``)

            msg = isRandom ?
                await interaction.reply({
                    content: `${e.Info} | Essa palavra possui **${word.length} letras.**${control.authorWord === user.id ? `\n✏️ | Essa palavra foi enviada por ${user}. *(Claro, ele/a não participa dessa rodada)*` : ''}`,
                    embeds: [embed],
                    fetchReply: true
                })
                : await (async () => {
                    await interaction.reply({
                        content: `${e.Check} | Palavra escolhida: \`${word}\``,
                        ephemeral: true
                    })

                    return await interaction.channel.send({
                        content: `${e.Info} | Essa palavra possui **${word.length} letras.**${control.authorWord === user.id ? `\n✏️ | Essa palavra foi enviada por ${user}. *(Claro, ele/a não participa dessa rodada)*` : ''}`,
                        embeds: [embed],
                        fetchReply: true
                    })
                })()

            let collector = channel.createMessageCollector({
                filter: m => true,
                idle: 20000
            })
                .on('collect', async Message => {

                    if (control.authorWord === Message.author.id) return

                    let validate = /^[a-z ]+$/i,
                        content = Message.content?.toLowerCase()

                    control.resend++

                    if (!validate.test(content)) return
                    if (lettersUsed.includes(content)) return

                    if (content.length > 1) verifyWord(content)

                    if (control.verified) {

                        embed.setTitle(`${e.duvida} Forca Game - ${status}/7`)
                            .setColor(client.green)
                            .setDescription(`${Message.author} acertou a palavra!\`\`\`txt\n${wordFormated}\n\`\`\``)

                        Database.addItem(Message.author.id, 'ForcaCount', 1)
                        control.endedCollector = false
                        collector.stop()
                        msg.delete(() => { })
                        Message.reply({ content: `${e.SaphireOk} | Boa ${Message.author}. É isso aí!`, embeds: [embed] }).catch(() => { })

                        return
                    } else {

                        if (content.length === 1) {
                            validateLetter(content)
                            if (control.resend >= 7) refreshMessage()
                        }
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

                        let wordFomatedWithoutTrass = wordFormated.replace(/-/g, ' ')

                        if (wordFomatedWithoutTrass === word) {

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
            embed.setFooter({ text: `Letras usadas: ${lettersUsed.join(' ') || 'Nenhuma'}` })
            return wordFormated
        }

    }

}

module.exports = Forca