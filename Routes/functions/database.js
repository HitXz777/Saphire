const
    db = require('quick.db'),
    { Database } = require("ark.db"),
    BgLevel = new Database("../../database/levelwallpapers.json"),
    BgWall = new Database("../../database/wallpaperanime.json"),
    lotery = new Database("../../database/loteria.json"),
    conf = new Database("../../database/config.json"),
    emojis = new Database("../../database/emojis.json"),
    nomes = new Database("../../database/nomes.json"),
    CommandsLog = new Database("../../database/logcommands.json"),
    ServerDb = new Database("../../ServerDatabase.json"),
    sdb = new Database("../../database.json"),
    ticket = new Database('../../database/tickets.json'),
    Transactions = new Database('../../database/transactions.json'),
    Clan = new Database('../../database/clans.json'),
    Frases = new Database('../../database/frases.json'),
    Giveaway = new Database('../../database/giveaways.json'),
    Reminders = new Database('../../database/reminders.json'),
    DatabaseObj = {
        LevelWallpapers: BgLevel.get('LevelWallpapers'),
        Wallpapers: BgWall.get('Wallpapers'),
        Loteria: lotery.get('Loteria'),
        config: conf.get('config'),
        e: emojis.get('e'),
        N: nomes.get('N'),
        db: db,
        sdb: sdb,
        f: Frases.get('f')
    }

module.exports = { sdb, db, BgLevel, BgWall, conf, emojis, nomes, lotery, CommandsLog, DatabaseObj, ServerDb, ticket, Transactions, Clan, Frases, Giveaway, Reminders }