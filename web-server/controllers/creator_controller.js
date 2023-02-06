const request = require("request-promise");
const jwt = require("jsonwebtoken");
const moment = require("moment");

const Creator = require("../models/creator");

const tokenExpiredTime = config.token_expire || "3d";

// Read
exports.getCreatorByUserId = async (req, res, next) => {
  const userId = req.tokenObj.user;

  try {
    let creator = await Creator.findOne({ user: userId });

    return res.json(creator);
  } catch (e) {
    return next(e);
  }
};

// Create if creator $exists:false
exports.login = async (req, res, next) => {
  const { access_token } = req.body;

  let user = await ATD_login(access_token);

  if (user && user.data && user.data.user_type === "creator") {
    const creator = await Creator.findOne({ user: user._id });
    user.data.creator = _.pick(creator.toObject(), "_id");

    const token = jwt.sign(
      {
        user: user._id,
        user_type: user.data.user_type,
        creator: creator._id,
        timezone: creator.timezone
      },
      config.api_server_secret,
      { expiresIn: tokenExpiredTime }
    );

    const time = tokenExpiredTime.match(/\d+/g)[0];
    const timeUnit = tokenExpiredTime.match(/\D+/g)[0];
    const maxAge = moment.duration(Number(time), timeUnit).asMilliseconds();
    const expires = new Date(Date.now() + maxAge);

    return res.json({
      message: "success",
      user,
      token,
      expires
    });
  } else {
    return res.status(403).json({
      message: "Email and password not correct",
      type: "LoginAccessDenial",
    });
  }
};

async function ATD_login(access_token) {
  let resp, user;
  try {
    resp = await request({
      method: "GET",
      uri: `${config.user_auth_domain}/user_info`,
      qs: {
        access_token: access_token,
      },
      json: true,
    });
  } catch (e) {
    console.error(e);
    resp = e.response ? e.response.body : e;
  }

  if (resp.message === "success") {
    user = resp.data;
    if (!user.data.user_type) {
      console.log(
        "Create initial data for new coming user:",
        user.name + "(" + user._id + ")"
      );
      await request({
        method: "PUT",
        uri: config.user_auth_domain + "/user/" + user._id + "/update",
        form: {
          platform: "rich_media",
          platform_data: {
            user_type: "creator",
          },
        },
        json: true,
      });

      const creator = await Creator.findOne({ user: user._id });
      if (!creator) {
        var newCreator = new Creator({
          user: user._id,
          folders: [],
          creatives: [],
          advertisers: []
        });
        newCreator.creator_id =
          "creator-" +
          new hashids("ggkk salt").encodeHex(newCreator._id.toString());
        await newCreator.save();
      }
      user.data.user_type = "creator";
    }
  }
  return user;
}
