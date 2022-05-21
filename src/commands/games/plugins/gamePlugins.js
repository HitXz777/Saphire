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
async function registerGameChannel(channelId) {

    await Database.Client.updateOne(
        { id: client.user.id },
        {
            $push: { ['GameChannels.Flags']: channelId }
        }
    )
    return
}

// Flag Gaming
async function unregisterGameChannel(channelId) {

    await Database.Client.updateOne(
        { id: client.user.id },
        {
            $pull: { ['GameChannels.Flags']: channelId }
        }
    )

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

// Forca Gaming
async function registerChannelControl(pullOrPush, where, channelId) {

    if (!pullOrPush || !where || !channelId) return

    return pullOrPush === 'pull'
        ? await Database.Client.updateOne(
            { id: client.user.id },
            { $pull: { [`GameChannels.${where}`]: channelId } }
        )
        : await Database.Client.updateOne(
            { id: client.user.id },
            { $push: { [`GameChannels.${where}`]: channelId } }
        )
}

module.exports = {
    formatString,
    registerGameChannel,
    unregisterGameChannel,
    emoji,
    formatWord,
    registerChannelControl
}