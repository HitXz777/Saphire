const { Schema, model } = require("mongoose")

module.exports = model("Raffle", new Schema(
    {
        id: { type: Number, unique: true },
        MemberId: String,
        Prize: Number,
        ClientId: String,
        LastWinner: String,
        LastPrize: Number,
        AlreadyRaffle: Boolean
    }
))