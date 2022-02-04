const { e } = require('../../../database/emojis.json');
const { N } = require('../../../database/nomes.json');
const { f } = require('../../../database/frases.json')
const Error = require('../../../Routes/functions/errors')

module.exports = {
    name: 'ind',
    aliases: ['indicaanime'],
    category: 'animes',
    ClientPermissions: ['ADD_REACTIONS'],
    emoji: '💬',
    usage: '<ind>',
    description: `Indicações de Animes | Animes por: ${N.Gowther}`,

    run: async (client, message, args, prefix, db, MessageEmbed, request, sdb) => {

        if (request) return message.reply(`${e.Deny} | ${f.Request}${sdb.get(`Request.${message.author.id}`)}`)

        let i = 'Isekai'
        let h = 'Hentai'
        let ms = 'Mahou Shoujo'
        let y = 'Yuri'
        let fa = 'Fantasia'
        let r = 'RPG'
        let c = 'Comédia'
        let sn = 'Sobre Natural'
        let es = 'Esporte'
        let j = 'Jogo'
        let a = 'Aventura'
        let aç = 'Ação'
        let am = 'Ação/Militar'
        let p = 'Psicológico'
        let d = 'Drama'
        let sv = 'Simulador de Vida'
        let mi = 'Mistério'
        let ve = 'Vida Escolar'
        let vc = 'Vida Cotidiana'
        let dm = 'Demônio'
        let vg = 'Vários Gêneros'
        let rm = 'Românce'
        let hr = 'Harém'
        let m = 'Musical'
        let ma = 'Magia'
        let ec = 'Ecchi'
        let cr = 'Comédia Romântica'
        let s = 'Suspense'

        let list = [
            `100man no Inochi no Ue ni Ore wa Tatteiru \n**Gênero:** ${fa}`,
            `Adachi to Shimamura \n**Gênero:** ${y}`,
            `Akudama Drive \n**Gênero:** ${s}`,
            `Assault Lily: Bouquet \n**Gênero:** ${ms}`,
            `BURN THE WITCH \n**Gênero:** ${fa}`,
            `D4DJ: First Mix \n**Gênero:** ${m}`,
            `Dragon Quest: Dai no Daibouken \n**Gênero:** ${j}`,
            `Gochuumon wa Usagi Desu ka? Bloom \n**Gênero:** ${c}`,
            `Guraburu! \n**Gênero:** ${r}`,
            `Himitsukessha Taka no Tsume, \n**Gênero:** ${c}`,
            `Hypnosis Mic \n**Gênero:** ${m}`,
            `Ikebukuro West Gate Park \n**Gênero:** ${m}`,
            `Inu to Neko \n**Gênero:** ${c}`,
            `Iwa Kakeru!: Sport Climbing Girls \n**Gênero:** ${es}`,
            `Jujutsu Kaisen \n**Gênero:** ${s}`,
            `Kami-tachi ni Hirowareta Otoko \n**Gênero:** ${a}`,
            `Kamisama ni Natta Hi \n**Gênero:** ${d}`,
            `Kimi to Boku no Saigo no Senju \n**Gênero:** ${rm}`,
            `Kings Raid \n**Gênero:** ${j}`,
            `Kuma Kuma Kuma Bear \n**Gênero:** ${c}`,
            `Maesetsu! \n**Gênero:** ${c}`,
            `Magatsu Wahrheit \n**Gênero:** ${aç}`,
            `Majo no Tabitabi \n**Gênero:** ${fa}`,
            `Maoujou de Oyasumi \n**Gênero:** ${c}`,
            `Munou na Nana \n**Gênero:** ${p}`,
            `Noblesse \n**Gênero:** ${ve}`,
            `Ochikobore Fruit Tart \n**Gênero:** ${m}`,
            `Rail Romanesque \n**Gênero:** ${hr}`,
            `Senyoku no Sigrdrifa \n**Gênero:** ${am}`,
            `Taisou Zamurai \n**Gênero:** ${es}`,
            `Tonikaku Kawaii \n**Gênero:** ${rm}`,
            `Yuukoku no Moriarty \n**Gênero:** ${mi}`,
            `A3!Season Autumn & Winter \n**Gênero:** ${sv}`,
            `Dungeon Ni Deai \n**Gênero:** ${fa}`,
            `Golden Kamuy \n**Gênero:** ${c}`,
            `Haikyuu! \n**Gênero:** ${es}`,
            `Hanyou no Yashahime \n**Gênero:** ${fa}`,
            `Love Live \n**Gênero:** ${m}`,
            `Mahouka Koukou no Rettousei \n**Gênero:** ${ma}`,
            `One Room \n**Gênero:** ${vc}`,
            `Osamatsu-san \n**Gênero:** ${c}`,
            `Strike Witches \n**Gênero:** ${am}`,
            `Fate/Grand Order \n**Gênero:** ${fa}`,
            `Kimetsu no Yaiba \n**Gênero:** ${dm}`,
            `Naruto Classico/Shippuden \n**Gênero:** ${vg}`,
            `Konosuba \n**Gênero:** ${c}`,
            `Sword Art Online \n**Gênero:** ${aç}, ${fa}, ${i}`,
            `.hack//Liminality \n**Gênero:** ${j}`,
            `.hack//Quantum \n**Gênero:** ${j}`,
            `.hack//ROOTS \n**Gênero:** ${j}`,
            `.hack//sign \n**Gênero:** ${j}`,
            `.hack//Tasogare no Udewa Densetsu \n**Gênero:** ${j}`,
            `009-1 \n**Gênero:** ${aç}`,
            `07 Ghost \n**Gênero:** ${aç}`,
            `1+2=Paradise \n**Gênero:** ${c}`,
            `11 Eyes \n**Gênero:** ${aç}`,
            `12 Sai Chicchana Mune No Tokimeki \n**Gênero:** ${rm}`,
            `18if \n**Gênero:** ${mi}`,
            `2×2 Shinobuden \n**Gênero:** ${c}`,
            `3-gatsu no Lion \n**Gênero:** ${vc}`,
            `30-Sai No Hoken Taiiku \n**Gênero:** ${ec}`,
            `3D Kanojo: Real Girl \n**Gênero:** ${r}`,
            `801 T.T.S. Airbats \n**Gênero:** ${aç}`,
            `91 Days \n**Gênero:** ${aç}`,
            `AKB0048 \n**Gênero:** ${m}`,
            `A Channel \n**Gênero:** ${c}`,
            `Abarenbou Kishi!! Matsutarou \n**Gênero:** ${es}`,
            `Abenobashi Mahou Shoutengai \n**Gênero:** ${c}`,
            `Absolute Duo \n**Gênero:** ${rm}`,
            `ACCA: 13-ku Kansatsu-ka \n**Gênero:** ${mi}`,
            `Accel World \nDo criador de SAO \n**Gênero:** ${j}`,
            `Acchi Kocchi \n**Gênero:** ${c}`,
            `Action Heroine Cheer Fruits \n**Gênero:** ${c}`,
            `Active Raid: Kidou Kyoushuushitsu Dai Hakkei \n**Gênero:** ${c}`,
            `Aeon flux \n**Gênero:** ${aç}`,
            `Afro Samurai \n**Gênero:** ${aç}`,
            `Agatha Christie No Meitantei Poirot To Marple \n**Gênero:** ${mi}`,
            `Agent Aika \n**Gênero:** ${aç}`,
            `Ah! Megami Sama! \n**Gênero:** ${c}`,
            `Ah! Megami sama Chicchaitte Kotoha Benridane \n**Gênero:** ${rm}`,
            `Aho Girl \n**Gênero:** ${c}`,
            `Ai Mai Mi \n**Gênero:** ${vc}`,
            `Ai Tenchi Muyo! \n**Gênero:** ${c}`,
            `Ai Yori Aoshi \n**Gênero:** ${c}`,
            `Aika Zero \n**Gênero:** ${ec}`,
            `Aikatsu! \n**Gênero:** ${m}`,
            `Air Gear \n**Gênero:** ${aç}`,
            `Air Master \n**Gênero:** ${aç}`,
            `Air Tv \n**Gênero:** ${rm}`,
            `Aishiteruze Baby \n**Gênero:** ${rm}`,
            `Aiura \n**Gênero:** ${vc}`,
            `Ajin \n**Gênero:** ${mi}`,
            `Akagami No Shirayuki-hime \n**Gênero:** ${rm}`,
            `Akagi \n**Gênero:** ${j}`,
            `Akahori Gedou Hour Rabuge \n**Gênero:** ${c}`,
            `Akai Koudan Zillion \n**Gênero:** ${aç}`,
            `Akame Ga Kill \n**Gênero:** ${aç}`,
            `Akaneiro Ni Somaru Saka \n**Gênero:** ${rm}`,
            `Akanesasu Shoujo \n**Gênero:** ${aç}`,
            `Akatsuki No Yona \n**Gênero:** ${aç}`,
            `Aki Sora \n**Gênero:** ${ec}`,
            `Akibas Trip The Animation \n**Gênero:** ${aç}`,
            `Akikan \n**Gênero:** ${ec}`,
            `Akkun to Kanojo \n**Gênero:** ${rm}`,
            `Aku No Hana \n**Gênero:** ${p}`,
            `Akuma No Riddle \n**Gênero:** ${aç}`,
            `Aldnoah.Zero \n**Gênero:** ${aç}`,
            `Alexander Senki \n**Gênero:** ${fa}`,
            `Alice Or Alice: Siscon Niisan To Futago No Imouto \n**Gênero:** ${vc}`,
            `Alice To Zouroku \n**Gênero:** ${mi}`,
            `Alien 9 \n**Gênero:** ${p}`,
            `All Out!! \n**Gênero:** ${es}`,
            `Allison To Lillia \n**Gênero:** ${aç}`,
            `Amaama to Inazuma \n**Gênero:** ${vc}`,
            `Amaenaideyo!! \n**Gênero:** ${rm}`,
            `Amagami SS \n**Gênero:** ${rm}`,
            `Amagi Brilliant Park \n**Gênero:** ${c}`,
            `Amanchu! \n**Gênero:** ${vc}`,
            `Amatsuki \n**Gênero:** ${aç}`,
            `Ame-iro Cocoa \n**Gênero:** ${vc}`,
            `Amnesia \n**Gênero:** ${fa}`,
            `Ange Vierge \n**Gênero:** ${fa}`,
            `Angel Beats! \n**Gênero:** ${d}`,
            `Angel Links \n**Gênero:** ${d}`,
            `Angel Sanctuary \n**Gênero:** ${d}`,
            `Angelic Layer \n**Gênero:** ${d}`,
            `Angolmois: Genkou Kassenki \n**Gênero:** ${aç}`,
            `Anima Yell! \n**Gênero:** ${c}`,
            `Animatrix \n**Gênero:** ${d}`,
            `Animegataris \n**Gênero:** ${c}`,
            `Anitore! EX \n**Gênero:** ${c}`,
            `Anne Happy \n**Gênero:** ${vc}`,
            `Ano Hana \n**Gênero:** ${d}`,
            `Ano Natsu De Matteru \n**Gênero:** ${rm}`,
            `Another \n**Gênero:** ${mi}`,
            `Ansatsu Kyoushitsu \n**Gênero:** ${c}`,
            `Antique Bakery \n**Gênero:** ${c}`,
            `Ao Haru Ride \n**Gênero:** ${rm}`,
            `Ao No Exorcist \n**Gênero:** ${dm}`,
            `Ao No Kanata No Four Rhythm \n**Gênero:** ${d}`,
            `Ao Oni The Animation \n**Gênero:** ${c}`,
            `Aoharu X Kikanjuu \n**Gênero:** ${aç}`,
            `Aoi Bungaku Series \n**Gênero:** ${d}`,
            `Aoi Hana \n**Gênero:** ${y}`,
            `Aoi Sekai No Chuushin De \n**Gênero:** ${fa}`,
            `Aoki Hagane No Arpeggio: Ars Nova \n**Gênero:** ${aç}`,
            `Appare-Ranman! \n**Gênero:** ${c}`,
            `Aquarian Age \n**Gênero:** ${fa}`,
            `Aquarion Evol \n**Gênero:** ${fa}`,
            `Aquarion Logos \n**Gênero:** ${fa}`,
            `Arakawa Under The Bridge \n**Gênero:** ${rm}`,
            `Arata Kangatari \n**Gênero:** ${fa}`,
            `Arc The Lad \n**Gênero:** ${aç}`,
            `Arcana Famiglia \n**Gênero:** ${aç}`,
            `Area 88 (anime) \n**Gênero:** ${aç}`,
            `Area No Kishi \n**Gênero:** ${es}`,
            `Argento Soma \n**Gênero:** ${d}`,
            `Aria The Animation \n**Gênero:** ${fa}`,
            `Arte \n**Gênero:** ${d}`,
            `Arslan Senki \n**Gênero:** ${aç}`,
            `Aru Zombie Shoujo No Sainan \n**Gênero:** ${aç}`,
            `Asagiri No Miko \n**Gênero:** ${fa}`,
            `Asatte No Houkou \n**Gênero:** ${d}`,
            `Ashita No Joe \n**Gênero:** ${es}`,
            `Ashita No Nadja \n**Gênero:** ${d}`,
            `Asobi Asobase \n**Gênero:** ${c}`,
            `Asobi Ni Iku Yo \n**Gênero:** ${ec}`,
            `Astarotte No Omocha \n**Gênero:** ${c}`,
            `Asu No Yoichi \n**Gênero:** ${c}`,
            `Asura Cryin \n**Gênero:** ${aç}`,
            `Atelier Escha & Logy: Alchemists Of The Dusk Sky \n**Gênero:** ${fa}`,
            `Atom: The Beginning \n**Gênero:** ${aç}`,
            `Avatar A Lenda De Aang \n**Gênero:** ${fa}`,
            `Avatar A Lenda De Korra \n**Gênero:** ${fa}`,
            `Avenger \n**Gênero:** ${a}`,
            `Ayakashi \n**Gênero:** ${aç}`,
            `Ayakashi – Japanese Classic Horror \n**Gênero:** ${a}`,
            `Ayashi No Ceres \n**Gênero:** ${d}`,
            `Azumanga Daioh \n**Gênero:** ${c}`,
            `B Gata H Kei \n**Gênero:** ${cr}`,
            `B-Project \n**Gênero:** ${m}`,
            `B: The Beginning \n**Gênero:** ${mi}`,
            `Babel II: Beyond Infinity \n**Gênero:** ${aç}`,
            `Baby Princess 3D Paradise Love \n**Gênero:** ${ec}`,
            `Baby Steps \n**Gênero:** ${es}`,
            `Baccano \n**Gênero:** ${mi}`,
            `Back Street Girls \n**Gênero:** ${c}`,
            `Baka To Test To Shoukanjuu \n**Gênero:** ${c}`,
            `Bakemonogatari \n**Gênero:** ${d}`,
            `Baki The Grappler \n**Gênero:** ${es}`,
            `Bakugan \n**Gênero:** ${fa}`,
            `Bakuman \n**Gênero:** ${cr}`,
            `Bakumatsu \n**Gênero:** ${aç}`,
            `Bakumatsu Gijinden Roman \n**Gênero:** ${fa}`,
            `Bakumatsu Rock \n**Gênero:** ${m}`,
            `Bakumatsu: Crisis \n**Gênero:** ${aç}`,
            `Bakuon!! \n**Gênero:** ${c}`,
            `Bakuretsu Hunters \n**Gênero:** ${c}`,
            `Bakuretsu Tenshi: Burst Angel \n**Gênero:** ${aç}`,
            `Ballroom E Youkoso \n**Gênero:** ${es}`,
            `Bamboo Blade \n**Gênero:** ${c}`,
            `Banana Fish \n**Gênero:** ${mi}`,
            `Bananya \n**Gênero:** ${vc}`,
            `Bang Dream! \n**Gênero:** ${m}`,
            `Banner Of The Stars \n**Gênero:** ${r}`,
            `Bannou Bunka Neko-Musume \n**Gênero:** ${c}`,
            `Barakamon \n**Gênero:** ${d}`,
            `Barom One \n**Gênero:** ${aç}`,
            `Basilisk \n**Gênero:** ${aç}`,
            `Basquash! \n**Gênero:** ${ec}`,
            `Bastard \n**Gênero:** ${aç}`,
            `Battery \n**Gênero:** ${es}`,
            `Battle Girl High School \n**Gênero:** ${cr}`,
            `Battle Programmer Shirase \n**Gênero:** ${c}`,
            `Battle Spirits: Burning Soul \n**Gênero:** ${j}`,
            `Beast Fighter: The Apocalypse \n**Gênero:** ${fa}`,
            `Beast Saga \n**Gênero:** ${aç}`,
            `Beatless \n**Gênero:** ${r}`,
            `Beck \n**Gênero:** ${m}`,
            `Beelzebub \n**Gênero:** ${aç}`,
            `Beelzebub-jou No Okinimesu Mama. \n**Gênero:** ${r}`,
            `Ben-To \n**Gênero:** ${c}`,
            `Bermuda Triangle: Colorful Pastrale \n**Gênero:** ${m}`,
            `Bernard-jou Iwaku. \n**Gênero:** ${c}`,
            `Berserk \n**Gênero:** ${aç}`,
            `Beyblade \n**Gênero:** ${aç}`,
            `Big Order \n**Gênero:** ${aç}`,
            `Bihada Ichizoku \n**Gênero:** ${d}`,
            `Bikini Warriors \n**Gênero:** ${fa}`,
            `Binan Koukou Chikyuu Bouei Bu Love \n**Gênero:** ${c}`,
            `Binbougami Ga! \n**Gênero:** ${c}`,
            `Binbou Shimai Monogatari \n**Gênero:** ${c}`,
            `Binchou-tan \n**Gênero:** ${c}`,
            `Binzume Yousei \n**Gênero:** ${c}`,
            `Bishoujo Senshi Sailor Moon Crystal \n**Gênero:** ${r}`,
            `Bishoujo Yuugi Unit Crane Game Girls \n**Gênero:** ${c}`,
            `Black And White Warriors \n**Gênero:** ${fa}`,
            `Black Blood Brothers \n**Gênero:** ${c}`,
            `Black Bullet \n**Gênero:** ${m}`,
            `Black Cat \n**Gênero:** ${c}`,
            `Black Clover \n**Gênero:** ${fa}`,
            `Black Jack \n**Gênero:** ${d}`,
            `Black Lagoon \n**Gênero:** ${aç}`,
            `Black Rock Shooter \n**Gênero:** ${aç}`,
            `Blade (ANIME) \n**Gênero:** ${aç}`,
            `Blade e Soul \n**Gênero:** ${aç}`,
            `Blade Of The Immortal \n**Gênero:** ${aç}`,
            `Blassreiter \n**Gênero:** ${aç}`,
            `BlazBlue: Alter Memory \n**Gênero:** ${fa}`,
            `Bleach \n**Gênero:** ${aç}`,
            `Blend S \n**Gênero:** ${c}`,
            `Blood Lad \n**Gênero:** ${c}`,
            `Blood-C \n**Gênero:** ${p}`,
            `Blood+ \n**Gênero:** ${aç}`,
            `Bloodivores \n**Gênero:** ${fa}`,
            `Blue Dragon \n**Gênero:** ${fa}`,
            `Blue Dragon: Tenkai No Shichi Ryuu \n**Gênero:** ${fa}`,
            `Blue Drop \n**Gênero:** ${d}`,
            `Blue Gender \n**Gênero:** ${r}`,
            `Blue Seed \n**Gênero:** ${c}`,
            `Boku Dake Ga Inai Machi \n**Gênero:** ${mi}`,
            `Boku no Hero Academia \n**Gênero:** ${aç}`,
            `Boku No Imouto Wa “Osaka Okan” \n**Gênero:** ${c}`,
            `Boku No Kanojo Ga Majimesugiru Sho-bitch Na Ken \n**Gênero:** ${c}`,
            `Boku Wa Tomodachi Ga Sukunai \n**Gênero:** ${c}`,
            `Bokura Ga Ita \n**Gênero:** ${d}`,
            `Bokura Wa Minna Kawaisou \n**Gênero:** ${r}`,
            `Bokurano \n**Gênero:** ${d}`,
            `Bokusatsu Tenshi Dokuro-chan \n**Gênero:** ${c}`,
            `Bokutachi Wa Benkyou Ga Dekinai \n**Gênero:** ${c}`,
            `Bonjour Sweet Love Patisserie \n**Gênero:** ${r}`,
            `Boogiepop Phantom \n**Gênero:** ${s}`,
            `Boogiepop Wa Warawanai 2019 \n**Gênero:** ${p}`,
            `Boruto: Naruto Next Generations \n**Gênero:** ${aç}`,
            `Bottle Fairy \n**Gênero:** ${c}`,
            `Bouken Ou Beet \n**Gênero:** ${fa}`,
            `Bounen No Xamdou \n**Gênero:** ${aç}`,
            `Boys Be \n**Gênero:** ${r}`,
            `Brave 10 \n**Gênero:** ${aç}`,
            `Brave Beats \n**Gênero:** ${m}`,
            `Brave Story \n**Gênero:** ${fa}`,
            `Brave Witches \n**Gênero:** ${aç}`,
            `Break Blade (TV) \n**Gênero:** ${aç}`,
            `Brotherhood: Final Fantasy XV \n**Gênero:** ${aç}`,
            `Brothers Conflict \n**Gênero:** ${r}`,
            `Btooom \n**Gênero:** ${aç}`,
            `Btx \n**Gênero:** ${a}`,
            `Btx Neo \n**Gênero:** ${aç}`,
            `Bubblegum Crisis Tokyo 2040 \n**Gênero:** ${a}`,
            `Bubuki Buranki \n**Gênero:** ${d}`,
            `Bucky \n**Gênero:** ${c}`,
            `Buddy Complex \n**Gênero:** ${aç}`,
            `Bungaku Shoujo: Memoire \n**Gênero:** ${r}`,
            `Bungou Stray Dogs \n**Gênero:** ${mi}`,
            `Bungou To Alchemist: Shinpan No Haguruma \n**Gênero:** ${fa}`,
            `Burn-Up Scramble \n**Gênero:** ${c}`,
            `Burn-Up Warrior \n**Gênero:** ${c}`,
            `Burst Angel \n**Gênero:** ${c}`,
            `Bus Gamer \n**Gênero:** ${aç}`,
            `Busou Renkin \n**Gênero:** ${aç}`,
            `Busou Shinki \n**Gênero:** ${aç}`,
            `Busou Shoujo Machiavellianism \n**Gênero:** ${ec}`,
            `Butlers: Chitose Momotose Monogatari \n**Gênero:** ${c}`,
            `Boku no Piko \n**Gênero:** kkk é top, confia no pai`
        ]

        const IndEmbed = new MessageEmbed()
            .setColor('#246FE0')
            .setTitle(`:tv: ${client.user.username} Indica: Animes`)
            .setDescription('Receba indicações clicando nos emojis a baixo.')

        return message.reply({ embeds: [IndEmbed] }).then(msg => {
            sdb.set(`Request.${message.author.id}`, `${msg.url}`)
            msg.react('🔄').catch(() => { }) // Trocar
            msg.react('📨').catch(() => { }) // Carta
            msg.react('❌').catch(() => { }) // Cancel

            let TradeFilter = (reaction, user) => { return reaction.emoji.name === '🔄' && user.id === message.author.id }
            let TradeCollector = msg.createReactionCollector({ filter: TradeFilter, max: 15, time: 30000, errors: ['time', 'max'] })

            let SendFilter = (reaction, user) => { return reaction.emoji.name === '📨' && user.id === user.id }
            let SendCollector = msg.createReactionCollector({ filter: SendFilter, time: 30000, errors: ['time'] })

            let CancelFilter = (reaction, user) => { return reaction.emoji.name === '❌' && user.id === message.author.id }
            let CancelCollector = msg.createReactionCollector({ filter: CancelFilter, max: 1, time: 30000, errors: ['max', 'time'] })

            let i = 0
            TradeCollector.on('collect', (reaction, user) => {
                if (user.id === client.user.id) return
                reaction.users.remove(user.id).catch(() => { })
                i++
                IndEmbed.addField('---------', `**Nome:** ${list[Math.floor(Math.random() * list.length)]}`)
                msg.edit({ embeds: [IndEmbed] }).catch(() => { })
            })

            SendCollector.on('collect', (reaction, user) => {
                if (user.id === client.user.id) return
                reaction.users.remove(user.id).catch(() => { })
                i++
                user.send({ embeds: [IndEmbed.setDescription(`From: ${message.guild.name}`)] }).then(() => {
                    return message.channel.send(`${e.Check} | Envio concluido, ${user}!`)
                }).catch(err => {
                    if (err.code === 50007)
                        return message.channel.send(`${e.Deny} | Seu privado está bloqueado, ${user}. Verifique suas configurações e tente novamente`)

                    Error(message, err)
                })
            })

            CancelCollector.on('collect', (reaction, user) => {
                sdb.delete(`Request.${message.author.id}`)
                msg.reactions.removeAll().catch(() => { })
                IndEmbed.setColor('RED').setTitle(`${e.Deny} ${client.user.username} Indica: Animes`).setFooter(`Sessão Cancelada | ${i} Indicações solicitadas.`)
                msg.edit({ embeds: [IndEmbed] }).catch(() => { })
            })

            CancelCollector.on('end', (reaction, user) => {
                sdb.delete(`Request.${message.author.id}`)
                msg.reactions.removeAll().catch(() => { })
                IndEmbed.setColor('RED').setTitle(`${e.Deny} ${client.user.username} Indica: Animes`).setFooter(`Sessão Cancelada | ${i} Indicações solicitadas.`)
                msg.edit({ embeds: [IndEmbed] }).catch(() => { })
            })

        }).catch(err => {
            Error(message, err)
            sdb.delete(`Request.${message.author.id}`)
            return message.reply(`${e.Warn} | Houve um erro ao executar este comando\n\`${err}\``)
        })
    }
}