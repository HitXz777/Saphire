const { Schema, model } = require("mongoose")

module.exports = model("AnimesWallpapers", new Schema({
    AnimeName: String,
    Data: Array
}))