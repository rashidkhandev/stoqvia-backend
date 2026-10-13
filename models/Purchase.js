import mongoose from 'mongoose'

const purchaseSchema = new mongoose.Schema(
  {
    poNumber: { type: String, required: true, trim: true },
    productName: { type: String, required: true, trim: true },
    supplierName: { type: String, default: '-', trim: true },
    qty: { type: Number, required: true },
    amount: { type: Number, required: true },
    invoice: { type: String, default: '-', trim: true },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
)

export default mongoose.model('Purchase', purchaseSchema)
