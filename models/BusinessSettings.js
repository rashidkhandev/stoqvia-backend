import mongoose from 'mongoose'

const businessSettingsSchema = new mongoose.Schema(
  {
    businessName: { type: String, default: 'STOQVIA Retail' },
    tagline: { type: String, default: 'Smart Inventory. Smarter Business.' },
    phone: { type: String, default: '0300-0000000' },
    email: { type: String, default: 'contact@stoqvia.com' },
    address: { type: String, default: 'Karachi, Pakistan' },
    currency: { type: String, default: 'Rs' },
    timezone: { type: String, default: 'Asia/Karachi' },
    taxRate: { type: Number, default: 0 },
    lowStockThreshold: { type: Number, default: 10 },
    invoicePrefix: { type: String, default: 'INV-' },
    theme: { type: String, enum: ['light', 'dark'], default: 'light' },
  },
  { timestamps: true }
)

export default mongoose.model('BusinessSettings', businessSettingsSchema)
