const express = require('express')
const bodyParser = require('body-parser')
const plaid = require('../utils/plaid')
const router = express.Router()
const user = require('../controller/user')

router.use(bodyParser.json())
router.use(bodyParser.urlencoded({extended: false}))
router.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
  next()
})

router.post('/addAccount', async (req, res) => {
  const PUBLIC_TOKEN = req.body.public_token
  const id = req.body.id
  const plaidObjects = await plaid.execute('getAccessToken', PUBLIC_TOKEN)
  if (plaidObjects.error) res.send(plaidObjects)
  const userObj = await user.execute('updateUser', { ...plaidObjects, id })
  delete userObj.accessTokens
  return res.send(userObj)
})

router.post('/login', async (req, res) => {
  const creds = req.body
  const userObj = await user.execute('validateUser', creds)
  const transactions = await plaid.execute('getTransactions', userObj)
  if (!userObj) return { statusCode: 500, message: 'Internal Server Error' }
  delete userObj.accessTokens
  return res.send({ ...userObj, ...transactions })
})

router.post('/register', async (req, res) => {
  const userInfo = req.body
  const userObj = await user.execute('insertUser', userInfo)
  if (!userObj) return { statusCode: 500, message: 'Internal Server Error' }
  delete userObj.accessTokens
  return res.send(userObj)
})

router.post('/getAccountDetails', async (req, res) => {
  const params = req.body
  const userObj = await user.execute('getUser', params)
  const transactions = await plaid.execute('getTransactions', userObj)
  if (!userObj) return { statusCode: 500, message: 'Internal Server Error' }
  delete userObj.accessToken
  return res.send({ ...userObj, ...transactions })
})

// router.post('/getTransactions', async (req, res) => {
//   const id = req.body.id
//   const transactions = await plaid.
// })


module.exports = router
