const express = require("express");
const router = express.Router();

const { creative_check, creative_params_check } = require("./middle_ware");
const creativeController = require("../controllers/creative_controller");

router.param("creativeId", creative_check);

// Read
router.get("/", creativeController.getCreativesByCreatorId);

// Create
router.post("/", creative_params_check, creativeController.postCreative);

// Update
router.put("/:creativeId", creative_params_check, creativeController.putCreative);
router.patch("/", creativeController.patchCreatives);
router.patch("/:creativeId", creativeController.patchCreative);

module.exports = router;
