const express = require('express');
const router = express.Router();
const { savePOTD } = require('../controllers/potd');

// Route to save POTD
router.post('/save', savePOTD);

module.exports = router; 