const express = require("express");
const router = express.Router();

const { advertiser_check } = require("./middle_ware");
const advertiserController = require("../controllers/advertiser_controller");
const campaignsRoute = require("./campaigns");

router.param("advertiserId", advertiser_check);

// Read
router.get("/", advertiserController.getAdvertisersByCreatorId);
router.get("/:advertiserId", advertiserController.getAdvertiserById);

// Create
router.post("/", advertiserController.postAdvertiser);

// Update
router.put("/:advertiserId", advertiserController.putAdvertiser);
router.patch("/:advertiserId", advertiserController.patchAdvertiser);

// use
router.use("/:advertiserId/campaigns", campaignsRoute);

module.exports = router;
