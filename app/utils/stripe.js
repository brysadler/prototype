exports.execute = (method, parameters) => {
  switch (method) {
    case 'chargeClients':
      return chargeClients(parameters)
  }
}

const chargeClients = (clients) => {
  console.log(`charging: ${clients}`)
  return Promise.resolve({statusCode: 200})
}