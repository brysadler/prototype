exports.getTransactionChange = (transactionData) => {
  return transactionData.map((trans) => {
    if (trans.amount < 0.01) return 0
    const roundedUp = Math.ceil(trans.amount)
    return parseFloat((roundedUp - trans.amount).toFixed(2))
  })
    .reduce((acc, curr) => acc + curr, 0)
}
