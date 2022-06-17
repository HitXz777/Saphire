function isHex(value) {
    if (!value) return null
    return /^#[0-9A-F]{6}$/i.test(`${value}`) 
}

module.exports = isHex