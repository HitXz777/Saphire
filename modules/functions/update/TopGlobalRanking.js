const client = require('../../../index'),
    Database = require('../../classes/Database')

async function TopGlobalRanking() {

    let Users = await Database.User.find({}, 'id Level Likes Balance QuizCount MixCount Jokempo.Wins TicTacToeCount CompetitiveMemoryCount ForcaCount GamingCount.FlagCount'),
        data = { LikesArray: [], balanceArray: [], XpArray: [], quizArray: [], mixArray: [], jokempoArray: [], tictactoeArray: [], memoryArray: [], forcaArray: [], flagArray: [] }

    if (!Users || Users.length === 0) return

    for (const user of Users) {

        if (!user || !user?.id) continue

        let level = user.Level || 0,
            likes = user.Likes || 0,
            balance = user.Balance || 0,
            quiz = user.QuizCount || 0,
            mix = user.MixCount || 0,
            flag = user.GamingCount.FlagCount || 0,
            jokempo = user.Jokempo?.Wins || 0,
            tictactoe = user.TicTacToeCount || 0,
            memory = user.CompetitiveMemoryCount || 0,
            forca = user.ForcaCount || 0

        if (balance > 0)
            data.balanceArray.push({ id: user.id, amount: balance })

        if (level > 0)
            data.XpArray.push({ id: user.id, amount: level })

        if (likes > 0)
            data.LikesArray.push({ id: user.id, amount: likes })

        if (quiz > 0)
            data.quizArray.push({ id: user.id, amount: quiz })

        if (mix > 0)
            data.mixArray.push({ id: user.id, amount: mix })

        if (jokempo > 0)
            data.jokempoArray.push({ id: user.id, amount: jokempo })

        if (tictactoe > 0)
            data.tictactoeArray.push({ id: user.id, amount: tictactoe })

        if (memory > 0)
            data.memoryArray.push({ id: user.id, amount: memory })

        if (forca > 0)
            data.forcaArray.push({ id: user.id, amount: forca })

        if (flag > 0)
            data.flagArray.push({ id: user.id, amount: flag })

        continue
    }

    await Database.Client.updateOne(
        { id: client.user.id },
        {
            TopGlobal: {
                Level: sortData(data.XpArray),
                Likes: sortData(data.LikesArray),
                Money: sortData(data.balanceArray),
                Quiz: sortData(data.quizArray),
                Mix: sortData(data.mixArray),
                Jokempo: sortData(data.jokempoArray),
                TicTacToe: sortData(data.tictactoeArray),
                Memory: sortData(data.memoryArray),
                Forca: sortData(data.forcaArray),
                Flag: sortData(data.flagArray),
            }
        }
    )

    return

    function sortData(array) {
        let arraySorted = array?.sort((a, b) => b.amount - a.amount) || 0
        return arraySorted[0]?.id
    }

}

module.exports = TopGlobalRanking