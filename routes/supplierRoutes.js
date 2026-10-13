import express from 'express'
import Supplier from '../models/Supplier.js'
import { protect } from '../middleware/authMiddleware.js'

const router = express.Router()

// GET all suppliers
router.get('/', protect, async (req, res) => {
  try {
    const suppliers = await Supplier.find().sort({ createdAt: -1 })
    res.json(suppliers)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// POST create supplier
router.post('/', protect, async (req, res) => {
  try {
    const { name, phone, company, address } = req.body
    if (!name) {
      return res.status(400).json({ message: 'Supplier name is required' })
    }
    const supplier = await Supplier.create({
      name,
      phone: phone || '',
      company: company || '',
      address: address || '',
      totalPurchases: Number(req.body.totalPurchases || 0),
      paidAmount: Number(req.body.paidAmount || 0),
    })
    res.status(201).json(supplier)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

// PUT update supplier
router.put('/:id', protect, async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found' })
    }
    res.json(supplier)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

// DELETE supplier
router.delete('/:id', protect, async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndDelete(req.params.id)
    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found' })
    }
    res.json({ message: 'Supplier deleted successfully' })
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

// POST record purchase against supplier (increments totalPurchases)
router.post('/:id/purchase', protect, async (req, res) => {
  try {
    const amount = Number(req.body.amount || 0)
    if (amount <= 0) {
      return res.status(400).json({ message: 'Positive amount is required' })
    }
    const supplier = await Supplier.findById(req.params.id)
    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found' })
    }
    supplier.totalPurchases = (supplier.totalPurchases || 0) + amount
    await supplier.save()
    res.json(supplier)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

// POST record payment to supplier (increments paidAmount)
router.post('/:id/payment', protect, async (req, res) => {
  try {
    const amount = Number(req.body.amount || 0)
    if (amount <= 0) {
      return res.status(400).json({ message: 'Positive amount is required' })
    }
    const supplier = await Supplier.findById(req.params.id)
    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found' })
    }
    supplier.paidAmount = (supplier.paidAmount || 0) + amount
    await supplier.save()
    res.json(supplier)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

export default router
