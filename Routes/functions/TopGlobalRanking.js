const client = require("../../index"),
    Database = require('../classes/Database')

async function TopGlobalRanking() {

    let Users = await Database.User.find({}, 'Level Likes Balance'),
        LikesArray = [],
        AmountArray = [],
        XpArray = []

    if (Users.length === 0)
        return

    for (const user of Users) {

        if (!user?.id) continue

        let Level = user?.Level || 0,
            likes = user?.Likes || 0,
            amount = (user?.Balance || 0)

        if (amount > 0)
            AmountArray.push({ id: user.id, amount: amount })

        if (Level > 0)
            XpArray.push({ id: user.id, amount: Level })

        if (likes > 0)
            LikesArray.push({ id: user.id, amount: likes })

        continue

    }

    let RankingLevel = XpArray.sort((a, b) => b.amount - a.amount),
        RankingLikes = LikesArray.sort((a, b) => b.amount - a.amount),
        RankingMoney = AmountArray.sort((a, b) => b.amount - a.amount)

    await Database.Client.updateOne(
        { id: client.user.id },
        {
            TopGlobalLevel: RankingLevel[0]?.id,
            TopGlobalLikes: RankingLikes[0]?.id,
            TopGlobalMoney: RankingMoney[0]?.id,
        }
    )

    return

}

module.exports = TopGlobalRanking