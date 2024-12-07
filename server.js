const express = require('express')
const bodyparser = require('body-parser')
const mongoose = require('mongoose')

const locationsRoutes = require('./routes/locations-routes')
const usersRoutes = require('./routes/users-routes')

const HttpError = require('./models/http-errors')

const app = express()

app.use(bodyparser.json())

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization')
    res.setHeader('Access-Control-Header-Methods', 'GET, POST, PATCH, DELETE')

    next()
})

// routes middlewares
app.use('/api/locations/', locationsRoutes)

app.use('/api/users/', usersRoutes)

app.use((req, res, next) => {
    const error = new HttpError('Route could not be found!', 404)
    throw error
})

// special middleware 
app.use((error, req, res, next) => {
    if (res.headerSent) {
        next(error)
    }
    res.status(error.code || 500)
    res.json({ message: error.message || 'Unknown error occured!' })
})


mongoose
    .connect("mongodb+srv://kartheek:wx6sS0a73IzWxigo@deployment.ft9du.mongodb.net/locations?retryWrites=true&w=majority&appName=deployment").
    then(() => {
        app.listen(7000, () => {
            console.log('server is running at "http://localhost:7000"')
            console.log('Connected to MogoDB')
        })
    })
    .catch((e) => {
        console.log('MongoDB error:', e)
    })