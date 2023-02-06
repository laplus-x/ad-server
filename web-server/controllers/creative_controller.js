const Creator = require("../models/creator");
const CreativeFolder = require("../models/creative_folder");
const Creative = require("../models/creative");

const CreativeDiscriminators = Creative.discriminators;

const creativeKeys = {
  common: [
    "name",
    "landing_page",
    "preview_type",
    "folder",
    "material_type",
    "advertiser",
    "campaign",
    "click_trackings",
    "impression_trackings",
  ],
  inskin: [
    "top_image_url",
    "bottom_image_url",
    "left_image_url",
    "right_image_url",
    "top_image_height",
    "bottom_image_height",
    "content_width",
  ],
  outstream: ["is_custom", "vast_url", "vast_xml"],
  pushdown: [
    "initial_image_url",
    "expanded_image_url",
    "initial_html_url",
    "expanded_html_url",
    "millisecond",
    "times",
  ],
  pushdownWithOutstream: [
    "initial_image_url",
    "expanded_image_url",
    "initial_html_url",
    "expanded_html_url",
    "is_custom",
    "vast_url",
    "vast_xml",
    "youtube_video_id",
    "initial_video_width",
    "initial_video_height",
    "expanded_video_width",
    "expanded_video_height",
    "initial_vertical_align",
    "initial_vertical_padding",
    "initial_horizontal_align",
    "initial_horizontal_padding",
    "expanded_vertical_align",
    "expanded_vertical_padding",
    "expanded_horizontal_align",
    "expanded_horizontal_padding",
    "millisecond",
    "times",
  ],
  parallaxScrolling: ["images", "use_fullscreen"],
  parallaxScrollingWithOutstream: [
    "images",
    "use_fullscreen",
    "video_index",
    "is_custom",
    "vast_url",
    "vast_xml",
    "youtube_video_id",
    "video_width",
    "video_height",
    "vertical_align",
    "vertical_padding",
    "horizontal_align",
    "horizontal_padding",
  ],
  scrollingBox: [
    "scrolling_boxes",
    "offset_bottom_unit",
    "offset_bottom_number",
  ],
  carousel: ["carousels"],
  banner: [
    "image_url",
    "html_url",
    "width",
    "height",
    "preview_device",
    "millisecond",
    "times",
  ],
  bannerWithOutstream: [
    "image_url",
    "html_url",
    "width",
    "height",
    "is_custom",
    "vast_url",
    "vast_xml",
    "youtube_video_id",
    "video_width",
    "video_height",
    "vertical_align",
    "vertical_padding",
    "horizontal_align",
    "horizontal_padding",
    "preview_device",
    "millisecond",
    "times",
  ],
  spinner: [
    "top",
    "bottom",
    "left",
    "right",
    "offset_bottom_unit",
    "offset_bottom_number",
  ],
  cards: ["cards", "offset_bottom_unit", "offset_bottom_number"],
  rollingCastle: [
    "background_image_url",
    "cards",
    "banners",
    "offset_bottom_unit",
    "offset_bottom_number",
  ],
  switch: ["blinds"],
  marquee: ["images", "offset_bottom_unit", "offset_bottom_number"],
  swap: ["swap"],
  countDown: [
    "images",
    "top_layer_image_url",
    "width",
    "height",
    "date_time",
    "ultimate_image_url",
    "ultimate_landing_page",
  ],
  vast: ["vast_xml"],
  postAd: ["image_url", "content", "advertiser_icon", "advertiser_name"],
  postAdWithOutstream: [
    "content",
    "advertiser_icon",
    "advertiser_name",
    "is_custom",
    "vast_url",
    "vast_xml",
  ],
  dataDriven: ["width", "height", "conditions"],
};

const CREATIVE_ID_PREFIX = "creative-";
// Read
exports.getCreativesByCreatorId = async (req, res, next) => {
  const creatorId = req.tokenObj.creator;
  const { folder, advertiser, campaign } = req.query;

  let query = {
    creator: creatorId,
    is_archived: false,
  };

  if (advertiser) {
    query.advertiser = advertiser;
  } else if (advertiser && campaign) {
    query.campaign = campaign;
  } else if (folder) {
    query.folder = folder;
  }

  try {
    const creatives = await Creative.find(
      query,
      {},
      {
        sort: { created_at: -1 },
      }
    );

    return res.json(creatives);
  } catch (e) {
    return next(e);
  }
};

// for preview page
exports.getCreativeById = async (req, res, next) => {
  const { creativeId } = req.params;

  try {
    if (!creativeId) {
      throw Boom.badRequest("Missing parameter creativeId");
    }

    let query = {
      $or: [{ is_archived: false }, { is_archived: { $exists: false } }],
    };

    if (creativeId.includes(CREATIVE_ID_PREFIX)) {
      query.creative_id = creativeId;
    } else {
      query._id = creativeId;
    }
    const creative = await Creative.findOne(query);

    return res.json(creative);
  } catch (e) {
    return next(e);
  }
};

