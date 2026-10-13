import mongoose from 'mongoose'

const expenseSchema = new mongoose.Schema(
  {
    category: { type: String, required: true, trim: true },
    amount: { type: Number, required: true },
    note: { type: String, default: '', trim: true },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
)

export default mongoose.model('Expense', expenseSchema)
