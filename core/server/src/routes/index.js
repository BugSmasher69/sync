const express = require('express');
const router = express.Router();

// Import controllers
const clipboardController = require('../controllers/clipboard');

// Define routes
router.get('/clipboard', clipboardController.getClipboard);
router.post('/clipboard', clipboardController.addClipboardItem);
router.delete('/clipboard/:id', clipboardController.deleteClipboardItem);

module.exports = router;