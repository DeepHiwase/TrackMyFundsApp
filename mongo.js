const mongoose = require('mongoose')

if (process.argv.length < 3) {
  console.log('give password as argument')
  process.exit(1)
}

const password = process.argv[2]

const url = `mongodb+srv://zackoverload:${password}@cluster0.6kmjq.mongodb.net/trackMyFundsApp?retryWrites=true&w=majority`

mongoose.set('strictQuery', false)

mongoose.connect(url)

const transactionSchema = new mongoose.Schema({
  amount: String,
  sender: String,
  receiver: String,
  currency: String,
  done: Boolean,
  important: Boolean,
  date: String,
})

const Transaction = mongoose.model('Transaction', transactionSchema)

// const transaction = new Transaction({
//   amount: "99",
//   sender: "rohit",
//   receiver: "me",
//   done: false
// })

// transaction.save().then(result => {
//   console.log('transaction saved!')
//   mongoose.connection.close()
// })

Transaction.find({}).then((result) => {
  result.forEach((transaction) => {
    console.log(transaction)
  })
  mongoose.connection.close()
})
