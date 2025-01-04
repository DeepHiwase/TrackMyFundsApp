const express = require('express')
const app = express()

let transactions = [
  {
    id: "1",
    amount: "4000",
    sender: 'me',
    receiver: 'rohit',
    currency: 'rupee',
    done: true,
    important: true,
    date: '22/12/22'
  },
  {
    id: "2",
    amount: "5000",
    sender: 'rohit',
    receiver: 'me',
    currency: 'rupee',
    done: true,
    important: false,
    date: '01/12/22'
  },
  {
    id: "3",
    amount: "400",
    sender: 'me',
    receiver: 'rohit',
    currency: 'rupee',
    done: true,
    important: true,
    date: '22/2/22'
  },
]

const generateId = () => {
  const maxId = transactions.length > 0
    ? Math.max(...transactions.map(n => Number(n.id))) 
    : 0
  return String(maxId + 1)
}

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

app.use(express.json())
app.use(requestLogger)

app.get('/', (req, res) => {
  res.send('<h1>Hello User!</h1>')
})

app.get('/api/transactions', (req, res) => {
  res.json(transactions)
})

app.get('/api/transactions/:id', (req, res) => {
  const id = req.params.id
  const transaction = transactions.find(transaction => transaction.id === id)
  if (transaction) {
    res.json(transaction)
  } else {
    res.status(404).end()
  }
})

app.delete('/api/transactions/:id', (req, res) => {
  const id = req. params.id
  transactions = transactions.filter(transaction => transaction.id !== id)
  res.status(204).end()
})

app.post('/api/transactions', (req, res) => {
  const body = req.body
  if (!body.amount || !body.sender || !body.receiver) {
    return res.status(400).json({
      error: 'amount, sender or receiver data missing'
    })
  }
  const transaction = {
    id: generateId(),
    amount: body.amount,
    sender: body.sender,
    receiver: body.receiver,
    currency: body.currency || 'rupee',
    done: Boolean(body.done) || true,
    important: Boolean(body.important) || false,
    date: new Date().toDateString(),
  }
  
  transactions = transactions.concat(transaction)
  res.json(transaction)
})

app.use(unknownEndpoint)

const PORT = 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})