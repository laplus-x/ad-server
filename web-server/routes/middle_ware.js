const jwt = require("jsonwebtoken");
const VASTParser = require("vast-client").VASTParser;
const DOMParser = require("xmldom").DOMParser;
const vastParser = new VASTParser();
const domParser = new DOMParser();

const Advertiser = require("../models/advertiser");
const Campaign = require("../models/campaign");
const CreativeFolder = require("../models/creative_folder");
const Creative = require("../models/creative");

exports.login_check = (req, res, next) => {
  const token = req.headers.authorization;

  try {
    req.tokenObj = jwt.verify(token, config.api_server_secret);
  } catch (e) {
    if (e.name == "JsonWebTokenError") {
      return res.status(401).json({
        message: "Token invlaid, please login to get token.",
        type: "TokenError",
      });
    } else if (e.name == "TokenExpiredError") {
      return res.status(401).json({
        message: "Token expired, please login to get token.",
        type: "TokenExpired",
      });
    }
  }
  return next();
};

exports.creative_check = async (req, res, next, _id) => {
  const creator = req.tokenObj.creator;
  let query = {
    creator,
    $or: [{ is_archived: false }, { is_archived: { $exists: false } }],
    _id,
  };

  try {
    if (!_id) {
      throw Boom.badRequest("Missing parameter creativeId");
    }

    let creative = await Creative.findOne(query);

    if (!creative) {
      throw Boom.forbidden("This creative is not accessible by your account");
    }
    req.creative = creative;
    return next();
  } catch (e) {
    return next(e);
  }
};

exports.creative_folder_check = async (req, res, next, _id) => {
  const creator = req.tokenObj.creator;
  let query = {
    creator,
    $or: [{ is_archived: false }, { is_archived: { $exists: false } }],
    _id,
  };

  try {
    if (!_id) {
      throw Boom.badRequest("Missing parameter creativeFolderId");
    }

    let creativeFolder = await CreativeFolder.findOne(query);

    if (!creativeFolder) {
      throw Boom.forbidden(
        "This creativeFolder is not accessible by your account"
      );
    }
    req.creativeFolder = creativeFolder;
    return next();
  } catch (e) {
    return next(e);
  }
};

exports.advertiser_check = async (req, res, next, _id) => {
  const creator = req.tokenObj.creator;
  let query = {
    creator,
    $or: [{ is_archived: false }, { is_archived: { $exists: false } }],
    _id,
  };

  try {
    if (!_id) {
      throw Boom.badRequest("Missing parameter advertiserId");
    }

    let advertiser = await Advertiser.findOne(query).populate("campaigns");

    if (!advertiser) {
      throw Boom.forbidden("This advertiser is not accessible by your account");
    }
    req.advertiser = advertiser;
    return next();
  } catch (e) {
    return next(e);
  }
};

exports.campaign_check = async (req, res, next, _id) => {
  const advertiser = req.advertiser._id;
  let query = {
    advertiser,
    $or: [{ is_archived: false }, { is_archived: { $exists: false } }],
    _id,
  };

  try {
    if (!_id) {
      throw Boom.badRequest("Missing parameter campaignId");
    }

    let campaign = await Campaign.findOne(query);

    if (!campaign) {
      throw Boom.forbidden("This campaign is not accessible by your account");
    }

    req.campaign = campaign;
    return next();
  } catch (e) {
    return next(e);
  }
};

