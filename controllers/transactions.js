const transactionsRouter = require('express').Router()
const Transaction = require('../models/transaction')

transactionsRouter.get('/', async (req, res) => {
  const transactions = await Transaction.find({})
  res.json(transactions)
})

transactionsRouter.get('/:id', async (req, res) => {
  const transaction = await Transaction.findById(req.params.id)
  if (transaction) {
    res.json(transaction)
  } else {
    res.status(404).end()
  }
})

transactionsRouter.post('/', async (req, res) => {
  const body = req.body
  if (!body.amount || !body.sender || !body.receiver) {
    return res.status(400).json({
      error: 'amount, sender or receiver data missing',
    })
  }
  const transaction = new Transaction({
    amount: body.amount,
    sender: body.sender,
    receiver: body.receiver,
    currency: body.currency || 'rupee',
    done: Boolean(body.done) || true,
    important: Boolean(body.important) || false,
    date: new Date().toDateString(),
  })

  const savedTransaction = await transaction.save()
  res.status(201).json(savedTransaction)
})

transactionsRouter.delete('/:id', async (req, res) => {
  await Transaction.findByIdAndDelete(req.params.id)
  res.status(204).end()
})

transactionsRouter.put('/:id', (req, res, next) => {
  const body = req.body

  const transaction = {
    amount: body.amount,
    sender: body.sender,
    receiver: body.receiver,
    currency: body.currency || 'rupee',
    done: Boolean(body.done) || true,
    important: Boolean(body.important) || false,
    date: new Date().toDateString(),
  }

  Transaction.findByIdAndUpdate(req.params.id, transaction, {
    new: true,
    runValidators: true,
    context: 'query',
  })
    .then((updatedTransaction) => {
      res.json(updatedTransaction)
    })
    .catch((error) => next(error))
})

module.exports = transactionsRouter