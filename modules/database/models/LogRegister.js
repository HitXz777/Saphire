const { Schema, model } = require("mongoose")

module.exports = model("LogRegister", new Schema({
    id: String,
    CommandCount: Number,
    Author: String,
    Server: String,
    Command: String,
    Time: String
}))