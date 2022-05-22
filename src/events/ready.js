const
    { DatabaseObj: { e, config } } = require('../../modules/functions/plugins/database'),
    client = require('../../index'),
    Data = require('../../modules/functions/plugins/data'),
    Database = require('../../modules/classes/Database'),
    init = require('../../modules/functions/plugins/initSystems')

client.on("ready", async () => {

    console.log('Event Ready | OK!')

    await Database.MongoConnect()

    Database.registerClient(client.user.id)
    Database.openLotery(client.user.id)
    Database.Cache.clear()

    let data = await Database.Client.findOne({ id: client.user.id }, 'Rebooting')

    await Database.Client.updateOne(
        { id: client.user.id },
        {
            $unset: {
                GameChannels: 1,
                Rebooting: 1,
                ['Raspadinhas.Channels']: 1,
                ['Zeppelin.Channels']: 1
            }
        })

    if (data?.Rebooting?.ON) {
        let channel = client.channels.cache.get(data.Rebooting?.ChannelId),
            msg = await channel?.messages.fetch(data.Rebooting.MessageId)

        if (msg)
            msg?.edit(`${e.Check} | Reboot concluído com sucesso!`).catch(() => { })
    }

    let Array2 = ['Procurando Nemo', 'Vingadores', 'Bob Esponja', 'Barbie Girl'],
        ActivityRandom = Array2[Math.floor(Math.random() * Array2.length)]

    client.user.setActivity(`${ActivityRandom}`, { type: 'WATCHING' })
    client.user.setStatus('idle')

    const msg = await client.channels.cache.get(config.LogChannelId)?.send(`⏱️ Initial Ping: \`${client.ws.ping}ms\`\n${e.Check} Login: \`${Data()}\``)

    init()
    console.log('Inicialização concluída com sucesso!')

    setTimeout(() => msg?.delete().catch(() => { }), 3000)
    return
})