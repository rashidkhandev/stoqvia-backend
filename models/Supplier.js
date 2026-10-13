import mongoose from 'mongoose'

const supplierSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, default: '', trim: true },
    company: { type: String, default: '', trim: true },
    address: { type: String, default: '', trim: true },
    totalPurchases: { type: Number, default: 0 },
    paidAmount: { type: Number, default: 0 },
  },
  { timestamps: true }
)

export default mongoose.model('Supplier', supplierSchema)
