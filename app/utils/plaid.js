const plaid = require('plaid')
const moment = require('moment')
const { Plaid } = require('config')

exports.execute = (method, params) => {
  const client = new plaid.Client(
    Plaid.clientID,
    Plaid.secret,
    Plaid.publicKey,
    plaid.environments[Plaid.env]
  )

  switch (method) {
    case 'getAccessToken':
      return getAccessToken(params, client)
    case 'getTransactions':
      return getTransactionData(params, client)
    default:
      console.log('plaid:execute:methodDoesNotExist')
  }
}

function getAccessToken (publicToken, client) {
  return new Promise((resolve) => {
    client.exchangePublicToken(publicToken, (error, tokenResponse) => {
      if (error != null) {
        const msg = 'Could not exchange public_token!'
        console.log('resolving error')
        resolve({error})
      }
      const ACCESS_TOKEN = tokenResponse.access_token
      const ITEM_ID = tokenResponse.item_id
      if (!ACCESS_TOKEN || !ITEM_ID) return {}
      resolve({ accessToken: ACCESS_TOKEN, itemID: ITEM_ID })
    })
  })
}

const getTransactionData = async (user, client) => {
  if (user.statusCode === 404) return false
  const startDate = moment().subtract(1, 'days').format('YYYY-MM-DD')
  const endDate = moment().format('YYYY-MM-DD')
  let transactions = []
  console.log(user)
  for (let i = 0; i < user.accessTokens.length; i++) {
    transactions.push(await getTransactions(client, user, user.accessTokens[i], startDate, endDate))
  }
  return Promise.resolve(transactions)
}

function getTransactions (client, user, token, startDate, endDate) {
  return new Promise((resolve, reject) => {
    client.getTransactions(token, startDate, endDate, {
      count: 250,
      offset: 0,
    }, function(error, transactionsResponse) {
      if (error != null) {
        console.log(JSON.stringify(error))
        reject(error)
      }
      resolve(transactionsResponse.transactions)
    })
  })
}