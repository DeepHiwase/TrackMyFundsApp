const Transaction = require('../models/transaction')
const User = require('../models/user')

const initialTransactions = [
  {
    amount: '99',
    sender: 'rohit',
    receiver: 'me',
    done: false,
  },
  {
    amount: '9900000',
    sender: 'salman',
    receiver: 'me',
    done: true,
    important: false,
  },
]

const nonExistingId = async () => {
  const transaction = new Transaction({
    amount: '100',
    sender: 'alba',
    receiver: 'me',
    done: false,
  })
  await transaction.save()
  await transaction.deleteOne()

  return transaction._id.toString()
}

const transactionsInDb = async () => {
  const transactions = await Transaction.find({})
  return transactions.map((transaction) => transaction.toJSON())
}

const usersInDb = async () => {
  const users = await User.find({})
  return users.map(u => u.toJSON())
}

module.exports = {
  initialTransactions,
  nonExistingId,
  transactionsInDb,
  usersInDb
}
