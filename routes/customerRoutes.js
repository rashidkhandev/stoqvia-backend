import express from 'express'
import Customer from '../models/Customer.js'
import { protect } from '../middleware/authMiddleware.js'

const router = express.Router()

router.get('/', protect, async (req, res) => {
  try {
    const customers = await Customer.find().sort({ createdAt: -1 })
    const mapped = customers.map((customer) => {
      const transactions = (customer.transactions || []).map((t) => ({
        id: t._id,
        type: t.type,
        amount: t.amount,
        note: t.note,
        date: t.date,
      }))

      const totalCredit = transactions
        .filter((t) => t.type === 'credit')
        .reduce((sum, t) => sum + Number(t.amount || 0), 0)
      const totalPaid = transactions
        .filter((t) => t.type === 'payment')
        .reduce((sum, t) => sum + Number(t.amount || 0), 0)

      return {
        id: customer._id,
        _id: customer._id,
        name: customer.name,
        phone: customer.phone,
        address: customer.address,
        transactions,
        totalCredit,
        totalPaid,
        remainingBalance: totalCredit - totalPaid,
        createdAt: customer.createdAt,
        updatedAt: customer.updatedAt,
      }
    })

    res.json(mapped)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

router.post('/', protect, async (req, res) => {
  try {
    const customer = await Customer.create(req.body)
    res.status(201).json(customer)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

router.post('/:id/transaction', protect, async (req, res) => {
  try {
    const { type, amount, note, date } = req.body
    if (!type || !amount) {
      return res.status(400).json({ message: 'Type (credit/payment) and amount are required' })
    }

    const customer = await Customer.findById(req.params.id)
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' })
    }

    customer.transactions.unshift({
      type,
      amount: Number(amount),
      note: note || '',
      date: date || new Date(),
    })

    await customer.save()
    res.status(201).json(customer)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

router.put('/:id', protect, async (req, res) => {
  try {
    const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' })
    }
    return res.json(customer)
  } catch (error) {
    return res.status(400).json({ message: error.message })
  }
})

router.delete('/:id', protect, async (req, res) => {
  try {
    const customer = await Customer.findByIdAndDelete(req.params.id)
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' })
    }
    return res.json({ message: 'Customer deleted successfully' })
  } catch (error) {
    return res.status(400).json({ message: error.message })
  }
})

export default router
