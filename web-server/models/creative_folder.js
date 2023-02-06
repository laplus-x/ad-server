const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CreativeFolderSchema = Schema({
    creator: { type: Schema.Types.ObjectId, ref: "Creator", required: true },
    name: { type: String, required: true },
    is_archived: { type: Boolean, default: false },
    creatives: [{
        type: Schema.Types.ObjectId,
        ref: "Creative"
    }]
}, {
    collection: "CreativeFolder",
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" }
});

exports.CreativeFolder = mongoose.model("CreativeFolder", CreativeFolderSchema);

