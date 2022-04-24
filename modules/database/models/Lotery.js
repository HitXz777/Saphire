const { Schema, model } = require("mongoose")

module.exports = model("Lotery", new Schema({
    id: { type: String, unique: true },
    Close: Boolean,
    Prize: Number,
    Users: Array,
    LastWinner: String
}))