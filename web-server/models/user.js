const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = Schema(
  {
    creator: { type: Schema.Types.ObjectId, required: true, ref: "Creator" },
    email: { type: String, required: true },
    user_server_user_id: { type: String },
    allowed_advertiser: [{ type: Schema.Types.ObjectId, ref: "Advertiser" }],
    allowed_all_advertiser: { type: Boolean },
  },
  {
    collection: "User",
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

exports.User = mongoose.model("User", UserSchema);
