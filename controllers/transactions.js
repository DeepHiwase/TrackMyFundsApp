const transactionsRouter = require('express').Router()
const Transaction = require('../models/transaction')
const User = require('../models/user')
const jwt = require('jsonwebtoken')

const getTokenFrom = req => {
  const authorization = req.get('authorization')
  if (authorization && authorization.startsWith('Bearer ')) {
    return authorization.replace('Bearer ', '')
  }
  return null
}

transactionsRouter.get('/', async (req, res) => {
  const transactions = await Transaction.find({}).populate('user', { username: 1, name: 1 })
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
  const decodedToken = jwt.verify(getTokenFrom(req), process.env.SECRET)
  if (!decodedToken.id) {
    return res.status(401).json({ error: 'token invalid' })
  }

  const user = await User.findById(decodedToken.id)

  const transaction = new Transaction({
    amount: body.amount,
    sender: body.sender,
    receiver: body.receiver,
    currency: body.currency || 'rupee',
    done: Boolean(body.done) || true,
    important: Boolean(body.important) || false,
    date: new Date().toDateString(),
    user: user.id
  })

  const savedTransaction = await transaction.save()
  user.transactions = user.transactions.concat(savedTransaction._id)
  await user.save()
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