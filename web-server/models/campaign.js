const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// for report
const CampaignSchema = Schema(
  {
    advertiser: { type: Schema.Types.ObjectId, ref: "Advertiser" },
    campaign_id: { type: String, required: true },
    name: { type: String, required: true },
    start: { type: Date, required: true },
    end: { type: Date, required: true },
    is_archived: { type: Boolean, default: false },
  },
  {
    collection: "Campaign",
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

exports.Campaign = mongoose.model("Campaign", CampaignSchema);
