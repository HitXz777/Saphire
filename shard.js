const { ShardingManager } = require('discord.js')
const { DatabaseObj: { e, config } } = require('./Routes/functions/database')
const client = require('./index')
const Data = require('./Routes/functions/data')
require("dotenv").config()

let manager = new ShardingManager('./index.js', {
    token: process.env.DISCORD_CLIENT_BOT_TOKEN,
    shardList: 'auto',
    totalShards: 'auto'
})

const channel = async () => { await client.channels.cache.get(config.LogChannelId) }

manager.on('shardCreate', async (shard) => {
    channel.send(`${e.Check} | Um novo Shard foi criado.\n${e.Info} | Shard: ${shard.id} \`${Data()}\``)
})

    .on('shardDisconnect', async (shard) => {
        channel.send(`${e.Deny} | Um Shard foi desconectado.\n${e.Info} | Shard: ${shard.id} \`${Data()}\``)
    })

    .on('shardError', async (err, shard) => {
        channel.send(`${e.Warn} | Ocorreu um erro em um Shard.\n${e.Info} | Shard: ${shard.id} \`${Data()}\`\n-> \`${err}\``)
    })

    .on('shardReady', async (shard) => {
        channel.end(`${e.Check} | Shard pronto.\n${e.Info} | Shard: ${shard.id} \`${Data()}\``)
    })

    .on('shardReconnecting', async (shard) => {
        channel.send(`${e.Loading} | Shard reconectando.\n${e.Info} | Shard: ${shard.id} \`${Data()}\``)
    })

manager.spawn()