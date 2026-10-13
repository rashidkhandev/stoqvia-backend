import mongoose from 'mongoose'

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['Admin', 'Manager', 'Cashier', 'Staff'], default: 'Staff' },
  },
  { timestamps: true }
)

export default mongoose.model('User', userSchema)
