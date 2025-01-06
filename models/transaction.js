const mongoose = require('mongoose')

const transactionSchema = new mongoose.Schema({
  amount: {
    type: Number,
    min: [1, 'Amount is less'],
    required: true,
  },
  sender: {
    type: String,
    minLength: 2,
    required: true,
  },
  receiver: {
    type: String,
    minLength: 2,
    required: true,
  },
  currency: String,
  done: Boolean,
  important: Boolean,
  date: String,
})

transactionSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  },
})

module.exports = mongoose.model('Transaction', transactionSchema)
