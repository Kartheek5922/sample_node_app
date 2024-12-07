
const express = require('express')
const bodyparser = require('body-parser')

const app = express()

app.use(bodyparser.json())

// app.use('/api/locations')

app.listen(5000, () => {
    console.log('server is running at http://localhost:5000')
})