const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const LostAndFoundItemSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    itemType: {
        type: String,
        required: true
    },
    dateLost: {
        type: Date,
        required: true
    },
    locationKnown: {
        type: Boolean,
        required: true
    },
    knownLocation: {
        type: String,
        required: function() { return this.locationKnown; }
    },
    locations: {
        type: [String],
        required: function() { return !this.locationKnown; },
        validate: [arrayLimit, 'Maximum of 3 possible locations allowed']
    },
    distinguishingFeatures: {
        type: String,
        required: true
    },
    longDescription: {
        type: String
    },
    dateReported: {
        type: Date,
        default: Date.now
    },
    status: {  
        type: String,
        enum: ['lost', 'found'],
        required: true
    }
});

function arrayLimit(val) {
    return val.length <= 3;
}

const LostAndFoundItem = mongoose.model('LostAndFoundItem', LostAndFoundItemSchema);

module.exports = LostAndFoundItem;
