const log = require('bristol')
const plaid = require('plaid')
const moment = require('moment')
const { Plaid } = require('config')
const process = require('../utils/index')
const Stripe = require('../utils/stripe')
// const CronJob = require('cron').CronJob()
// return user.execute('getAllUsers', null)
//   .then((response) => res.send(response))
//   .catch((rej) => console.log('getClientsError: ', rej))

exports.execute = (method) => {
  const client = new plaid.Client(
    Plaid.clientID,
    Plaid.secret,
    Plaid.publicKey,
    plaid.environments[Plaid.env]
  )

  switch (method) {
    case 'start_job':
      start(client)
      break;
    default:
      log.info('index:execute:error:methodDoesnotExist', method)
  }
}


const getTransactionData = (client, user) => {
  const startDate = moment().subtract(1, 'days').format('YYYY-MM-DD')
  const endDate = moment().format('YYYY-MM-DD')
  let toCharge = 0
  for (let i = 0; i < user.accessToken.length; i++) {
    client.getTransactions(Plaid.accessToken, startDate, endDate, {
      count: 250,
      offset: 0,
    }, function(error, transactionsResponse) {
      if (error != null) {
        console.log(JSON.stringify(error))
      }
      toCharge = toCharge + process.getTransactionChange(transactionsResponse.transactions)
    })
  }

  Promise.resolve(toCharge)
}

// get all users
// loop through each user's access tokens and get their transactions
// get the amount of change
// get the 5 dollar charge limit
// add those fields to user object
// add lastUpdTimestamp
// update user
const start = async (client) => {
  // new CronJob('0 22 * * *', () => {
    const users = await user.execute('getAllUsers', null)
    //each user has multiple access tokens so we need to pass them in
    const newUserObjects = users.map(async (usr) => {
      const chargeForToday = await getTransactionData(client, usr)
      return {
        ...usr,
        current: chargeForToday < 5 ? chargeForToday : (5 - chargeForToday),
        toCharge: chargeForToday >= 5,
        lastUpdated: moment()
      }
    })
    // now we have an array updated user items that we need to re-write the db
    // before updating the table we need to hit stripe to actually make the charges
    const usersToCharge = newUserObjects.map((usr) => {
      if (usr.toCharge) return usr
    })
    return Stripe.execute('chargeClients', usersToCharge)
      .then((res) => {
        if (res.statusCode === 200) return Promise.all(users.execute('bulkUpdate', newUserObjects)).then(res => log.info('cron update of database table complete: ', res))
        return log.warn('Error Charging Users: ', res)
      })
      .catch((rej) => log.warn('Error Charging Users: ', rej))
  // }, null, true, 'America/New_York')
}



function getAccessToken () {
  client.exchangePublicToken(Plaid.publicToken, (error, tokenResponse) => {
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
  })
}
