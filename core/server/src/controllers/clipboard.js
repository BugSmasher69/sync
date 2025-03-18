// This file defines controller functions for handling clipboard-related API requests.

const express = require('express');
const router = express.Router();

// Placeholder for clipboard data
let clipboardData = [];

// Get clipboard data
router.get('/', (req, res) => {
    res.json(clipboardData);
});

// Add new clipboard item
router.post('/', (req, res) => {
    const { item } = req.body;
    if (item) {
        clipboardData.push(item);
        res.status(201).json({ message: 'Clipboard item added', item });
    } else {
        res.status(400).json({ message: 'Item is required' });
    }
});

// Clear clipboard data
router.delete('/', (req, res) => {
    clipboardData = [];
    res.json({ message: 'Clipboard cleared' });
});

module.exports = router;