const express = require("express");
const router = express.Router();

const { login_check } = require("./middle_ware");

const creatorsRoute = require("./creators");
const creativesRoute = require("./creatives");
const creativeFoldersRoute = require("./creative_folders");
const advertisersRoute = require("./advertisers");

const creatorController = require("../controllers/creator_controller");
const creativeController = require("../controllers/creative_controller");

router.post("/login", creatorController.login);
router.get("/creatives/:creativeId", creativeController.getCreativeById);

router.use(login_check);
router.use("/creators", creatorsRoute);
router.use("/creatives", creativesRoute);
router.use("/creative/folders", creativeFoldersRoute);
router.use("/advertisers", advertisersRoute);

module.exports = router;
