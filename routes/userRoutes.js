import express from 'express'
import bcrypt from 'bcryptjs'
import User from '../models/User.js'
import { protect } from '../middleware/authMiddleware.js'

const router = express.Router()

// GET all users
router.get('/', protect, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: 1 })
    res.json(users.map((u) => ({
      id: u._id,
      name: u.name,
      phone: u.phone,
      role: u.role,
    })))
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// POST create user (Admin action)
router.post('/', protect, async (req, res) => {
  try {
    const { name, phone, password, role } = req.body
    if (!name || !phone) {
      return res.status(400).json({ message: 'Name and phone are required' })
    }

    const existing = await User.findOne({ phone })
    if (existing) {
      return res.status(409).json({ message: 'User already exists with this phone number' })
    }

    const rawPassword = password || '123456'
    const hashedPassword = await bcrypt.hash(rawPassword, 10)

    const user = await User.create({
      name,
      phone,
      password: hashedPassword,
      role: role || 'Staff',
    })

    res.status(201).json({
      id: user._id,
      name: user.name,
      phone: user.phone,
      role: user.role,
    })
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

// PUT update user (name, phone, role)
router.put('/:id', protect, async (req, res) => {
  try {
    const { name, phone, role, password } = req.body
    const updateData = {}
    if (name) updateData.name = name
    if (phone) updateData.phone = phone
    if (role) updateData.role = role
    if (password) {
      updateData.password = await bcrypt.hash(password, 10)
    }

    const user = await User.findByIdAndUpdate(req.params.id, updateData, { new: true }).select('-password')
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    res.json({
      id: user._id,
      name: user.name,
      phone: user.phone,
      role: user.role,
    })
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

// DELETE user
router.delete('/:id', protect, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }
    res.json({ message: 'User deleted successfully' })
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

export default router
