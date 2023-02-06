const mongoose = require('mongoose')
const Schema = mongoose.Schema

const CreatorSchema = Schema({
    creator_id: { type: String, unique: true, required: true },
    user: { type: Schema.Types.ObjectId, required: true }, // user manager should use it
    // currency: {type: String, default: "USD"},
    timezone: {type: Number, default: 0},
    folders: [{
        type: Schema.Types.ObjectId,
        ref: 'CreativeFolder'
    }],
    creatives: [{
        type: Schema.Types.ObjectId,
        ref: 'Creative'
    }],
    advertisers: [
      {
        type: Schema.Types.ObjectId,
        ref: "Advertiser",
      },
    ],
    name: { type: String, required: true },
    user_role: { type: String, required: true }
}, {
    collection: "Creator",
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
})

exports.Creator = mongoose.model('Creator', CreatorSchema);
