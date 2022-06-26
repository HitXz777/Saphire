module.exports = {
    name: 'calculadora',
    description: '[util] Uma simples calculadora',
    dm_permission: false,
    type: 1,
    options: [],
    async execute({ interaction: interaction, emojis: e, client: client, database: Database }) {

        if (Database.Cache.get('Calculadora')?.includes(interaction.channel.id))
            return await interaction.reply({
                content: `${e.Deny} | Calma calma. Você não pode iniciar outra calculadora nesse canal.`,
                ephemeral: true
            })
        Database.Cache.push('Calculadora', interaction.channel.id)

        try {
            let { MessageButton, MessageActionRow } = require("discord.js")

            let button = new Array([], [], [], [], [])
            let row = []
            let text = [
                "Clear",
                "(",
                ")",
                "/",
                "⌫",
                "7",
                "8",
                "9",
                "*",
                "%",
                "4",
                "5",
                "6",
                "-",
                "^",
                "1",
                "2",
                "3",
                "+",
                "π",
                ".",
                "0",
                "00",
                "=",
                "Delete"
            ]
            let current = 0

            for (let i = 0; i < text.length; i++) {
                if (button[current].length === 5) current++
                button[current].push(createButton(text[i]))
                if (i === text.length - 1) {
                    for (let btn of button) row.push(addRow(btn))
                }
            }

            const emb = {
                color: client.blue,
                title: `Calculadora da ${client.user.username}`,
                description: "```0```"
            }

            await interaction
                .reply({
                    embeds: [emb],
                    components: row
                })
                .then(async () => {
                    const msg = await interaction.fetchReply()

                    let isWrong = false
                    let time = 120000
                    let value = ""
                    let emb1 = {
                        color: client.blue,
                        title: `${client.user.username}'s Calculator`
                    }

                    function createCollector(val, result = false) {
                        const filter = (button) =>
                            button.user.id === interaction.user.id &&
                            button.customId === "cal" + val

                        let collect = msg.createMessageComponentCollector({
                            filter,
                            componentType: "BUTTON",
                            time: time
                        })

                        collect.on("collect", async (x) => {
                            if (x.user.id !== interaction.user.id) return

                            x.deferUpdate()

                            if (result === "new") value = "0"
                            else if (isWrong) {
                                value = val
                                isWrong = false
                            } else if (value === "0") value = val
                            else if (result) {
                                isWrong = true
                                value = mathEval(
                                    value
                                        .replaceAll("^", "**")
                                        .replaceAll("%", "/100")
                                        .replace(" ", "")
                                )
                            } else value += val
                            if (value.includes("⌫")) {
                                value = value.slice(0, -2)
                                if (value === "") value = " "
                                emb1.description = "```" + value + "```"
                                await msg.edit({
                                    embeds: [emb1],
                                    components: row
                                })
                            } else if (value.includes("Delete"))
                                return interaction.deleteReply().catch(() => { })
                            else if (value.includes("Clear")) return (value = "0")
                            emb1.description = "```" + value + "```"
                            await msg.edit({
                                embeds: [emb1],
                                components: row
                            })
                        })
                    }

                    for (let txt of text) {
                        let result

                        if (txt === "Clear") result = "new"
                        else if (txt === "=") result = true
                        else result = false
                        createCollector(txt, result)
                    }
                    setTimeout(async () => {
                        emb1.description = `${e.Deny} | Lá sei foi 2 minutos e a bateria da calculadora acabou.`
                        emb1.color = client.red
                        Database.Cache.pull('Calculadora', interaction.channel.id)
                        return await msg.edit({ embeds: [emb1], components: [] })
                    }, time)
                })

            function addRow(btns) {
                let row1 = new MessageActionRow()
                for (let btn of btns) {
                    row1.addComponents(btn)
                }
                return row1
            }

            function createButton(label, style = "SECONDARY") {
                if (label === "Clear") style = "DANGER"
                else if (label === "Delete") style = "DANGER"
                else if (label === "⌫") style = "DANGER"
                else if (label === "π") style = "SECONDARY"
                else if (label === "%") style = "SECONDARY"
                else if (label === "^") style = "SECONDARY"
                else if (label === ".") style = "PRIMARY"
                else if (label === "=") style = "SUCCESS"
                else if (isNaN(label)) style = "PRIMARY"
                const btn = new MessageButton()
                    .setLabel(label)
                    .setStyle(style)
                    .setCustomId("cal" + label)
                return btn
            }

            function mathEval(input) {
                try {
                    const matched = eval(input)

                    return `${matched}`
                } catch {
                    return "Entrada não reconhecida"
                }
            }
        } catch (err) {
            return await interaction.reply({
                content: `${e.Warn} | Ocorreu um erro ao gerenciar a calculadora`,
                ephemeral: true
            }).catch(async () => {
                return await interaction.followUp({
                    content: `${e.Warn} | Ocorreu um erro ao gerenciar a calculadora`,
                    ephemeral: true
                })
            })
        }

    }
}