exports.creative_params_check = async (req, res, next) => {
  const { method } = req;
  const creator = req.tokenObj.creator;
  const { _type, folder, advertiser, campaign, material_type } = req.body;
  const creative = req.creative;

  let keys = ["name", "_type", "advertiser", "campaign"];
  try {
    if (
      [
        ENUM_CREATIVE_DISCRIMINATOR_KEY.INSKIN,
        ENUM_CREATIVE_DISCRIMINATOR_KEY.PUSHDOWN,
        ENUM_CREATIVE_DISCRIMINATOR_KEY.PUSHDOWN_WITH_OUTSTREAM,
        ENUM_CREATIVE_DISCRIMINATOR_KEY.PARALLAX_SCROLLING,
        ENUM_CREATIVE_DISCRIMINATOR_KEY.PARALLAX_SCROLLING_WITH_OUTSTREAM,
        ENUM_CREATIVE_DISCRIMINATOR_KEY.BANNER,
        ENUM_CREATIVE_DISCRIMINATOR_KEY.BANNER_WITH_OUTSTREAM,
        ENUM_CREATIVE_DISCRIMINATOR_KEY.MARQUEE,
        ENUM_CREATIVE_DISCRIMINATOR_KEY.COUNT_DOWN,
      ].includes(_type)
    ) {
      keys.push("landing_page");
    }
    empty_check(req.body, keys);
    await array_check(
      null,
      req.body,
      ["click_trackings", "impression_trackings"],
      0,
      5
    );
    option_check(
      req.body,
      ["_type"],
      _.values(ENUM_CREATIVE_DISCRIMINATOR_KEY)
    );

    if (
      [
        ENUM_CREATIVE_DISCRIMINATOR_KEY.BANNER,
        ENUM_CREATIVE_DISCRIMINATOR_KEY.BANNER_WITH_OUTSTREAM,
        ENUM_CREATIVE_DISCRIMINATOR_KEY.DATA_DRIVEN,
      ].includes(_type)
    ) {
      option_check(req.body, ["preview_type"], _.values(PREVIEW_TYPE));
      option_check(req.body, ["preview_device"], _.values(PREVIEW_DEVICE));
    }

    if (method === "PUT" && _type !== creative._type) {
      throw Boom.badRequest("Missing parameter _type");
    }

    if (folder) {
      const creativeFolder = await CreativeFolder.findOne({
        _id: folder,
        creator,
      });
      if (!creativeFolder) {
        throw Boom.forbidden(
          "This creative folder is not accessible by your account"
        );
      }

      if (
        method === "PUT" &&
        creative.folder &&
        folder !== creative.folder.toString()
      ) {
        throw Boom.badRequest("Missing parameter folder");
      }
    }

    const adv = await Advertiser.findOne({
      _id: advertiser,
      creator,
    });
    if (!adv) {
      throw Boom.forbidden("This advertiser is not accessible by your account");
    }

    const camp = await Campaign.findOne({
      _id: campaign,
      advertiser,
    });
    if (!camp) {
      throw Boom.forbidden("This campaign is not accessible by your account");
    }

    switch (_type) {
      case ENUM_CREATIVE_DISCRIMINATOR_KEY.INSKIN:
        keys = [
          "top_image_url",
          "bottom_image_url",
          "left_image_url",
          "right_image_url",
        ];
        empty_check(req.body, keys);

        keys = ["top_image_height", "bottom_image_height", "content_width"];
        number_check(req.body, keys);
        break;
      case ENUM_CREATIVE_DISCRIMINATOR_KEY.OUTSTREAM:
        await video_check(req.body);
        break;
      case ENUM_CREATIVE_DISCRIMINATOR_KEY.PUSHDOWN_WITH_OUTSTREAM:
        if (material_type === 0) {
          keys = ["initial_image_url", "expanded_image_url"];
        }
        if (material_type === 1) {
          keys = ["initial_html_url", "expanded_html_url"];
        }
        empty_check(req.body, keys);
        keys = [
          "initial_video_width",
          "initial_video_height",
          "expanded_video_width",
          "expanded_video_height",
        ];
        number_check(req.body, keys);
        await video_check(req.body);
        keys = [
          "initial_vertical",
          "initial_horizontal",
          "expanded_vertical",
          "expanded_horizontal",
        ];
        position_check(req.body, keys);
      case ENUM_CREATIVE_DISCRIMINATOR_KEY.PUSHDOWN:
        if (material_type === 0) {
          keys = ["initial_image_url", "expanded_image_url"];
        }
        if (material_type === 1) {
          keys = ["initial_html_url", "expanded_html_url"];
        }
        empty_check(req.body, keys);
        break;
      case ENUM_CREATIVE_DISCRIMINATOR_KEY.PARALLAX_SCROLLING_WITH_OUTSTREAM:
        await video_check(req.body);
        position_check(req.body, ["vertical"]);
        number_check(req.body, ["video_index"]);
        option_check(
          req.body,
          ["video_index"],
          [...Array(req.body.images.length).keys()]
        );
      case ENUM_CREATIVE_DISCRIMINATOR_KEY.PARALLAX_SCROLLING:
        await array_check(
          req.body._type,
          req.body,
          ["images"],
          CREATIVE_DEFAULT_VALUE.PARALLAX_SCROLLING.MIN_NUM,
          CREATIVE_DEFAULT_VALUE.PARALLAX_SCROLLING.MAX_NUM
        );
        break;
      case ENUM_CREATIVE_DISCRIMINATOR_KEY.SCROLLINGBOX:
        await array_check(
          req.body._type,
          req.body,
          ["scrolling_boxes"],
          CREATIVE_DEFAULT_VALUE.SCROLLINGBOX.MIN_NUM,
          CREATIVE_DEFAULT_VALUE.SCROLLINGBOX.MAX_NUM
        );
        break;
      case ENUM_CREATIVE_DISCRIMINATOR_KEY.CAROUSEL:
        await array_check(
          req.body._type,
          req.body,
          ["carousels"],
          CREATIVE_DEFAULT_VALUE.CAROUSEL.MIN_NUM,
          CREATIVE_DEFAULT_VALUE.CAROUSEL.MAX_NUM
        );
        break;
      case ENUM_CREATIVE_DISCRIMINATOR_KEY.BANNER_WITH_OUTSTREAM:
        keys = ["video_width", "video_height"];
        number_check(req.body, keys);
        await video_check(req.body);
        position_check(req.body, ["vertical", "horizontal"]);
      case ENUM_CREATIVE_DISCRIMINATOR_KEY.BANNER:
        if (material_type === 0) {
          empty_check(req.body, ["image_url"]);
        }
        if (material_type === 1) {
          empty_check(req.body, ["html_url"]);
        }
        keys = ["width", "height"];
        number_check(req.body, keys);
        break;
      case ENUM_CREATIVE_DISCRIMINATOR_KEY.SPINNER:
        for (let key of ["top", "bottom", "left", "right"]) {
          empty_check(req.body, [key]);
          empty_check(req.body[key], ["landing_page"]);
          await array_check(
            req.body._type,
            req.body[key],
            ["images"],
            CREATIVE_DEFAULT_VALUE.SPINNER.MIN_NUM,
            CREATIVE_DEFAULT_VALUE.SPINNER.MAX_NUM
          );
        }
        break;
      case ENUM_CREATIVE_DISCRIMINATOR_KEY.CARDS:
        await array_check(
          req.body._type,
          req.body,
          ["cards"],
          CREATIVE_DEFAULT_VALUE.CARDS.MIN_NUM,
          CREATIVE_DEFAULT_VALUE.CARDS.MAX_NUM
        );
        break;
      case ENUM_CREATIVE_DISCRIMINATOR_KEY.ROLLING_CASTLE:
        empty_check(req.body, ["background_image_url"]);
        await array_check(
          req.body._type,
          req.body,
          ["cards", "banners"],
          CREATIVE_DEFAULT_VALUE.ROLLING_CASTLE.MIN_NUM,
          CREATIVE_DEFAULT_VALUE.ROLLING_CASTLE.MAX_NUM
        );
        break;
      case ENUM_CREATIVE_DISCRIMINATOR_KEY.SWITCH:
        await array_check(
          req.body._type,
          req.body,
          ["blinds"],
          CREATIVE_DEFAULT_VALUE.SWITCH.MIN_NUM,
          CREATIVE_DEFAULT_VALUE.SWITCH.MAX_NUM
        );
        break;
      case ENUM_CREATIVE_DISCRIMINATOR_KEY.MARQUEE:
        await array_check(
          req.body._type,
          req.body,
          ["images"],
          CREATIVE_DEFAULT_VALUE.MARQUEE.MIN_NUM,
          CREATIVE_DEFAULT_VALUE.MARQUEE.MAX_NUM
        );
        break;
      case ENUM_CREATIVE_DISCRIMINATOR_KEY.SWAP:
        await array_check(
          req.body._type,
          req.body,
          ["swap"],
          CREATIVE_DEFAULT_VALUE.SWAP.MIN_NUM,
          CREATIVE_DEFAULT_VALUE.SWAP.MAX_NUM
        );
        break;
      case ENUM_CREATIVE_DISCRIMINATOR_KEY.COUNT_DOWN:
        empty_check(req.body, ["top_layer_image_url"]);
        empty_check(req.body, ["date_time"]);
        empty_check(req.body, ["width"]);
        empty_check(req.body, ["height"]);
        empty_check(req.body, ["ultimate_landing_page"]);
        empty_check(req.body, ["ultimate_image_url"]);
        await array_check(
          req.body._type,
          req.body,
          ["images"],
          CREATIVE_DEFAULT_VALUE.COUNT_DOWN.MIN_NUM,
          CREATIVE_DEFAULT_VALUE.COUNT_DOWN.MAX_NUM
        );
        break;
      case ENUM_CREATIVE_DISCRIMINATOR_KEY.DATA_DRIVEN:
        empty_check(req.body, ["width"]);
        empty_check(req.body, ["height"]);
        await array_check(
          req.body._type,
          req.body,
          ["conditions"],
          CREATIVE_DEFAULT_VALUE.DATA_DRIVEN.MIN_NUM,
          CREATIVE_DEFAULT_VALUE.DATA_DRIVEN.MAX_NUM
        );
        break;
    }
    return next();
  } catch (e) {
    return next(e);
  }
};

