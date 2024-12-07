

const mongoose = require('mongoose')

const locationSchema = new mongoose.Schema({
    name: { type: String, require: true },
    description: { type: String, require: true },
    imageUrl: { type: String, require: true },
    address: { type: String, require: true },
    location: {
        lng: { type: Number, require: true },
        lat: { type: Number, require: true }
    },
    creator: { type: mongoose.Types.ObjectId, required: true, ref: 'User'}
})

module.exports = mongoose.model('Location', locationSchema)