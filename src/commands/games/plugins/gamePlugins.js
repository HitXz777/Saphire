const Database = require('../../../../modules/classes/Database'),
    client = require('../../../../index')

// Flag Gaming - Quiz Anime Theme
function formatString(string) {

    if (typeof string !== 'string') return null

    let tras = false

    if (string.includes('-')) {
        tras = true
        string = string.replace(/-/g, ' ')
    }

    let format = string.split(/ +/g),
        result = ''

    for (let word of format)
        if (word.length > 2 || word === 'el')
            if (tras)
                result += word[0].toUpperCase() + word.substring(1) + ' '
            else result += word[0].toUpperCase() + word.substring(1) + ' '
        else result += word + ' '

    if (tras) {
        result = result.replace(/ /g, '-')
        tras = false
    }

    return result.slice(0, -1)
}

// Flag Gaming
function registerGameChannel(channelId) {

    Database.Cache.push('GameChannels.Flags', channelId)

    return
}

// Flag Gaming
function emoji(i) {
    return {
        0: '🥇',
        1: '🥈',
        2: '🥉'
    }[i] || '🏅'
}

// Forca Gaming
function formatWord(word) {
    let format = ''
    for (let i of word) i === ' ' ? format += '-' : format += '_'
    return format.split('')
}

// palavamisturada.js
function formatArray(array) {

    // Solution by: Mrs_Isa♔༆#0002 - 510914249875390474

    const arrayComSubArrays = [];
    for (let i = 0; i < array.length; i++) {
        arrayComSubArrays.push([array[i], array[i + 1]]);
        array.splice(i + 1, 1);
    }

    return arrayComSubArrays.map(a => a.reduce((y, z) => `\`${y}\` ${z ? `- \`${z}\`` : ''}`)).join('\n');
}

// palavamisturada.js
function Mix(string) {
    // Solution by: Mateus Santos#4492 - 307983856135438337
    return string
        .toLowerCase()
        .split('')
        .sort(() => (0.5 - Math.random()))
        .join('')
}

// palavamisturada.js
function GetWord(Palavras) {
    return Palavras[Math.floor(Math.random() * Palavras.length)]
}

function formatNumberCaracters(number) {
    return number < 10 ? `0${number}` : `${number}`
}

module.exports = {
    formatString,
    formatArray,
    Mix,
    GetWord,
    registerGameChannel,
    formatNumberCaracters,
    emoji,
    formatWord
}