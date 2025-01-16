const router = require('express').Router()
const Transaction = require('../models/transaction')
const User = require('../models/user')

router.post('/reset', async (req, res) => {
  await Transaction.deleteMany({})
  await User.deleteMany({})

  res.status(204).end()
})

module.exports = router