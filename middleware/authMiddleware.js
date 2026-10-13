import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import User from '../models/User.js'

export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || ''
    const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null

    if (!token) {
      return res.status(401).json({ message: 'Not authorized, token missing' })
    }

    // Gracefully handle demo/mock tokens (e.g. initial deployment, quick role switcher, offline sync)
    if (
      token === 'mock-jwt-owner' ||
      token.startsWith('demo-token-') ||
      token.startsWith('mock-') ||
      token.startsWith('offline-token-')
    ) {
      let demoUser = await User.findOne({ phone: '0300-0000000' })
      if (!demoUser) {
        demoUser = (await User.findOne({ role: 'Admin' })) || (await User.findOne())
      }
      if (!demoUser) {
        const hashedPassword = await bcrypt.hash('admin123', 10)
        demoUser = await User.create({
          name: 'Muhammad Rashid',
          phone: '0300-0000000',
          password: hashedPassword,
          role: 'Admin',
        })
      }
      req.user = demoUser
      return next()
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'stoqvia-secret')
    const user = await User.findById(decoded.id).select('-password')

    if (!user) {
      return res.status(401).json({ message: 'User not found' })
    }

    req.user = user
    next()
  } catch (error) {
    return res.status(401).json({ message: 'Not authorized, invalid token' })
  }
}
