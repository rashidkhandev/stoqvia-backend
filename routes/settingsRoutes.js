import express from 'express'
import BusinessSettings from '../models/BusinessSettings.js'
import { protect } from '../middleware/authMiddleware.js'

const router = express.Router()

// GET /api/settings
router.get('/', protect, async (req, res) => {
  try {
    let settings = await BusinessSettings.findOne()
    if (!settings) {
      settings = await BusinessSettings.create({
        businessName: 'STOQVIA Retail',
        tagline: 'Smart Inventory. Smarter Business.',
        phone: '0300-0000000',
        email: 'contact@stoqvia.com',
        address: 'Karachi, Pakistan',
        currency: 'Rs',
        taxRate: 0,
        lowStockThreshold: 10,
        theme: 'light',
      })
    }
    res.json(settings)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// PUT /api/settings
router.put('/', protect, async (req, res) => {
  try {
    let settings = await BusinessSettings.findOne()
    if (!settings) {
      settings = await BusinessSettings.create(req.body)
    } else {
      Object.assign(settings, req.body)
      await settings.save()
    }
    res.json(settings)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

export default router
