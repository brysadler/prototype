const path = require('path')
const express = require('express')
const bodyParser = require('body-parser')
const router = require('./routes/index')
const app = express()
const { http } = require('config')
const prototype = {}

prototype.view_engine = 'ejs'
prototype.root = path.resolve(__dirname, '../')
prototype.views = prototype.root + '/app/views'
prototype.public_folder = prototype.root + 'app/assets'

app.set('views', prototype.views)
app.set('view engine', prototype.view_engine)
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: false}))
app.use(express.static('assets'))
app.use(router)

let server = app.listen(http.port, (err) => {
  if (err) throw err
  console.log('http:start', {port: http.port})
})

process.on('uncaughtException', (err) => {
  console.log('process:uncaughtException', err)
process.emit('SIGINT')
})
