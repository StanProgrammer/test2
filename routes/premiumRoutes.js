const express = require('express');

const premiumController = require('../controllers/premiumController');

const userAuthentication = require('../middleware/auth');

const router = express.Router();

router.use("/show-leaderboard",userAuthentication.auth, premiumController.getLeaderBoard );

module.exports = router;