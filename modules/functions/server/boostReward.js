const client = require('../../../index'),
    Database = require('../../classes/Database'),
    { config } = require('../../../JSON/config.json')

async function boostReward() {

    let guild = client.guilds.cache.get(config.guildId)

    if (!guild) return

    let membersPremium = guild.members.cache.filter(member => member.premiumSinceTimestamp !== null)

    if (membersPremium.size === 0) return

    let membersArray = []

    membersPremium.forEach(data => membersArray.push(data.user.id))

    membersArray.map(async id => {

        let data = await Database.User.findOne({ id: id }),
            user = client.users.cache.get(id)

        if (!data) Database.registerUser(user)

        return id
    })

    for (let memberId of membersArray)
        Database.add(memberId, 2)

    return
}

module.exports = boostReward