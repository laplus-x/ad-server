const express = require('express');
const router = express.Router();

const creatorController = require('../controllers/creator_controller');

// Read
router.get('/', creatorController.getCreatorByUserId);

module.exports = router;
