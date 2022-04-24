const { e } = require('../../../JSON/emojis.json'),
    glob = require("glob")

require('dotenv').config()

module.exports = {
    name: 'reboot',
    owner: true,
    aliases: ['reload', 'relogar'],
    category: 'owner',
    emoji: `${e.OwnerCrow}`,
    description: 'Permite meu criador relogar todos os comandos ou meu servidor',

    run: async (client, message, args, prefix, MessageEmbed, Database) => {

        if (['commands', 'comandos'].includes(args[0]?.toLowerCase()))
            return RebootCommands()

        return RebootSystem(args?.join(' '))

        async function RebootSystem(x) {

            const msg = await message.reply(`${e.QuestionMark} | Iniciar o reboot?`)
            if (['y', 'yes', 'sim', 's'].includes(args[0]?.toLowerCase())) return registerAndStartReboot()

            for (const emoji of ['✅', '❌']) msg.react(emoji).catch(() => { })

            return msg.createReactionCollector({
                filter: (reaction, user) => ['✅', '❌'].includes(reaction.emoji.name) && user.id === message.author.id,
                time: 30000,
                errors: ['time']
            })

                .on('collect', async (reaction) => {

                    if (reaction.emoji.name === '✅') return registerAndStartReboot()
                    return msg.edit(`${e.Deny} | Comando cancelado.`)

                })

            async function registerAndStartReboot() {

                msg?.edit(`${e.Loading} | Registrando e preparando...`).catch(() => { })

                await Database.Client.updateOne(
                    { id: client.user.id },
                    {
                        Rebooting: {
                            ON: true,
                            Features: x || 'Nenhum dado fornecido.',
                            ChannelId: message.channel.id,
                            MessageId: msg.id
                        },
                        'Lotery.Close': true
                    }
                )

                return Reboot(msg)

            }

            function Reboot(msg) {

                msg?.edit(`${e.Loading} | Reiniciando...`).catch(() => { })
                const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

                fetch(`https://discloud.app/status/bot/${client.user.id}/restart`, {
                    method: 'POST',
                    headers: {
                        "api-token": process.env.DISCLOUD_API_TOKEN
                    }
                })
                    .then(info => info.json())
                    .then(async json => {

                        if (json.status === 'error') {

                            msg.edit(`${e.Deny} | Não foi possível iniciar o reboot.\n${e.Warn} Error Message: \`${json.message}\``)

                            await Database.Client.updateOne(
                                { id: client.user.id },
                                {
                                    $unset: {
                                        Rebooting: 1,
                                        'Lotery.Close': 1
                                    }
                                }
                            )
                            return
                        }
                    })

            }

        }

        function RebootCommands() {
            client.commands.sweep(() => true)
            glob(`${__dirname}/../**/*.js`, async (err, filePaths) => {
                if (err) return
                filePaths.forEach((file) => {
                    delete require.cache[require.resolve(file)]

                    const pull = require(file)
                    if (pull.name) {
                        message.channel.send({ content: `Comando Relogado: \`${prefix}${pull.name}\`` })
                        client.commands.set(pull.name, pull)
                    }
                })
            })
        }
    }
}