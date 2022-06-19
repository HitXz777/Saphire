const client = require('../../index')
const { config } = require('../../JSON/config.json')
const { e } = require('../../JSON/emojis.json')

client.on('shardCreate', async shard => {
    return
    let channel = client.channels.cache.get(config.LogChannelId)
    return channel.send(`${e.Check} | Um novo Shard foi criado.\n${e.Info} | Shard: ${shard.id} \`${Data()}\``)
})