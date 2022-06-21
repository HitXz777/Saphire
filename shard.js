const { ShardingManager } = require('discord.js')
const Database = require('./modules/classes/Database')
const { Emojis: e, Config: config } = Database
const client = require('./index')
const channel = client.channels.cache.get(config.LogChannelId)
require("dotenv").config()

let manager = new ShardingManager('./index.js', {
    totalShards: 'auto',
    shardList: 'auto',
    mode: 'process',
    respawn: true,
    shardArgs: [],
    execArgv: [],
    // token: process.env.DISCORD_CLIENT_BOT_TOKEN,
})
    .on('shardDisconnect', (shard) => channel?.send(`${e.Deny} | Um Shard foi desconectado.\n${e.Info} | Shard: ${shard.id} \`${Date.format()}\``))
    .on('shardError', (err, shard) => channel?.send(`${e.Warn} | Ocorreu um erro em um Shard.\n${e.Info} | Shard: ${shard.id} \`${Date.format()}\`\n-> \`${err}\``))
    .on('shardReady', (shard) => channel?.end(`${e.Check} | Shard pronto.\n${e.Info} | Shard: ${shard.id} \`${Date.format()}\``))
    .on('shardReconnecting', (shard) => channel?.send(`${e.Loading} | Shard reconectando.\n${e.Info} | Shard: ${shard.id} \`${Date.format()}\``))

manager.spawn()