const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// for report
const AdvertiserSchema = Schema(
  {
    creator: { type: Schema.Types.ObjectId, ref: "Creator", required: true },
    advertiser_id: { type: String, required: true },
    name: { type: String, required: true },
    icon: { type: String },
    campaigns: [
      {
        type: Schema.Types.ObjectId,
        ref: "Campaign",
      },
    ],
    is_archived: { type: Boolean, default: false },
  },
  {
    collection: "Advertiser",
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

exports.Advertiser = mongoose.model("Advertiser", AdvertiserSchema);