function empty_check(body, keys) {
  _.forEach(keys, (key) => {
    if (!body[key]) {
      throw Boom.badRequest(`Missing parameter ${key}`);
    }
  });
}

function option_check(body, keys, options) {
  _.forEach(keys, (key) => {
    if (!options.includes(body[key])) {
      throw Boom.badRequest(`Invalid parameter ${key}`);
    }
  });
}

function boolean_check(body, keys) {
  _.forEach(keys, (key) => {
    if (!_.isBoolean(body[key])) {
      throw Boom.badRequest(`Missing parameter ${key}`);
    }
  });
}

function number_check(body, keys) {
  _.forEach(keys, (key) => {
    if (!_.isNumber(body[key])) {
      throw Boom.badRequest(`Missing parameter ${key}`);
    }
  });
}

async function array_check(type, body, keys, min, max) {
  for (let key of keys) {
    if (!_.isArray(body[key])) {
      throw Boom.badRequest(`Missing parameter ${key}`);
    }
    if (body[key].length < min || body[key].length > max) {
      throw Boom.badRequest(
        `Parameter ${key} length should be ${min} ~ ${max}`
      );
    }

    switch (type) {
      case ENUM_CREATIVE_DISCRIMINATOR_KEY.ROLLING_CASTLE:
        if (key === "cards") {
          _.forEach(body[key], (item, index) => {
            empty_check(item, ["image_url"]);
          });
        } else if (key === "banners") {
          let type_options = ["image", "video"];
          for (let item of body[key]) {
            empty_check(item, ["type", "landing_page"]);
            option_check(item, ["type"], type_options);
            if (item.type === "image") {
              await array_check(type, item, ["images"], 1, 2);
            } else if (item.type === "video") {
              _.pull(type_options, "video");
              await video_check(item);
            }
          }
        } else if (key === "images") {
          // banners -> images
          let image_type_options = ["bg", "fg"];
          _.forEach(body[key], (image, index) => {
            empty_check(image, ["url", "type"]);
            option_check(image, ["type"], image_type_options);
            if (image.type === "bg") {
              _.pull(image_type_options, "bg");
            } else if (image.type === "fg") {
              _.pull(image_type_options, "fg");
              number_check(image, ["width"]);
              boolean_check(image, ["is_float"]);
              position_check(image, ["vertical", "horizontal"]);
            }
          });
        }
        break;
      case ENUM_CREATIVE_DISCRIMINATOR_KEY.SWITCH:
      case ENUM_CREATIVE_DISCRIMINATOR_KEY.SCROLLINGBOX:
      case ENUM_CREATIVE_DISCRIMINATOR_KEY.CAROUSEL:
      case ENUM_CREATIVE_DISCRIMINATOR_KEY.SWAP:
      case ENUM_CREATIVE_DISCRIMINATOR_KEY.CARDS:
        _.forEach(body[key], (item, index) => {
          empty_check(item, ["image_url", "landing_page"]);
        });
        break;
      case ENUM_CREATIVE_DISCRIMINATOR_KEY.SPINNER:
        _.forEach(body[key], (item, index) => {
          empty_check(item, ["url"]);
          boolean_check(item, ["use_shake_center"]);
          if (item.use_shake_center) {
            empty_check(item, ["shake_center"]);
            number_check(item.shake_center, ["x", "y"]);
          }
        });
        break;
      case ENUM_CREATIVE_DISCRIMINATOR_KEY.PARALLAX_SCROLLING:
      case ENUM_CREATIVE_DISCRIMINATOR_KEY.PARALLAX_SCROLLING_WITH_OUTSTREAM:
        _.forEach(body[key], (item, index) => {
          empty_check(item, ["url"]);
        });
        break;
      case ENUM_CREATIVE_DISCRIMINATOR_KEY.DATA_DRIVEN:
        _.forEach(body[key], (item, index) => {
          empty_check(item, ["landing_page"]);
          if (body.material_type === 0) {
            empty_check(item, ["image_url"]);
          } else if (body.material_type === 1) {
            empty_check(item, ["html_url"]);
          }
        });
        break;
    }
  }
}

