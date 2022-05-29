const { ShardingManager } = require('discord.js')
const Database = require('./modules/classes/Database')
const { Emojis: e, Config: config } = Database
const client = require('./index')
const Data = require('./modules/functions/plugins/data')
const channel = client.channels.cache.get(config.LogChannelId)
require("dotenv").config()

let manager = new ShardingManager('./index.js', {
    token: process.env.DISCORD_CLIENT_BOT_TOKEN,
    shardList: 'auto',
    totalShards: 'auto'
})
    .on('shardCreate', (shard) => channel.send(`${e.Check} | Um novo Shard foi criado.\n${e.Info} | Shard: ${shard.id} \`${Data()}\``))
    .on('shardDisconnect', (shard) => channel.send(`${e.Deny} | Um Shard foi desconectado.\n${e.Info} | Shard: ${shard.id} \`${Data()}\``))
    .on('shardError', (err, shard) => channel.send(`${e.Warn} | Ocorreu um erro em um Shard.\n${e.Info} | Shard: ${shard.id} \`${Data()}\`\n-> \`${err}\``))
    .on('shardReady', (shard) => channel.end(`${e.Check} | Shard pronto.\n${e.Info} | Shard: ${shard.id} \`${Data()}\``))
    .on('shardReconnecting', (shard) => channel.send(`${e.Loading} | Shard reconectando.\n${e.Info} | Shard: ${shard.id} \`${Data()}\``))

manager.spawn()