
const HttpError = require('../models/http-errors')
const mongoose = require('mongoose')
const { validationResult } = require('express-validator')
const Location = require('../models/locations-mongoose-schema')
const User = require('../models/users-schema')

const getCoordsForAddress = require('../utils/location');

const getLocationById = async (req, res, next) => {
    const locationId = req.params.lid
    console.log('GET location record')

    let location;

    try {
        location = await Location.findById(locationId)
    } catch (e) {
        const error = new HttpError('something went wrong, could not find a place.', 500)
        return next(error)
    }

    if (!location) {
        const error = new HttpError('Could not find the place!', 404)
        return next(error)
    }

    res.json({ location: location.toObject({ getters: true }) })
}

const getLocationsByUserId = async (req, res, next) => {
    const { uid } = req.params
    let userWithLocations;
    try {
        userWithLocations = await User.findById(uid).populate('locations')
    } catch (e) {
        const error = new HttpError('Something went wrong, could not fetch the locations.', 500)
        return next(error)
    }

    if (!userWithLocations || userWithLocations.locations.length === 0) {
        return next(new HttpError('Could not find the places for the UserId!', 404))
    }

    res.json({ locations: userWithLocations.locations.map(location => location.toObject({ getters: true })) })
}

const createNewLocation = async (req, res, next) => {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        console.log(errors)
        next(new HttpError('invalid inputs. please check!.', 422))
    }

    const { name, country, address, timezone, creator, description, imageUrl } = req.body

    let coordinates;
    try {
        coordinates = await getCoordsForAddress(address);
    } catch (error) {
        return next(error);
    }

    const newLocation = new Location({
        name,
        description,
        address,
        location: coordinates,
        imageUrl: 'https://www.pwc.com/m1/en/publications/images-new/cognitive-cities-a-journey-to-intelligent-urbanism-new-hero.jpeg',
        creator
    })

    let user;
    try {
        user = await User.findById(creator)
    } catch (e) {
        const error = new HttpError('User not found for the location creation.', 404)
        return next(error)
    }

    if (!user) {
        const error = new HttpError('Cannot create the location for the provided userId, user not found', 404)
        return next(error)
    }

    try {
        const sess = await mongoose.startSession()
        sess.startTransaction()
        await newLocation.save({ session: sess })
        user.locations.push(newLocation)
        await user.save({ session: sess })
        await sess.commitTransaction()
    } catch (err) {
        const error = new HttpError(`Creating new Location failed, Please try again. ${err}`, 500)
        return next(error)
    }


    res.status(201).json({ createdLocation: newLocation })
}

const updateLocation = async (req, res, next) => {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        console.log(errors)
        return next(new HttpError('invalid inputs. please check!.', 422))
    }

    const { name, description } = req.body
    const locationId = req.params.lid

    let location;
    try {
        location = await Location.findById(locationId)
    } catch (e) {
        const error = new HttpError('Something went wrong, could not update location.', 500);
        return next(error)
    }

    location.name = name
    location.description = description

    try {
        await location.save()
    } catch (e) {
        const error = new HttpError('Something went wrong, could not update location.', 500);
        return next(error)
    }


    res.status(200).json({ location: location.toObject({ getters: true }) })
}

const deleteLocation = async (req, res, next) => {
    const locationId = req.params.lid

    let location;
    try {
        location = await Location.findById(locationId).populate('creator')
        console.log('deleting location:', location)
    } catch (e) {
        console.log('finding location err:', e)

        const error = new HttpError(`Something went wrong, could not delete location. ${e}`, 500);
        return next(error)
    }

    if (!location) {
        const error = new HttpError('Cannot find the Location to delete', 404)
        return next(error)
    }

    try {
        const sess = await mongoose.startSession()
        sess.startTransaction()
        await location.deleteOne({ session: sess })
        location.creator.locations.pull(location)
        await location.creator.save({ session: sess })
        await sess.commitTransaction()
    } catch (e) {
        console.log('deleting location err:', e)

        const error = new HttpError(`Something went wrong, could not deleting location. ${e}`, 500);
        return next(error)
    }

    res.status(200).json({ message: 'place deleted successfully' })
}

exports.getLocationById = getLocationById
exports.getLocationsByUserId = getLocationsByUserId
exports.createNewLocation = createNewLocation
exports.updateLocation = updateLocation
exports.deleteLocation = deleteLocation