function Timeout(TimeoutInMS, DateNowAtDatabase) {

    return DateNowAtDatabase !== null && TimeoutInMS - (Date.now() - DateNowAtDatabase) > 0 ? true : false

}

module.exports = Timeout