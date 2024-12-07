const express = require('express')
const { check } = require('express-validator')

const locationsController = require('../controllers/locations-controller')

const router = express.Router()

router.get('/:lid', locationsController.getLocationById)

router.get('/user/:uid', locationsController.getLocationsByUserId)

router.post('/', [
    check('name').not().isEmpty(),
    check('description').isLength({ min: 5 }),
    check('address').not().isEmpty()
], locationsController.createNewLocation)

router.patch('/:lid', [
    check('name').not().isEmpty(),
    check('description').isLength({ min: 5 }),
], locationsController.updateLocation)

router.delete('/:lid', locationsController.deleteLocation)


module.exports = router