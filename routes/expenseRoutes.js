import express from 'express'
import Expense from '../models/Expense.js'
import { protect } from '../middleware/authMiddleware.js'

const router = express.Router()

// GET all expenses
router.get('/', protect, async (req, res) => {
  try {
    const expenses = await Expense.find().sort({ date: -1 })
    res.json(expenses)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// POST create expense
router.post('/', protect, async (req, res) => {
  try {
    const { category, amount, note, date } = req.body
    if (!category || amount === undefined || amount === null) {
      return res.status(400).json({ message: 'Category and amount are required' })
    }
    const expense = await Expense.create({
      category,
      amount: Number(amount),
      note: note || '',
      date: date || new Date(),
    })
    res.status(201).json(expense)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

// DELETE expense
router.delete('/:id', protect, async (req, res) => {
  try {
    const expense = await Expense.findByIdAndDelete(req.params.id)
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' })
    }
    res.json({ message: 'Expense deleted successfully' })
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

export default router
