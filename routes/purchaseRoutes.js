const express = require('express');

const purchaseController = require('../controllers/purchaseController');

const userAuthentication = require('../middleware/auth');

const router = express.Router();

router.get('/premium-membership', userAuthentication.auth, purchaseController.purchasepremium);

router.post('/update-transaction-status', userAuthentication.auth, purchaseController.updateTransactionStatus)

module.exports = router;