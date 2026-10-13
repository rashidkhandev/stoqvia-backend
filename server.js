import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import morgan from 'morgan'
import mongoose from 'mongoose'
import connectDB from './config/db.js'
import { seedDatabase } from './config/seed.js'
import authRoutes from './routes/authRoutes.js'
import userRoutes from './routes/userRoutes.js'
import productRoutes from './routes/productRoutes.js'
import customerRoutes from './routes/customerRoutes.js'
import supplierRoutes from './routes/supplierRoutes.js'
import expenseRoutes from './routes/expenseRoutes.js'
import purchaseRoutes from './routes/purchaseRoutes.js'
import saleRoutes from './routes/saleRoutes.js'
import dashboardRoutes from './routes/dashboardRoutes.js'
import inventoryRoutes from './routes/inventoryRoutes.js'
import settingsRoutes from './routes/settingsRoutes.js'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.resolve(__dirname, '.env') })
dotenv.config()

const app = express()
const PORT = Number(process.env.PORT) || 5001

const clientUrls = (process.env.CLIENT_URL || '')
  .split(',')
  .map((u) => u.trim().replace(/\/+$/, ''))
  .filter(Boolean)

app.use(cors({
  origin: (origin, callback) => {
    // Allow server-to-server or tools without origin (curl, Postman)
    if (!origin) return callback(null, true)

    const cleanOrigin = origin.replace(/\/+$/, '')
    const isLocalhost = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(cleanOrigin)
    const isVercel = /\.vercel\.app$/.test(cleanOrigin)
    const isClientAllowed = clientUrls.length === 0 || clientUrls.includes(cleanOrigin)

    if (isLocalhost || isVercel || isClientAllowed) {
      return callback(null, true)
    }

    return callback(null, true)
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))

app.options('*', cors())

app.use(express.json())
app.use(morgan('dev'))

app.get(['/', '/api'], (req, res) => {
  const isDbConnected = mongoose.connection.readyState === 1
  res.json({
    ok: true,
    message: 'STOQVIA Backend API is running successfully',
    database: isDbConnected ? 'Connected' : 'Disconnected',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      users: '/api/users',
      products: '/api/products',
      customers: '/api/customers',
      suppliers: '/api/suppliers',
      expenses: '/api/expenses',
      purchases: '/api/purchases',
      sales: '/api/sales',
      dashboard: '/api/dashboard',
    },
  })
})

app.get(['/health', '/api/health'], (req, res) => {
  const isDbConnected = mongoose.connection.readyState === 1
  res.status(isDbConnected ? 200 : 503).json({
    ok: isDbConnected,
    message: isDbConnected ? 'STOQVIA backend is running' : 'Database connecting or unavailable',
    dbStatus: isDbConnected ? 'Connected' : 'Disconnected',
  })
})

app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/products', productRoutes)
app.use('/api/customers', customerRoutes)
app.use('/api/suppliers', supplierRoutes)
app.use('/api/expenses', expenseRoutes)
app.use('/api/purchases', purchaseRoutes)
app.use('/api/sales', saleRoutes)
app.use('/api/dashboard', dashboardRoutes)
app.use('/api/inventory', inventoryRoutes)
app.use('/api/settings', settingsRoutes)

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err)
  res.status(err.statusCode || 500).json({
    message: err.message || 'Internal Server Error',
  })
})

const startServer = () => {
  app.listen(PORT, '0.0.0.0', async () => {
    console.log(`STOQVIA backend running on http://0.0.0.0:${PORT}`)
    try {
      const connected = await connectDB()
      if (connected) {
        await seedDatabase().catch((err) => console.error('Seed database failed:', err.message))
      }
    } catch (err) {
      console.error('Database initialization error:', err.message)
    }
  })
}

startServer()
