const { Database } = require('ark.db'),
    conf = new Database('../../../JSON/config.json'),
    emojis = new Database('../../../JSON/emojis.json'),
    DatabaseObj = {
        config: conf.get('config'),
        e: emojis.get('e'),
    }

module.exports = { DatabaseObj }