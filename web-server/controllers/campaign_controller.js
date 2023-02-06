const Advertiser = require("../models/advertiser");
const Campaign = require("../models/campaign");
const CAMPAIGN_ID_PREFIX = "campaign-";

exports.getCampaignsByAdvertiserId = async (req, res, next) => {
  const advertiserId = req.advertiser._id;

  try {
    let campaigns = await Campaign.find({
      advertiser: advertiserId,
      is_archived: false,
    });

    return res.json(campaigns);
  } catch (e) {
    return next(e);
  }
};
exports.getCampaignById = async (req, res, next) => {
  try {
    return res.json(req.campaign);
  } catch (e) {
    return next(e);
  }
};
exports.postCampaign = async (req, res, next) => {
  const advertiserId = req.advertiser._id;
  let name = req.body.name;
  let start = req.body.start
  let end = req.body.end
  let newCampaign;

  try {
    if (!name) {
      throw Boom.badRequest("Missing parameter name");
    }

    if (!start) {
      throw Boom.badRequest("Missing parameter start");
    }

    if (!end) {
      throw Boom.badRequest("Missing parameter end");
    }

    let campaignObj = {
      name: name,
      start: start,
      end: end
    };

    newCampaign = new Campaign(campaignObj);
    newCampaign.advertiser = advertiserId;
    newCampaign.campaign_id =
      CAMPAIGN_ID_PREFIX +
      new hashids("ggkk salt").encodeHex(newCampaign._id.toString());

    await newCampaign.save();

    await Advertiser.updateOne(
      { _id: advertiserId },
      { $addToSet: { campaigns: newCampaign._id } }
    );

    return res.json(newCampaign);
  } catch (e) {
    return next(e);
  }
};
exports.putCampaign = async (req, res, next) => {
  const advertiserId = req.advertiser._id;
  const { campaignId } = req.params;
  const name = req.body.name;
  const start = req.body.start
  const end = req.body.end

  try {
    if (!name) {
      throw Boom.badRequest("Missing parameter name");
    }

    if (!start) {
      throw Boom.badRequest("Missing parameter start");
    }

    if (!end) {
      throw Boom.badRequest("Missing parameter end");
    }


    await Campaign.updateOne(
      { _id: campaignId, advertiser: advertiserId },
      {
        $set: {
          name: name,
          start: start,
          end: end
        },
      }
    );

    return res.json({ message: "success" });
  } catch (e) {
    return next(e);
  }
};

// Update for is_archived
exports.patchCampaign = async (req, res, next) => {
  const advertiserId = req.advertiser._id;
  const { campaignId } = req.params;

  try {
    if (req.body.hasOwnProperty("is_archived")) {
      let { is_archived } = req.body;
      await Campaign.updateOne(
        { _id: campaignId, advertiser: advertiserId },
        { $set: { is_archived } }
      );
      await Advertiser.updateOne(
        { _id: advertiserId },
        { $pull: { campaigns: campaignId } }
      );
    }

    return res.json({ message: "success" });
  } catch (e) {
    return next(e);
  }
};
