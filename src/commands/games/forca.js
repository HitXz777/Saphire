module.exports = {
    name: 'forca',
    aliases: ['hangman'],
    category: 'games',
    emoji: '😵',
    usage: '<forca> <info>',
    description: 'Joguinho clássico da forca',

    run: async (client, message, args, prefix, MessageEmbed, Database) => {

        let words = Database.Frases.get('f.Mix'),
            control = { wordArray: getWord(), verified: false, endedCollector: true, resend: 0 },
            word = control.wordArray.join('')

        control.trass = formatWord(word)

        let wordFormated = control.trass.join(''),
            status = 0, msg, embed, lettersUsed = [],
            e = Database.Emojis

        return init()

        function getWord() {
            let word = words[Math.floor(Math.random() * words.length)].toLowerCase()
            if (!/^[a-z]+$/i.test(word)) return getWord()
            return word.split('')
        }

        function formatWord(word) {
            let format = ''
            for (let i of word) i === ' ' ? format += '-' : format += '_'
            return format.split('')
        }

        async function init() {

            let clientData = await Database.Client.findOne({ id: client.user.id }, 'ForcaChannels'),
                channelsBlocked = clientData.ForcaChannels || []

            if (channelsBlocked.includes(message.channel.id))
                return message.reply(`${e.Deny} | Já tem uma forca rolando nesse chat.`)
            registerChannel()

            embed = new MessageEmbed()
                .setColor(client.blue)
                .setTitle(`${e.duvida} Forca Game - ${status}/7`)
                .setDescription(`\`\`\`txt\n${wordFormated}\n\`\`\``)

            msg = await message.reply({ content: `${e.Info} | Essa palavra possui **${word.length} letras.**`, embeds: [embed] })

            let collector = message.channel.createMessageCollector({
                filter: m => true,
                idle: 20000
            })

                .on('collect', async Message => {

                    let validate = /^[a-z]+$/i,
                        content = Message.content?.toLowerCase()

                    control.resend++
                    if (control.resend >= 10) refreshMessage()

                    if (!validate.test(content)) return
                    if (lettersUsed.includes(content)) return

                    if (content.length > 1) verifyWord(content)

                    if (control.verified) {

                        embed.setTitle(`${e.duvida} Forca Game - ${status}/7`)
                            .setColor(client.green)
                            .setDescription(`${Message.author} acertou a palavra!\`\`\`txt\n${wordFormated}\n\`\`\``)
                            .setFooter(`Letras usadas: ${lettersUsed.join(' ') || 'Nenhuma'}`)

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
                                .setFooter(`Letras usadas: ${lettersUsed.join(' ') || 'Nenhuma'}`)
                            msg.delete(() => { })
                            return Message.channel.send({ content: `${e.Deny} | Forca cancelada.`, embeds: [embed] }).catch(() => { })
                        }

                        if (wordFormated === word) {

                            embed.setTitle(`${e.duvida} Forca Game - ${status}/7`)
                                .setColor(client.green)
                                .setDescription(`${Message.author} acertou a palavra!\`\`\`txt\n${wordFormated}\n\`\`\``)
                                .setFooter(`Letras usadas: ${lettersUsed.join(' ') || 'Nenhuma'}`)

                            Database.addItem(Message.author.id, 'ForcaCount', 1)
                            control.endedCollector = false
                            collector.stop()
                            msg.delete(() => { })
                            return Message.reply({ content: `${e.SaphireOk} | Boa ${Message.author}. É isso aí!`, embeds: [embed] }).catch(() => { })
                        } else {

                            embed.setTitle(`${e.duvida} Forca Game - ${status}/7`)
                                .setDescription(`\`\`\`txt\n${wordFormated}\n\`\`\``)
                                .setFooter(`Letras usadas: ${lettersUsed.join(' ') || 'Nenhuma'}`)

                            return msg.edit({ embeds: [embed] }).catch(() => { })
                        }
                    }
                })
                .on('end', () => {
                    registerChannel('pull')

                    if (control.endedCollector) {
                        embed.setTitle(`${e.duvida} Forca Game - ${status}/7`)
                            .setColor(client.red)
                            .setDescription(`Ninguém acertou a palavra **${word}**\`\`\`txt\n${wordFormated}\n\`\`\``)
                            .setFooter(`Letras usadas: ${lettersUsed.join(' ') || 'Nenhuma'}`)

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
            return msg = await message.reply({ content: `${e.Info} | Essa palavra possui **${word.length} letras.**`, embeds: [embed] })
        }

        async function registerChannel(status) {

            status === 'pull'
                ? await Database.Client.updateOne(
                    { id: client.user.id },
                    { $pull: { ForcaChannels: message.channel.id } }
                )
                : await Database.Client.updateOne(
                    { id: client.user.id },
                    { $push: { ForcaChannels: message.channel.id } }
                )
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

    }
}