async function video_check(body) {
  if (body.youtube_video_id) {
    return;
  }
  boolean_check(body, ["is_custom"]);
  empty_check(body, ["vast_xml"]);
  const vast_xml = domParser.parseFromString(body.vast_xml, "text/xml");
  const parseVAST = await vastParser.parseVAST(vast_xml);
  const { creatives } = parseVAST.ads[0];
  const { trackingEvents } = creatives.find(
    (creative) => creative.type === "linear"
  );
  const eventCheck = {
    complete: ["{{VIDEO_COMPLETE}}"],
    firstQuartile: ["{{VIDEO_FIRST_QUARTILE}}"],
    midpoint: ["{{VIDEO_MIDPOINT}}"],
    "progress-5": ["{{VIDEO_IMPRESSION_5S}}"],
    skip: ["{{VIDEO_SKIP}}"],
    start: ["{{VIDEO_START}}"],
    thirdQuartile: ["{{VIDEO_THIRD_QUARTILE}}"],
    viewable_impression: [
      "{{VIDEO_IMPRESSION}}",
      "{{IMPRESSION_TRACKING}}",
      "{{THIRD_PARTY_IMPRESSION_MACRO}}",
    ],
  };
  let trackingRemoveSec = _.cloneDeep(trackingEvents);
  ["firstQuartile", "midpoint", "thirdQuartile", "complete"].map((event) => {
    trackingRemoveSec[event].map((URI, index) => {
      if (URI.includes(eventCheck[event][0])) {
        trackingRemoveSec[event][index] = URI.split("?")[0];
      }
    });
  });
  for (let event in eventCheck) {
    eventCheck[event].forEach((URI) => {
      if (!trackingRemoveSec[event]) {
        throw Boom.badRequest(`Tracking event ${event} is required on ${URI}`);
      } else if (!trackingRemoveSec[event].includes(URI)) {
        throw Boom.badRequest(
          `${URI} is required and need to add ${event} tracking event`
        );
      }
    });
  }
}

function position_check(body, keys) {
  _.forEach(keys, (key) => {
    const options = key.includes("vertical")
      ? ["top", "center", "bottom"]
      : ["left", "center", "right"];

    empty_check(body, [`${key}_align`]);
    option_check(body, [`${key}_align`], options);

    if (body[`${key}_align`] !== "center") {
      number_check(body, [`${key}_padding`]);
    }
  });
}
