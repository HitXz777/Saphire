const { e } = require('../../../database/emojis.json')

module.exports = {
    name: 'trade',
    category: 'owner',
    emoji: 'T',
    description: 'Transferir databases',

    run: async (client, message, args, prefix, db, MessageEmbed, request, sdb) => {

        const msg = await message.reply(`${e.Loading} | Sincronizando databases...`)

        if (['xp'].includes(args[0]?.toLowerCase())) return SyncXpData()

        client.users.cache.forEach(user => {

            const
                Money = db.get(`Balance_${user.id}`) || 0,
                Bank = db.get(`Bank_${user.id}`) || 0,
                Likes = db.get(`Likes_${user.id}`) || 0,
                Xp = db.get(`Xp_${user.id}`) || 0

            db.delete(`Balance_${user.id}`)
            db.delete(`Bank_${user.id}`)
            db.delete(`Likes_${user.id}`)
            db.delete(`Xp_${user.id}`)

            if (Money !== 0)
                sdb.set(`Users.${user.id}.Balance`, Money)

            if (Bank !== 0)
                sdb.set(`Users.${user.id}.Bank`, Bank)

            if (Likes !== 0)
                sdb.set(`Users.${user.id}.Likes`, Likes)

            if (Xp !== 0)
                sdb.set(`Users.${user.id}.Xp`, Xp)

        })

        function SyncXpData() {

            client.users.cache.forEach(user => {

                const Xp = db.get(`Xp_${user.id}`) || 0
                db.delete(`Xp_${user.id}`)

                if (Xp !== 0)
                    sdb.set(`Users.${user.id}.Xp`, Xp)

            })

            return msg.edit(`${e.Check} | Sincronização de database concluida!`).catch(() => { })

        }

        return msg.edit(`${e.Check} | Sincronização de database concluida!`).catch(() => { })

    }
}