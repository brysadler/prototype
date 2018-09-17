const MONGO = require('../utils/mongo')

exports.execute = (method, params) => {
  console.log('in user controller with params:', params)
  switch (method) {
    case 'insertUser':
      return MONGO.execute('insert', params)
    case 'updateUser':
      return MONGO.execute('update', params)
    case 'getUser':
      return MONGO.execute('get', params)
    case 'getAllUsers':
      return MONGO.execute('getAll', params)
    default:
      console.log('method does not exist')
  }
}