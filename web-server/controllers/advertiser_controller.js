const Advertiser = require("../models/advertiser");
const Creator = require("../models/creator");
const ADVERTISER_ID_PREFIX = "advertiser-";

exports.getAdvertisersByCreatorId = async (req, res, next) => {
  const creatorId = req.tokenObj.creator;

  try {
    let advertisers = await Advertiser.find({
      creator: creatorId,
      is_archived: false,
    }).populate("campaigns");

    return res.json(advertisers);
  } catch (e) {
    return next(e);
  }
};
exports.getAdvertiserById = async (req, res, next) => {
  try {
    return res.json(req.advertiser);
  } catch (e) {
    return next(e);
  }
};
exports.postAdvertiser = async (req, res, next) => {
  const creatorId = req.tokenObj.creator;
  let name = req.body.name;
  let icon = req.body.icon;
  let newAdvertiser;

  try {
    if (!name) {
      throw Boom.badRequest("Missing parameter name");
    }

    let advertiserObj = {
      name,
      icon,
      campaigns: [],
    };

    newAdvertiser = new Advertiser(advertiserObj);
    newAdvertiser.creator = creatorId;
    newAdvertiser.advertiser_id =
      ADVERTISER_ID_PREFIX +
      new hashids("ggkk salt").encodeHex(newAdvertiser._id.toString());
    await newAdvertiser.save();

    await Creator.updateOne(
      { _id: creatorId },
      { $addToSet: { advertisers: newAdvertiser._id } }
    );

    return res.json(newAdvertiser);
  } catch (e) {
    return next(e);
  }
};
exports.putAdvertiser = async (req, res, next) => {
  const creatorId = req.tokenObj.creator;
  const { advertiserId } = req.params;
  const name = req.body.name;
  const icon = req.body.icon;
  try {
    if (!name) {
      throw Boom.badRequest("Missing parameter name");
    }

    await Advertiser.updateOne(
      { _id: advertiserId, creator: creatorId },
      {
        $set: {
          name: name,
          icon: icon,
        },
      }
    );

    return res.json({ message: "success" });
  } catch (e) {
    return next(e);
  }
};

// Update for is_archived
exports.patchAdvertiser = async (req, res, next) => {
  const creatorId = req.tokenObj.creator;
  const { advertiserId } = req.params;

  try {
    if (req.body.hasOwnProperty("is_archived")) {
      let { is_archived } = req.body;
      await Advertiser.updateOne(
        { _id: advertiserId, creator: creatorId },
        { $set: { is_archived } }
      );
    }

    return res.json({ message: "success" });
  } catch (e) {
    return next(e);
  }
};
