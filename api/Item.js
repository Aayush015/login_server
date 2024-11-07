const express = require('express');
const router = express.Router();
const LostAndFoundItem = require('../models/LostAndFoundItem');
const User = require('../models/User');

// Route for reporting a lost item
router.post('/report', async (req, res) => {
    const { userId, itemType, dateLost, locationKnown, knownLocation, locations, distinguishingFeatures, longDescription, status } = req.body;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Validate status
        if (!['lost', 'found'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status. Must be "lost" or "found".' });
        }

        // Create a new lost and found item with the specified status
        const newItem = new LostAndFoundItem({
            userId,
            itemType,
            dateLost,
            locationKnown,
            knownLocation,
            locations,
            distinguishingFeatures,
            longDescription,
            status
        });

        await newItem.save();
        res.status(201).json({ message: 'Item reported successfully', item: newItem });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

router.get('/potentialMatches/:userId', async (req, res) => {
    try {
        // Fetch only lost items reported by the current user
        const lostItems = await LostAndFoundItem.find({ userId: req.params.userId, status: 'lost' });

        // Fetch only found items reported by other users
        const foundItems = await LostAndFoundItem.find({ userId: { $ne: req.params.userId }, status: 'found' });

        const matches = [];

        lostItems.forEach((lostItem) => {
            foundItems.forEach((foundItem) => {
                const matchScore = calculateMatchScore(lostItem, foundItem);

                // Assuming a threshold for similarity (e.g., matchScore > 0.6)
                if (matchScore > 0.6) {
                    matches.push({ lostItem, foundItem, matchScore });
                }
            });
        });

        res.status(200).json(matches);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

// Helper function to calculate a similarity score between two items
function calculateMatchScore(lostItem, foundItem) {
    let score = 0;

    // Check item type
    if (lostItem.itemType === foundItem.itemType) score += 0.4;

    // Check known location
    if (
        lostItem.locationKnown &&
        foundItem.locationKnown &&
        lostItem.knownLocation === foundItem.knownLocation
    ) {
        score += 0.3;
    }

    // Check distinguishing features for similarity (simple substring match)
    if (
        lostItem.distinguishingFeatures &&
        foundItem.distinguishingFeatures &&
        lostItem.distinguishingFeatures
            .toLowerCase()
            .includes(foundItem.distinguishingFeatures.toLowerCase())
    ) {
        score += 0.3;
    }

    return score;
}

module.exports = router;