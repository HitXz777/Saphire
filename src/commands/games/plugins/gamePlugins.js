const Database = require('../../../../modules/classes/Database'),
    client = require('../../../../index')

// Flag Gaming
function formatString(string) {

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
        result = result.replace(/ /g, '-').slice(0, -1)
        tras = false
    }

    return result
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
async function registerChannel(status, channelId) {

    return status === 'pull'
        ? await Database.Client.updateOne(
            { id: client.user.id },
            { $pull: { ['GameChannels.Forca']: channelId } }
        )
        : await Database.Client.updateOne(
            { id: client.user.id },
            { $push: { ['GameChannels.Forca']: channelId } }
        )
}

module.exports = {
    formatString,
    registerGameChannel,
    unregisterGameChannel,
    emoji,
    formatWord,
    registerChannel
}