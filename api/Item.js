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

// Route for fetching potential matches for both lost and found items
router.get('/potentialMatches/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;

        // Fetch lost items reported by the user and found items by others
        const lostItems = await LostAndFoundItem.find({ userId, status: 'lost' }).populate('userId', 'name');
        const foundItemsByOthers = await LostAndFoundItem.find({ userId: { $ne: userId }, status: 'found' });

        // Fetch found items reported by the user and lost items by others
        const foundItems = await LostAndFoundItem.find({ userId, status: 'found' }).populate('userId', 'name');
        const lostItemsByOthers = await LostAndFoundItem.find({ userId: { $ne: userId }, status: 'lost' });

        const matches = [];

        // Match user-reported lost items with found items from others
        lostItems.forEach((lostItem) => {
            foundItemsByOthers.forEach((foundItem) => {
                const matchScore = calculateMatchScore(lostItem, foundItem);
                if (matchScore > 0.6) {
                    matches.push({
                        lostItem,
                        foundItem,
                        matchScore,
                        lostItemUserId: lostItem.userId._id,  // Track both user IDs
                        foundItemUserId: foundItem.userId._id,  // Track both user IDs
                        lostItemUserName: lostItem.userId.name,
                        foundItemUserName: foundItem.userId.name
                    });
                }
            });
        });

        // Match user-reported found items with lost items from others
        foundItems.forEach((foundItem) => {
            lostItemsByOthers.forEach((lostItem) => {
                const matchScore = calculateMatchScore(lostItem, foundItem);
                if (matchScore > 0.6) {
                    matches.push({
                        lostItem,
                        foundItem,
                        matchScore,
                        lostItemUserId: lostItem.userId._id,  // Track both user IDs
                        foundItemUserId: foundItem.userId._id,  // Track both user IDs
                        lostItemUserName: lostItem.userId.name,
                        foundItemUserName: foundItem.userId.name
                    });
                }
            });
        });

        res.status(200).json(matches);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

// Route to get the history of reported lost and found items by user ID
router.get('/history/:userId', async (req, res) => {
    try {
        const items = await LostAndFoundItem.find({ userId: req.params.userId })
            .sort({ createdAt: -1 }) // Sort by most recent first
            .populate('userId', 'name'); // Include user name if needed

        res.status(200).json(items);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

// Route to delete a specific lost and found item
router.delete('/delete/:itemId', async (req, res) => {
    try {
        const deletedItem = await LostAndFoundItem.findByIdAndDelete(req.params.itemId);
        if (deletedItem) {
            res.status(200).json({ message: 'Item deleted successfully' });
        } else {
            res.status(404).json({ message: 'Item not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

// Route to get chat history for a specific item
router.get('/chat/:itemId', async (req, res) => {
    try {
        const chatHistory = await Chat.find({ itemId: req.params.itemId })
            .sort({ timestamp: 1 })
            .populate('senderId', 'name')
            .populate('receiverId', 'name');
        
        res.status(200).json(chatHistory);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

module.exports = router;