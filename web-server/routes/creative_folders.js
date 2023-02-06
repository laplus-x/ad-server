const express = require("express");
const router = express.Router();

const { creative_folder_check } = require("./middle_ware");
const creativeFolderController = require("../controllers/creative_folder_controller");

router.param("creativeFolderId", creative_folder_check);

// Read
router.get("/", creativeFolderController.getCreativeFoldersByCreatorId);
router.get("/:creativeFolderId", creativeFolderController.getCreativeFolderById);

// Create
router.post("/", creativeFolderController.postCreativeFolder);

// Update
router.put("/:creativeFolderId", creativeFolderController.putCreativeFolder);
router.patch("/:creativeFolderId", creativeFolderController.patchCreativeFolder);

module.exports = router;
