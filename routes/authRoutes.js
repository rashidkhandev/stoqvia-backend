import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'

const router = express.Router()

const createToken = (user) => jwt.sign(
  { id: user._id, role: user.role },
  process.env.JWT_SECRET || 'stoqvia-secret',
  { expiresIn: '7d' }
)

export const seedAdmin = async () => {
  const exists = await User.findOne({ phone: '0300-0000000' })
  if (!exists) {
    const password = await bcrypt.hash('admin123', 10)
    await User.create({
      name: 'Rashid Ali',
      phone: '0300-0000000',
      password,
      role: 'Admin',
    })
    console.log('Seed admin created')
  }
}

router.post('/signup', async (req, res) => {
  try {
    const { name, phone, password } = req.body

    if (!name || !phone || !password) {
      return res.status(400).json({ message: 'Name, phone and password are required' })
    }

    const existing = await User.findOne({ phone })
    if (existing) {
      return res.status(409).json({ message: 'User already exists with this phone number' })
    }

    const hashed = await bcrypt.hash(password, 10)
    const user = await User.create({ name, phone, password: hashed, role: 'Staff' })

    return res.status(201).json({
      message: 'User created successfully',
      user: { id: user._id, name: user.name, phone: user.phone, role: user.role },
      token: createToken(user),
    })
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
})

router.post('/login', async (req, res) => {
  try {
    const { phone, password } = req.body

    if (!phone || !password) {
      return res.status(400).json({ message: 'Phone and password are required' })
    }

    const user = await User.findOne({ phone })
    if (!user) {
      return res.status(401).json({ message: 'Account not found' })
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid password' })
    }

    return res.json({
      message: 'Login successful',
      user: { id: user._id, name: user.name, phone: user.phone, role: user.role },
      token: createToken(user),
    })
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
})

router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization || ''
    const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null

    if (!token) {
      return res.status(401).json({ message: 'Token missing' })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'stoqvia-secret')
    const user = await User.findById(decoded.id).select('-password')

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    return res.json({ user })
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' })
  }
})

export default router
