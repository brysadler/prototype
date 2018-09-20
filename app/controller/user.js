const MONGO = require('../utils/mongo')

exports.execute = (method, params) => {
  console.log('in user controller with params:', params)
  switch (method) {
    case 'insertUser':
      /*
      * first name
      * last name
      * email
      * password
      * dob
      * */
      return MONGO.execute('insert', params)
    case 'getUser':
      return MONGO.execute('get', params)
    case 'updateUser':
      return MONGO.execute('update', params)
    case 'validateUser':
      return MONGO.execute('validate', params)
    case 'bulkUpdate':
      return MONGO.execute('bulkUpdate', params)
    case 'getAllUsers':
      return MONGO.execute('getAll', params)
    default:
      console.log('method does not exist')
  }
}