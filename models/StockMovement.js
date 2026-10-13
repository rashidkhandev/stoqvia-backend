import mongoose from 'mongoose'

const stockMovementSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    productName: { type: String, required: true },
    type: {
      type: String,
      enum: ['in', 'out', 'adjustment', 'transfer', 'sale', 'return'],
      required: true,
    },
    qty: { type: Number, required: true },
    branchId: { type: String, default: 'b1' },
    targetBranchId: { type: String, default: null },
    reason: { type: String, default: '' },
    referenceId: { type: String, default: '' },
    user: { type: String, default: 'Admin' },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
)

export default mongoose.model('StockMovement', stockMovementSchema)
