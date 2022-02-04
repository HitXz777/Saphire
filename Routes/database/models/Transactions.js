const { Schema, model } = require("mongoose")

module.exports = model("Transactions", new Schema({
    UserId: String,
    Data: Array
}))