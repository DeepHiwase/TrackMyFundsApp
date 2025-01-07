const { test, after, beforeEach, describe } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const bcrypt = require('bcrypt')

const helper = require('./test_helper')

const Transaction = require('../models/transaction')
const User = require('../models/user')

describe('when there are some transactions saved initially', () => {
  beforeEach(async () => {
    await Transaction.deleteMany({})
    await Transaction.insertMany(helper.initialTransactions)
  })

  test('transactions are returned as json', async () => {
    await api
      .get('/api/transactions')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('all transactions are returned', async () => {
    const response = await api.get('/api/transactions')

    assert.strictEqual(response.body.length, helper.initialTransactions.length)
  })

  test('the specific transaction is within the returned transactions', async () => {
    const response = await api.get('/api/transactions')

    const amounts = response.body.map((a) => a.amount)
    assert(amounts.includes(99))
  })

  describe('viewing a specific transaction', () => {
    test('succeeds with a valid id', async () => {
      const transactionsAtStart = await helper.transactionsInDb()

      const transactionToView = transactionsAtStart[0]

      const resultTransaction = await api
        .get(`/api/transactions/${transactionToView.id}`)
        .expect(200)
        .expect('Content-Type', /application\/json/)

      assert.deepStrictEqual(resultTransaction.body, transactionToView)
    })

    test('fails with statuscode 404 if transaction does not exist', async () => {
      const validNonexistingId = await helper.nonExistingId()

      await api.get(`/api/transactions/${validNonexistingId}`).expect(404)
    })

    test('fails with statuscode 400 id is invalid', async () => {
      const invalidId = '5a3d5da59070081a82a3445'

      await api.get(`/api/transactions/${invalidId}`).expect(400)
    })
  })

  describe('addition of a new transaction', () => {
    test('succeeds with valid data', async () => {
      const newTransaction = {
        amount: 300,
        sender: 'me',
        receiver: 'ajay',
        currency: 'rupee',
      }

      await api
        .post('/api/transactions')
        .send(newTransaction)
        .expect(201)
        .expect('Content-Type', /application\/json/)

      const transactionsAtEnd = await helper.transactionsInDb()
      assert.strictEqual(
        transactionsAtEnd.length,
        helper.initialTransactions.length + 1
      )

      const amounts = transactionsAtEnd.map((a) => a.amount)
      assert(amounts.includes(300))
    })

    test('fails with status code 400 if data invalid', async () => {
      const newTransaction = {
        sender: 'me',
        receiver: 'ajay',
        currency: 'rupee',
      }

      await api.post('/api/transactions').send(newTransaction).expect(400)

      const transactionsAtEnd = await helper.transactionsInDb()

      assert.strictEqual(
        transactionsAtEnd.length,
        helper.initialTransactions.length
      )
    })
  })

  describe('deletion of a transaction', () => {
    test('succeeds with status code 204 if id is valid', async () => {
      const transactionsAtStart = await helper.transactionsInDb()
      const transactionsToDelete = transactionsAtStart[0]

      await api
        .delete(`/api/transactions/${transactionsToDelete.id}`)
        .expect(204)

      const transactionsAtEnd = await helper.transactionsInDb()

      const amounts = transactionsAtEnd.map((a) => a.amount)
      assert(!amounts.includes(transactionsToDelete.amount))

      assert.strictEqual(
        transactionsAtEnd.length,
        helper.initialTransactions.length - 1
      )
    })
  })
})

describe('when there is initially one user in db', () => {
  beforeEach(async () => {
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('secret', 10)
    const user = new User({ username: 'root', passwordHash })

    await user.save()
  })

  test('creation succeeds with a fresh username', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'deep@gmail',
      name: 'Deep Hiwase',
      password: 'salainen',
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    assert.strictEqual(usersAtEnd.length, usersAtStart.length + 1)

    const usernames = usersAtEnd.map((u) => u.username)
    assert(usernames.includes(newUser.username))
  })

  test('creation fails with proper statuscode and message if username already taken', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'root',
      name: 'Superuser',
      password: 'salainen',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    assert(result.body.error.includes('expected `username` to be unique'))

    assert.strictEqual(usersAtEnd.length, usersAtStart.length)
  })
})

after(async () => {
  await mongoose.connection.close()
})
