
const { validationResult } = require('express-validator')
const HttpError = require('../models/http-errors')
const User = require('../models/users-schema')

const getUsers = async (req, res, next) => {
    let users;
    try {
        users = await User.find({}, '-password')
    } catch (e) {
        const error = new HttpError("Fetching users failed!", 500)
        return next(error)
    }
    res.json({ users: users.map(user => user.toObject({ getters: true })) })
}

const signup = async (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return next(new HttpError('invalid inputs. please check!.', 422))
    }
    const { name, email, password } = req.body


    let existingUser; 
    try {
        existingUser = await User.findOne({ email: email })
    } catch (e) {
        const error = new HttpError('Something went wrong, cannot check user existance.', 500)
        return next(error)
    }

    if (existingUser) {
        const error = new HttpError('user already existed with th email Id, You can Login or Try with another.', 422)
        return next(error)
    }

    const newUser = new User({
        name,
        email,
        image: 'https://cdn.pixabay.com/photo/2015/03/04/22/35/avatar-659652_640.png',
        password,
        locations: [],
    })

    try {
        await newUser.save()
    } catch (e) {
        const error = new HttpError(`Something went wrong, user can't be created. ${e}`, 500)
        return next(error)
    }

    res.status(201).json({ newUser: newUser.toObject({ getters: true }) })
}

const login = async (req, res, next) => {
    const { email, password } = req.body

    let existingUser;
    try {
        existingUser = await User.findOne({ email: email })
    } catch (e) {
        const error = new HttpError('Something went wrong, cannot check user existance.', 500)
        return next(error)
    }

    if (!existingUser || existingUser.password !== password) {
        const error = new HttpError('Invalid credentials, could not log in', 401)
        return next(error)
    }

    res.json({ message: 'Logged in succefully' })
}


exports.getUsers = getUsers
exports.signup = signup
exports.login = login