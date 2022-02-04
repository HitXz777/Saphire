let { e } = require("../../../database/emojis.json"),
    Moeda = require('../../../Routes/functions/moeda'),
    IsMod = require('../../../Routes/functions/ismod'),
    { Frases } = require('../../../Routes/functions/database')

module.exports = {
    name: "palavramisturada",
    aliases: ["mix", 'anagrama'],
    category: "game",
    emoji: "🔄",
    usage: "<mix> --- palavra",
    description: "Joguinho da palavra misturada",

    run: async (client, message, args, prefix, db, MessageEmbed, request, sdb) => {

        let Palavras = Frases.get('f.Mix'),
            palavra,
            mixed

        if (Palavras?.length < 1)
            return message.reply(`${e.Deny} | Nenhuma palavra no registro.`)

        if (["info", "help", "ajuda"].includes(args[0]?.toLowerCase())) return MixInfo()
        if (['list', 'lista', 'all', 'todas', 'tudo'].includes(args[0]?.toLowerCase())) return AllWords()
        if (['add', 'adicionar', 'new'].includes(args[0]?.toLowerCase())) return AddNewWord()
        if (['del', 'deletar', 'delete', 'apagar', 'excluir'].includes(args[0]?.toLowerCase())) return DeleteWord()

        return GetAndValidateWord()

        function GetAndValidateWord() {

            palavra = GetWord(Palavras)
            mixed = Mix(palavra)

            if (palavra == mixed) return GetAndValidateWord()

            return start()

        }

        async function start() {

            let msg = await message.channel.send(`${e.Loading} | Qual é a palavra? **\`${mixed}\`**`),
                control = false,
                collector = message.channel.createMessageCollector({
                    filter: m => m.content.toLowerCase() === palavra,
                    time: 20000
                })

                    .on('collect', m => {

                        control = true

                        sdb.add(`Users.${m.author.id}.Balance`, 150)

                        msg.delete().catch(() => { })
                        message.channel.send(`${e.Check} | ${m.author} acertou a palavra: **\`${mixed}\`** -> **\`${palavra}\`**\n${e.PandaProfit} | +150 ${Moeda(message)}`).catch(() => { })
                        return collector.stop()

                    })

                    .on('end', () => {

                        if (control) return

                        msg.delete().catch(() => { })
                        return message.channel.send(`${e.Deny} | Ninguém acertou a palavra: **\`${mixed}\`** -> **\`${palavra}\`**`).catch(() => { })

                    })

        }

        function MixInfo() {

            return message.reply({
                embeds: [
                    new MessageEmbed()
                        .setColor(client.blue)
                        .setTitle(`🔄 ${client.user.username} Palavras Mixed`)
                        .setDescription('Você é bom em desembaralhar palavras?')
                        .addFields(
                            {
                                name: `${e.Gear} Comando`,
                                value: `\`${prefix}mix\``
                            },
                            {
                                name: `${e.Check} Objetivo`,
                                value: 'Acertar a palavra embaralhada'
                            },
                            {
                                name: '🔍 Mix List',
                                value: `\`${prefix}mix list\``
                            },
                            { 
                                name : `${e.ModShield} Saphire's Team Moderators`,
                                value: `+ \`${prefix}mix add <palavra1, palavra2, palavra3...>\`\n- \`${prefix}mix del <palavra1, palavra2, palavra3...>\``
                            }
                        )
                ]
            })

        }

        async function AllWords() {

            // TODO: Verificar se a função está correta

            if (Palavras?.length < 1)
                return message.reply(`${e.Deny} | Nenhuma palavra no registro.`)

            let Embeds = EmbedGenerator(),
                Control = parseInt(args[1]) || 0,
                Emojis = ['⏮️', '⬅️', '➡️', '⏭️', '❌'],
                InitialEmbed = Embeds[Control] ? Embeds[Control] : (() => {
                    Control = 0
                    return Embeds[0]
                })(),
                msg = await message.channel.send({ embeds: [InitialEmbed] })

            if (Embeds.length > 1)
                for (const i of Emojis)
                    msg.react(i).catch(() => { })

            const collector = msg.createReactionCollector({
                filter: (reaction, user) => Emojis.includes(reaction.emoji.name) && user.id === message.author.id,
                idle: 60000
            })
                .on('collect', (reaction) => {

                    if (reaction.emoji.name === Emojis[4])
                        return collector.stop()

                    if (reaction.emoji.name === Emojis[0])
                        return msg.edit({ embeds: [Embeds[0]] })

                    if (reaction.emoji.name === Emojis[1]) {
                        Control--
                        return Embeds[Control] ? msg.edit({ embeds: [Embeds[Control]] }) : Control++
                    }

                    if (reaction.emoji.name === Emojis[2]) {
                        Control++
                        return Embeds[Control] ? msg.edit({ embeds: [Embeds[Control]] }) : Control--
                    }

                    if (reaction.emoji.name === Emojis[3]) {
                        Control = Embeds.length - 1
                        return Embeds[Control] ? msg.edit({ embeds: [Embeds[Control]] }) : Control = 0
                    }

                })
                .on('end', () => msg.reactions.removeAll().catch(() => { }))

            function EmbedGenerator() {

                let amount = 40,
                    Page = 1,
                    embeds = [],
                    length = Palavras.length / 40 <= 1 ? 1 : parseInt((Palavras.length / 40) + 1)

                for (let i = 0; i < Palavras.length; i += 40) {

                    let current = Palavras.slice(i, amount),
                        description = formatArray(current),
                        PageCount = length > 1 ? `- ${Page}/${length}` : ''

                    if (current.length > 0) {

                        embeds.push({
                            color: client.blue,
                            title: `🔄 Palavras do Mix${PageCount}`,
                            description: `${description || 'Nenhuma palavra encontrada'}`,
                            footer: {
                                text: `${Palavras.length} palavras contabilizados`
                            },
                        })

                        Page++
                        amount += 40

                    }

                    continue

                }

                return embeds;
            }

        }

        function AddNewWord() {

            if (!IsMod(message.author.id))
                return message.reply(`${e.Deny} | Este comando é privado aos Moderadores da Saphire's Team.`)

            if (!args[1])
                return message.reply(`${e.QuestionMark} | Diga as palavras que deseja adicionar`)

            let array = [],
                denied = [],
                reg = /^[a-záàâãéèêíïóôõöúçñ]+$/i

            for (let arg of args) {

                if (arg === args[0])
                    continue

                arg = arg.toLowerCase()

                if (Palavras.includes(arg) || arg.length < 3 || arg.length > 30 || !reg.test(arg)) {
                    denied.push(arg)
                    continue
                }

                array.push(arg)
                Frases.push('f.Mix', arg)
            }

            return message.reply(`${array.length > 0 ? `${e.Check} | Palavras adicionadas: ${array.map(a => `\`${a}\``).join(', ')}` : `${e.Info} | Nenhuma palavra foi adicionada`}\n${denied.length > 0 ? `${e.Deny} | Palavras negadas: ${denied.map(a => `\`${a}\``).join(', ')}` : `${e.Check} | Nenhuma palavra foi negada`}`)

        }

        function DeleteWord() {

            if (!IsMod(message.author.id))
                return message.reply(`${e.Deny} | Este comando é privado aos Moderadores da Saphire's Team.`)

            if (!args[1])
                return message.reply(`${e.QuestionMark} | Diga as palavras que deseja deletar`)

            let array = [],
                denied = []

            for (const arg of args) {

                if (arg === args[0])
                    continue

                if (!Palavras.includes(arg)) {
                    denied.push(arg)
                    continue
                }

                array.push(arg)
                Frases.pull('f.Mix', arg)
            }

            return message.reply(`${array.length > 0 ? `${e.Check} | Palavras removidas: ${array.map(a => `\`${a}\``).join(', ')}` : `${e.Info} | Nenhuma palavra foi removida`}\n${denied.length > 0 ? `${e.Deny} | Palavras negadas: ${denied.map(a => `\`${a}\``).join(', ')}` : `${e.Check} | Nenhuma palavra foi negada`}`)

        }

    }
}

function Mix(string) {
    // Solution by: Mateus Santos#4492 - 307983856135438337

    return string
        .toLowerCase()
        .split('')
        .sort(() => (0.5 - Math.random()))
        .join('')

}

function GetWord(Palavras) {
    return Palavras[Math.floor(Math.random() * Palavras.length)]
}

function formatArray(array) {

    // Solution by: Mrs_Isa♔༆#0002 - 510914249875390474

    const arrayComSubArrays = [];
    for (let i = 0; i < array.length; i++) {
        arrayComSubArrays.push([array[i], array[i + 1]]);
        array.splice(i + 1, 1);
    }

    return arrayComSubArrays.map(a => a.reduce((y, z) => `\`${y}\` ${z ? `- \`${z}\`` : ''}`)).join('\n');
}