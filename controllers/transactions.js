const transactionsRouter = require('express').Router()
const Transaction = require('../models/transaction')

transactionsRouter.get('/', (req, res) => {
  Transaction.find({}).then(transactions => {
    res.json(transactions)
  })
})

transactionsRouter.get('/:id', (req, res, next) => {
  Transaction.findById(req.params.id)
    .then(transaction => {
      if (transaction) {
        res.json(transaction)
      } else {
        res.status(404).end()
      }
    })
    .catch(error => next(error))
})

transactionsRouter.post('/', (req, res, next) => {
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

  transaction
    .save()
    .then((savedTransaction) => {
      res.json(savedTransaction)
    })
    .catch((error) => next(error))
})

transactionsRouter.delete('/:id', (req, res, next) => {
  Transaction.findByIdAndDelete(req.params.id)
    .then(() => {
      res.status(204).end()
    })
    .catch((error) => next(error))
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