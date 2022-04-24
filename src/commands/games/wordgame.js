// module.exports = {
//     name: 'wordgame',
//     aliases: ['caçapalavras', 'caçapalavra'],
//     category: 'games',
//     emoji: '<:saphire_duvida:937038402015084574>',
//     usage: '<caçapalavras',
//     description: 'Caça palavras é um jogo bem legal, não é?',

//     run: async (client, message, args, prefix, MessageEmbed, Database) => {

//         let alfabet = 'abcdefghijklmnopqrstuvwxyz', // Alfabeto
//             wordsList = Database.Frases.get('f.Mix'), // Mais de 3 mil palavras
//             words = [], // Array onde as palavras vão estar para verificar se o usuário acertou
//             control = { // Um objeto para não usar 10000 variáveis
//                 lineOne: [], // 10 Linhas do caça-palavras
//                 lineTwo: [],
//                 lineThree: [],
//                 lineFour: [],
//                 lineFive: [],
//                 lineSix: [],
//                 lineSeven: [],
//                 lineEight: [],
//                 lineNine: [],
//                 lineTen: []
//             }

//         for (let i = 0; i <= 6; i++)
//             words.push(randomWord()) // Push em 7 palavras que serão usadas no caça-palavras

//         function randomWord() { // Pega uma palavra aleatória
//             let result = wordsList[Math.floor(Math.random() * wordsList.length)]
//             if (words.includes(result)) return randomWord() // Vê se a palavra já foi sorteada para não se repetir
//             return result
//         }

//         function randomLetter() { // Pega uma letra aleatória do alfabeto para preencher os espaços vazios
//             return alfabet[Math.floor(Math.random() * alfabet.length)]
//         }

//     }
// }