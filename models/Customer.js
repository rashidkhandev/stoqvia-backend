import mongoose from 'mongoose'

const transactionSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['credit', 'payment'], required: true },
    amount: { type: Number, required: true },
    note: { type: String, default: '' },
    date: { type: Date, default: Date.now },
  },
  { _id: true }
)

const customerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, default: '' },
    address: { type: String, default: '' },
    transactions: [transactionSchema],
  },
  { timestamps: true }
)

export default mongoose.model('Customer', customerSchema)
