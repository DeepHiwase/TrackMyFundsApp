require('dotenv').config()
const express = require('express')
const Transaction = require('./models/transaction')
const app = express()

const requestLogger = (req, res, next) => {
  console.log('Method:', req.method)
  console.log('Path  :', req.path)
  console.log('Body  :', req.body)
  console.log('---')
  next()
}

const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: 'unknown endpoint' })
}

const errorHandler = (error, req, res, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return res.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return res.status(400).json({ error: error.message })
  }

  next(error)
}

app.use(express.json())
app.use(requestLogger)

app.get('/api/transactions', (req, res) => {
  Transaction.find({}).then((transactions) => {
    res.json(transactions)
  })
})

app.get('/api/transactions/:id', (req, res, next) => {
  Transaction.findById(req.params.id)
    .then((transaction) => {
      if (transaction) {
        res.json(transaction)
      } else {
        res.status(404).end()
      }
    })
    .catch((error) => next(error))
})

app.delete('/api/transactions/:id', (req, res, next) => {
  Transaction.findByIdAndDelete(req.params.id)
    .then(() => {
      res.status(204).end()
    })
    .catch((error) => next(error))
})

app.post('/api/transactions', (req, res, next) => {
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

app.put('/api/transactions/:id', (req, res, next) => {
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

app.use(unknownEndpoint)
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
