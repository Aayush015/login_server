const express = require('express');
const router = express.Router();
const LostAndFoundItem = require('../models/LostAndFoundItem');
const User = require('../models/User');

// Route for reporting a lost item
router.post('/report', async (req, res) => {
    const { userId, itemType, dateLost, locationKnown, knownLocation, locations, distinguishingFeatures, longDescription } = req.body;

    try {
        // Check if the user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Create a new lost and found item
        const newItem = new LostAndFoundItem({
            userId,
            itemType,
            dateLost,
            locationKnown,
            knownLocation,
            locations,
            distinguishingFeatures,
            longDescription
        });

        await newItem.save();
        res.status(201).json({ message: 'Item reported successfully', item: newItem });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

// Route for fetching items reported by a specific user
router.get('/user/:userId', async (req, res) => {
    try {
        const items = await LostAndFoundItem.find({ userId: req.params.userId });
        res.status(200).json(items);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

module.exports = router;