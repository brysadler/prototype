const express = require('express')
const bodyParser = require('body-parser')
const log = require('./utils/bristol')
const router = require('./routes/index')
const app = express()
const { http } = require('config')
const job = require('./controller/jobs')

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: false}))
app.use(router)

let server = app.listen(http.port, (err) => {
  if (err) throw err
  console.log('http:start', {port: http.port})
  log.info('http:start', {port: http.port})
  job.execute('start_job', null)
})

process.on('uncaughtException', (err) => {
  console.log('process:uncaughtException', err)
process.emit('SIGINT')
})
