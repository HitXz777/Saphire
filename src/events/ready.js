const
    { DatabaseObj: { e, config } } = require('../../modules/functions/plugins/database'),
    TopGlobalRanking = require('../../modules/functions/update/TopGlobalRanking'),
    client = require('../../index'),
    Data = require('../../modules/functions/plugins/data'),
    ReminderSystem = require('../../modules/functions/update/remindersystem'),
    GiveawaySystem = require('../../modules/functions/update/giveawaysystem'),
    Database = require('../../modules/classes/Database'),
    boostReward = require('../../modules/functions/server/boostReward'),
    RaffleSystem = require('../../modules/functions/update/rifasystem')

client.on("ready", async () => {

    await Database.MongoConnect()

    Database.registerClient(client.user.id)
    Database.openLotery(client.user.id)

    let data = await Database.Client.findOne({ id: client.user.id }, 'Rebooting')

    await Database.Client.updateOne(
        { id: client.user.id },
        {
            $unset: {
                BingoChannels: 1,
                QuizChannels: 1,
                ForcaChannels: 1,
                Rebooting: 1
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

    console.log('Event Ready | OK!')
    const msg = await client.channels.cache.get(config.LogChannelId)?.send(`⏱️ Initial Ping: \`${client.ws.ping}ms\`\n${e.Check} Login: \`${Data()}\``)

    setTimeout(() => msg.delete().catch(() => { }), 3000)
    setInterval(() => TopGlobalRanking(), 3600000)

    setInterval(() => {
        ReminderSystem()
        GiveawaySystem()
        RaffleSystem()
    }, 3000)

    setInterval(() => boostReward(), 60000)
})