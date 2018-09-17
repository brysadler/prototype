const mongodb = require('mongodb')
const { Mongo } = require('config')

exports.execute = async (method, parameters) => {
  const mongoClient = mongodb.MongoClient
  const url = `${Mongo.url}${Mongo.dbName}`
  const client = await mongoClient.connect(url)
  // console.log('client: ', client)

  if (!client) {
    console.log('Error connecting to Mongo DB. Make sure it is up and running and the URL is correct')
  } else {
    console.log('connected to mongo db and ready to insert: ', parameters)
    switch (method) {
      case 'insert':
        return insert(client, parameters)
      case 'get':
        return get(client, parameters)
      case 'getAll':
        return getAll(client)
      default:
        console.log('job does not exist')
    }
  }
}

const insert = async (client, params) => {
  console.log('inserting client..')
  const result = await client.db(Mongo.dbName).collection('users').insertOne(params)
  if (!result) return Promise.resolve({ statusCode: 500, message: 'error inserting user'})
  return Promise.resolve({ statusCode: 200, message: 'success', userID: result.insertedId })
}

const get = (client, param) => {

}

const update = (client, params) => {
  const result = await client.db(Mongo.dbName).collection('users').
}

const getAll = async (client) => {
const users = await client.db(Mongo.dbName).collection('users').find({}).toArray()
if (users.length < 1) return Promise.resolve({ statusCode: 300, message: 'No users found in collection', users })
return Promise.resolve({ statusCode: 200, message: 'success', users })
}