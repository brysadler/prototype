const express = require('express')
const plaid = require('plaid')
const Plaid = require('../utils/plaid')
const router = express.Router()
const user = require('../controller/user')

router.get('/', function(req, res, next) {
  console.log('route hit')
  res.render('main')
})

router.post('/get_access_token', (req, res) => {
  console.log('getting access token')
  PUBLIC_TOKEN = req.body.public_token
  client.exchangePublicToken(PUBLIC_TOKEN, (error, tokenResponse) => {
    if (error != null) {
      const msg = 'Could not exchange public_token!'
      console.log(msg + '\n' + JSON.stringify(error))
      return res.json({
        error: msg
      })
    }
    ACCESS_TOKEN = tokenResponse.access_token
    ITEM_ID = tokenResponse.item_id
    console.log('Access Token: ' + ACCESS_TOKEN)
    console.log('Item ID: ' + ITEM_ID)
    res.json({
      'error': false
    })
  })
})

router.get('/getClients', (req, res) => {
  return user.execute('getAllUsers', null)
    .then((response) => res.send(response))
    .catch((rej) => console.log('getClientsError: ', rej))
})

router.post('/addClient', (req, res) => {
  const params = {
    firstName: req.body.firstName,
    lastNAme: req.body.lastName,
    email: req.body.email,
    dob: req.body.dob
  }
  return user.execute('insertUser', params)
    .then((response) => {
      res.send(response)
    })
    .catch((rej) => {
      console.log(rej)
    })
})

router.post('/addAccount', async (req, res) => {
  const PUBLIC_TOKEN = req.body.public_token
  const plaidObjects = await Plaid.execute('getAccessToken', PUBLIC_TOKEN)
  if (plaidObjects.error) res.send(plaidObjects)
  const params = {
    ...plaidObjects,
    userID: req.body.userId
  }
  return user.execute('updateUser', plaidObjects)
    .then((response) => {
      res.send(response.userID)
    })
})


module.exports = router
