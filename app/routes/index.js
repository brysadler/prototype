const express = require('express')
// const plaid = require('plaid')
const Plaid = require('../utils/plaid')
const router = express.Router()
const user = require('../controller/user')

// router.get('/', function(req, res, next) {
//   console.log('route hit')
//   res.render('main')
// })

// router.post('/get_access_token', (req, res) => {
//   console.log('getting access token')
//   PUBLIC_TOKEN = req.body.public_token
//   client.exchangePublicToken(PUBLIC_TOKEN, (error, tokenResponse) => {
//     if (error != null) {
//       const msg = 'Could not exchange public_token!'
//       console.log(msg + '\n' + JSON.stringify(error))
//       return res.json({
//         error: msg
//       })
//     }
//     ACCESS_TOKEN = tokenResponse.access_token
//     ITEM_ID = tokenResponse.item_id
//     console.log('Access Token: ' + ACCESS_TOKEN)
//     console.log('Item ID: ' + ITEM_ID)
//     res.json({
//       'error': false
//     })
//   })
// })

router.post('/addAccount', async (req, res) => {
  const PUBLIC_TOKEN = req.body.public_token
  const id = req.body.id
  const plaidObjects = await Plaid.execute('getAccessToken', PUBLIC_TOKEN)
  if (plaidObjects.error) res.send(plaidObjects)
  return user.execute('updateUser', { ...plaidObjects, id })
    .then((response) => response)
})

router.post('/login', async (req, res) => {
  const creds = req.body
  const userObj = await user.execute('validateUser', creds)
  if (!userObj) return { statusCode: 500, message: 'Internal Server Error' }
  res.send(userObj)
})

router.post('/register', async (req, res) => {
  const userInfo = req.body
  const userObj = await user.execute('insertUser', userInfo)
  if (!userObj) return { statusCode: 500, message: 'Internal Server Error' }
  res.send(userObj)
})

router.post('/getAccountDetails', async (req, res) => {
  const id = req.body.id
  const userObj = await user.execute('getUser', id)
  if (!userObj) return { statusCode: 500, message: 'Internal Server Error' }
  res.send(userObj)
})

// router.post('/getTransactions', async (req, res) => {
//   const id = req.body.id
//   const transactions = await plaid.
// })


module.exports = router