// Create
exports.postCreative = async (req, res, next) => {
  const creatorId = req.tokenObj.creator;
  const { _type, folder } = req.body;

  try {
    const keys = _.concat(creativeKeys.common, creativeKeys[_type]);
    const creativeObj = _.pick(req.body, keys);
    const creativeModel = CreativeDiscriminators[_type];
    let newCreative = new creativeModel(creativeObj);

    newCreative.creator = creatorId;
    newCreative.creative_id =
      CREATIVE_ID_PREFIX +
      new hashids("ggkk salt").encodeHex(newCreative._id.toString());
    await newCreative.save();

    if (folder) {
      await CreativeFolder.updateOne(
        { _id: folder, creator: creatorId },
        { $addToSet: { creatives: newCreative._id } }
      );
    }

    await Creator.updateOne(
      { _id: creatorId },
      { $addToSet: { creatives: newCreative._id } }
    );

    return res.json(newCreative);
  } catch (e) {
    return next(e);
  }
};

// Update
exports.putCreative = async (req, res, next) => {
  const creatorId = req.tokenObj.creator;
  const { creativeId } = req.params;
  const _type = req.creative._type;
  try {
    const keys = _.concat(creativeKeys.common, creativeKeys[_type]);
    const creativeObj = _.pick(req.body, keys);
    let newCreative = await CreativeDiscriminators[_type].findOneAndUpdate(
      { _id: creativeId, creator: creatorId },
      { $set: creativeObj },
      { new: true }
    );

    return res.json(newCreative);
  } catch (e) {
    return next(e);
  }
};

// Update for folder and is_archived
exports.patchCreative = async (req, res, next) => {
  const creatorId = req.tokenObj.creator;
  const { creativeId } = req.params;
  let newCreative;

  try {
    if (req.body.hasOwnProperty("is_archived")) {
      const { is_archived } = req.body;
      newCreative = await Creative.findOneAndUpdate(
        { _id: creativeId, creator: creatorId },
        { $set: { is_archived } },
        { new: true }
      );
    }

    if (req.body.hasOwnProperty("folder")) {
      const old_folder = req.creative.folder;
      const { folder } = req.body;

      if (folder) {
        let creativeFolder = await CreativeFolder.findOne({
          _id: folder,
          creator: creatorId,
          is_archived: false,
        });

        if (!creativeFolder) {
          throw Boom.forbidden(
            "This creative folder is not accessible by your account"
          );
        }

        newCreative = await Creative.findOneAndUpdate(
          { _id: creativeId, creator: creatorId },
          { $set: { folder } },
          { new: true }
        );

        // update creative folder
        // old pull
        await CreativeFolder.updateOne(
          { _id: old_folder, creator: creatorId, creatives: creativeId },
          { $pull: { creatives: creativeId } }
        );
        // new add
        await CreativeFolder.updateOne(
          { _id: folder, creator: creatorId },
          { $addToSet: { creatives: creativeId } }
        );
      } else {
        // remove folder
        newCreative = await Creative.findOneAndUpdate(
          { _id: creativeId, creator: creatorId },
          { $unset: { folder: 1 } },
          { new: true }
        );
        // old pull
        await CreativeFolder.updateOne(
          { _id: old_folder, creator: creatorId, creatives: creativeId },
          { $pull: { creatives: creativeId } }
        );
      }
    }

    return res.json(newCreative);
  } catch (e) {
    return next(e);
  }
};

// bulkUpdate for folder and is_archived
exports.patchCreatives = async (req, res, next) => {
  const creatorId = req.tokenObj.creator;
  const { ids } = req.body;
  try {
    if (!ids || !_.isArray(ids) || !ids.length) {
      throw Boom.badRequest("Missing parameter ids");
    }

    const invalid = await Creative.findOne({
      _id: { $in: ids },
      creator: { $ne: creatorId },
    });

    if (invalid) {
      throw Boom.forbidden(
        `${invalid._id} - The creative is not accessible by your account`
      );
    }

    if (req.body.hasOwnProperty("is_archived")) {
      const { is_archived } = req.body;
      await Creative.updateMany(
        { _id: { $in: ids }, creator: creatorId },
        { $set: { is_archived } }
      );
    }

    if (req.body.hasOwnProperty("folder")) {
      const { folder } = req.body;

      if (folder) {
        const creativeFolder = await CreativeFolder.findOne({
          _id: folder,
          creator: creatorId,
        });

        if (!creativeFolder) {
          throw Boom.forbidden(
            "This creative folder is not accessible by your account"
          );
        }

        await Creative.updateMany(
          { _id: { $in: ids }, creator: creatorId },
          { $set: { folder } }
        );

        // update creative folder
        // old pull
        await CreativeFolder.updateMany(
          { creator: creatorId, creatives: { $in: ids } },
          { $pull: { creatives: { $in: ids } } }
        );
        // new add
        await CreativeFolder.updateOne(
          { _id: folder, creator: creatorId },
          { $addToSet: { creatives: { $each: ids } } }
        );
      } else {
        // remove folder
        await Creative.updateMany(
          { _id: { $in: ids }, creator: creatorId },
          { $unset: { folder: 1 } }
        );
        // old pull
        await CreativeFolder.updateMany(
          { creator: creatorId, creatives: { $in: ids } },
          { $pull: { creatives: { $in: ids } } }
        );
      }
    }

    const newCreatives = await Creative.find({
      _id: { $in: ids },
      creator: creatorId,
    });

    return res.json(newCreatives);
  } catch (e) {
    return next(e);
  }
};
