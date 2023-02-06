const express = require("express");
const router = express.Router();

const { campaign_check } = require("./middle_ware");
const campaignController = require("../controllers/campaign_controller");

router.param("campaignId", campaign_check);

// Read
router.get("/", campaignController.getCampaignsByAdvertiserId);
router.get("/:campaignId", campaignController.getCampaignById);

// Create
router.post("/", campaignController.postCampaign);

// Update
router.put("/:campaignId", campaignController.putCampaign);
router.patch("/:campaignId", campaignController.patchCampaign);

module.exports = router;
