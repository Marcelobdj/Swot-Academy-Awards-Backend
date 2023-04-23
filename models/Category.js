const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
    title: { type: String, required: true },
    subtitle: { type: String, required: true },
    characters: [{ type: String }],
    votes: [{ username: String, character: String, comment: String }],
    isOpen: { type: Boolean, default: true },
});

module.exports = mongoose.model("Category", categorySchema);