const Creator = require("../models/creator");
const CreativeFolder = require("../models/creative_folder");
const Creative = require("../models/creative");

exports.getCreativeFoldersByCreatorId = async (req, res, next) => {
  const creatorId = req.tokenObj.creator;

  try {
    let folders = await CreativeFolder.find({
      creator: creatorId,
      is_archived: false
    });

    return res.json(folders);
  } catch (e) {
    return next(e);
  }
};
exports.getCreativeFolderById = async (req, res, next) => {
  const creatorId = req.tokenObj.creator;
  const { creativeFolderId } = req.params;

  try {
    if (!creativeFolderId) {
      throw Boom.badRequest("Missing parameter creativeFolderId");
    }

    let folder = await CreativeFolder.findOne({
      _id: creativeFolderId,
      creator: creatorId,
      is_archived: false
    });

    if (!folder) {
      throw Boom.forbidden(
        "This creative folder is not accessible by your account"
      );
    }

    return res.json(folder);
  } catch (e) {
    return next(e);
  }
};
exports.postCreativeFolder = async (req, res, next) => {
  const creatorId = req.tokenObj.creator;
  let name = req.body.name;
  let newCreativeFolder;

  try {
    if (!name) {
      throw Boom.badRequest("Missing parameter name");
    }

    let creativeFolderObj = {
      name: name,
    };

    newCreativeFolder = new CreativeFolder(creativeFolderObj);
    newCreativeFolder.creator = creatorId;
    await newCreativeFolder.save();

    await Creator.updateOne(
      { _id: creatorId },
      { $addToSet: { folders: newCreativeFolder._id } }
    );

    return res.json(newCreativeFolder);
  } catch (e) {
    return next(e);
  }
};
exports.putCreativeFolder = async (req, res, next) => {
  const creatorId = req.tokenObj.creator;
  const { creativeFolderId } = req.params;
  const name = req.body.name;

  try {
    if (!creativeFolderId) {
      throw Boom.badRequest("Missing parameter creativeFolderId");
    }

    let folder = await CreativeFolder.findOne({
      _id: creativeFolderId,
      creator: creatorId,
    });

    if (!folder) {
      throw Boom.forbidden(
        "This creative folder is not accessible by your account"
      );
    }

    if (!name) {
      throw Boom.badRequest("Missing parameter name");
    }

    await CreativeFolder.updateOne(
      { _id: creativeFolderId, creator: creatorId },
      {
        $set: {
          name: name,
        },
      }
    );

    return res.json({ message: "success" });
  } catch (e) {
    return next(e);
  }
};

// Update for is_archived
exports.patchCreativeFolder = async (req, res, next) => {
  const creatorId = req.tokenObj.creator;
  const { creativeFolderId } = req.params;

  try {
    if (!creativeFolderId) {
      throw Boom.badRequest("Missing parameter creativeFolderId");
    }

    const folder = await CreativeFolder.findOne({
      _id: creativeFolderId,
      creator: creatorId,
    });

    if (!folder) {
      throw Boom.forbidden(
        "This creative folder is not accessible by your account"
      );
    }

    if (req.body.hasOwnProperty("is_archived")) {
      let { is_archived } = req.body;
      await CreativeFolder.updateOne(
        { _id: creativeFolderId, creator: creatorId },
        { $set: { is_archived } }
      );
      await Creative.updateMany(
        { _id: { $in: folder.creatives }, creator: creatorId },
        { $set: { is_archived: true } }
      );
    }

    return res.json({ message: "success" });
  } catch (e) {
    return next(e);
  }
};
