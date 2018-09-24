const mongodb = require('mongodb')
const ObjectId = require('mongodb').ObjectID
const { Mongo } = require('config')
const log = require('./bristol')

exports.execute = async (method, parameters) => {
  const mongoClient = mongodb.MongoClient
  const url = `${Mongo.url}${Mongo.dbName}`
  const client = await mongoClient.connect(url)

  if (!client) {
    console.log('Error connecting to Mongo DB. Make sure it is up and running and the URL is correct')
  } else {
    console.log('connected to mongo db with parameters: ', parameters)
    switch (method) {
      case 'insert':
        return insert(client, parameters)
      case 'get':
        return get(client, parameters)
      case 'validate':
        return validate(client, parameters)
      case 'getAll':
        return getAll(client)
      case 'update':
        return update(client, parameters)
      case 'bulkUpdate':
        return bulkUpdate(client, parameters)
      default:
        console.log('job does not exist')
    }
  }
}

const insert = async (client, params) => {
  const result = await client.db(Mongo.dbName).collection('users').insertOne(params)
  if (!result) return Promise.resolve({ statusCode: 500, message: 'error inserting user' })
  const user = result.ops[0]
  return Promise.resolve(
    {
      ...user,
      statusCode: 200,
      message: 'success',
    })
}

const bulkUpdate = async (client, users) => {
  let updatedLength = 0
  for (let i = 0; i < users.length; i++) {
    let user = users[i]
    let usrDone = await client.db(Mongo.dbName).collection('users').findOneAndUpdate({ _id: ObjectId(user._id) }, { $set:
        {
          current: user.current,
          toCharge: user.toCharge,
          lastUpdated: user.lastUpdated
        }
    })
    console.log(usrDone)
    if (usrDone.value) updatedLength++
  }
  log.info(`updated: ${updatedLength}/${users.length} documents in database`)
  return Promise.resolve('done')
}

const get = async (client, params) => {
  const user = await client.db(Mongo.dbName).collection('users').find(ObjectId(params.id)).toArray()
  if (user.length < 1) return Promise.resolve({ statusCode: 404, message: 'User not found.' })
  //delete user[0].accessTokens
  return Promise.resolve({
    ...user[0],
    statusCode: 200,
    message: 'success',
  })
}

const validate = async (client, params) => {
  const user = await client.db(Mongo.dbName).collection('users').find({ "email": params.email, "password": params.password }).toArray()
  if (user.length < 1) return Promise.resolve({ statusCode: 404, message: 'User not found' })
  //delete user[0].accessTokens
  return Promise.resolve({
    ...user[0],
    statusCode: 200,
    message: 'success',
  })
}

const update = async (client, params) => {
  let result
  const user = await exports.execute('get', params)
  if (user.accessTokens && !user.accessTokens.indexOf(params.accessToken) > -1) user.accessTokens.push(params.accessToken)
  result = await client.db(Mongo.dbName).collection('users').findOneAndUpdate({ _id:ObjectId(params.id) }, { $set: {accessTokens: user.accessTokens || [params.accessToken] } })
  if (result.value.length < 1) return Promise.resolve({ statusCode: 500, message: 'Unable to update user', user })
  //delete result.value.accessTokens
  return Promise.resolve({
    ...result.value,
    statusCode: 200,
    message: 'success',
  })
}

const getAll = async (client) => {
const users = await client.db(Mongo.dbName).collection('users').find({}).toArray()
if (users.length < 1) return Promise.resolve({ statusCode: 404, message: 'No users found in collection', users })
return Promise.resolve({ statusCode: 200, message: 'success', users })
}