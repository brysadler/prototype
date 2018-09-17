const plaid = require('plaid')
const { Plaid } = require('config')

const client = new plaid.Client(
  Plaid.clientID,
  Plaid.secret,
  Plaid.publicKey,
  plaid.environments[Plaid.env]
)

exports.execute = (method, params) => {
  switch (method) {
    case 'getAccessToken':
      return getAccessToken(params)
    default:
      console.log('plaid:execute:methodDoesNotExist')
  }
}

function getAccessToken (publicToken) {
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