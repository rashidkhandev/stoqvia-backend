import express from 'express'
import Product from '../models/Product.js'
import { protect } from '../middleware/authMiddleware.js'

const router = express.Router()

router.get('/', protect, async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 })
    res.json(products)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

router.post('/', protect, async (req, res) => {
  try {
    const product = await Product.create(req.body)
    res.status(201).json(product)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

router.post('/bulk', protect, async (req, res) => {
  try {
    const products = req.body
    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ message: 'Array of products is required' })
    }
    const created = await Product.insertMany(products)
    res.status(201).json(created)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

router.put('/:id', protect, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!product) {
      return res.status(404).json({ message: 'Product not found' })
    }
    return res.json(product)
  } catch (error) {
    return res.status(400).json({ message: error.message })
  }
})

router.delete('/:id', protect, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id)
    if (!product) {
      return res.status(404).json({ message: 'Product not found' })
    }
    return res.json({ message: 'Product deleted successfully' })
  } catch (error) {
    return res.status(400).json({ message: error.message })
  }
})

export default router
