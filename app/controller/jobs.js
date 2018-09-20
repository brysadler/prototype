const log = require('bristol')
const plaid = require('plaid')
const moment = require('moment')
const { Plaid } = require('config')
const process = require('./utils')
// const CronJob = require('cron').CronJob()

const client = new plaid.Client(
  Plaid.clientID,
  Plaid.secret,
  Plaid.publicKey,
  plaid.environments[Plaid.env]
)

exports.execute = (method, parameters) => {
  switch (method) {
    case 'start_job':
      start()
      break;
    default:
      log.info('index:execute:error:methodDoesnotExist', method)
  }
}

const getTransactionData = () => {
  const startDate = moment().subtract(30, 'days').format('YYYY-MM-DD')
  const endDate = moment().format('YYYY-MM-DD')
  return new Promise((resolve, reject) => {
    client.getTransactions(Plaid.accessToken, startDate, endDate, {
      count: 250,
      offset: 0,
    }, function(error, transactionsResponse) {
      if (error != null) {
        console.log(JSON.stringify(error))
      }
      //console.log('pulled ' + transactionsResponse.transactions.length + ' transactions');
      //console.log(transactionsResponse)

      return resolve(transactionsResponse.transactions)
    })
  })
}

const start = async () => {
  // getAccessToken()
  const transactionData = await getTransactionData()
  console.log(process.getTransactionChange(transactionData))
  // new CronJob('0 22 * * *', () => {
    //do stuff
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
