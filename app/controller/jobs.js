const log = require('bristol')
const plaid = require('plaid')
const moment = require('moment')
const { Plaid } = require('config')
const process = require('../utils/index')
const Stripe = require('../utils/stripe')
const user = require('./user')
const CronJob = require('cron').CronJob


exports.execute = (method) => {
  const client = new plaid.Client(
    Plaid.clientID,
    Plaid.secret,
    Plaid.publicKey,
    plaid.environments[Plaid.env]
  )

  switch (method) {
    case 'start_job':
      return start(client)
    default:
      log.info('index:execute:error:methodDoesnotExist', method)
  }
}


const getTransactionData = async (client, user) => {
  const startDate = moment().subtract(1, 'days').format('YYYY-MM-DD')
  const endDate = moment().format('YYYY-MM-DD')
  let change = 0
  for (let i = 0; i < user.accessTokens.length; i++) {
    change = change + process.getTransactionChange(await callTransactions(client, user, user.accessTokens[i], startDate, endDate))
  }
  return Promise.resolve(change)
}

const callTransactions = (client, user, token, startDate, endDate) => {
  return new Promise((resolve, reject) => {
    client.getTransactions(token, startDate, endDate, {
      count: 250,
      offset: 0,
    }, function(error, transactionsResponse) {
      if (error != null) {
        console.log(JSON.stringify(error))
        reject(error)
      }
      resolve(transactionsResponse)
    })
  })
}

const start = (client) => {
  log.info('Starting Cron')
  new CronJob('0 22 * * *', async () => {
    const users = await user.execute('getAllUsers', null)
    let newUserObjects = []
    const userObjects = users.users
    for (let i = 0; i < userObjects.length; i++) {
      let usrChargeforToday = await getTransactionData(client, userObjects[i])
      newUserObjects.push({
        ...userObjects[i],
        current: usrChargeforToday < 5 ? usrChargeforToday : (5 - usrChargeforToday),
        toCharge: usrChargeforToday >= 5,
        lastUpdated: moment()
      })
    }

    const usersToCharge = newUserObjects.map((usr) => {
      if (usr.toCharge) return usr
    })
    return Stripe.execute('chargeClients', usersToCharge)
      .then((res) => {
        if (res.statusCode === 200) return Promise.all(user.execute('bulkUpdate', newUserObjects)).then(res => log.info('cron update of database table complete: ', res))
        return log.warn('Error Charging Users: ', res)
      })
      .catch((rej) => log.warn('Error Charging Users: ', rej))
  }, null, true, 'America/New_York')
}

