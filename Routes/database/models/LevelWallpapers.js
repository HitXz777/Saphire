const { Schema, model } = require("mongoose")

module.exports = model("LevelWallpapers", new Schema({
    BgCode: String,
    Name: String,
    Image: String,
    Price: { type: Number, default: 0 }
}))