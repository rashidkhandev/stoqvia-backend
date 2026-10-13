import mongoose from 'mongoose'

const productSchema = new mongoose.Schema(
  {
    branchId: { type: String, required: true, default: 'b1' },
    name: { type: String, required: true, trim: true },
    sku: { type: String, required: true, trim: true },
    barcode: { type: String, default: '' },
    category: { type: String, default: '' },
    unit: { type: String, default: '' },
    purchasePrice: { type: Number, default: 0 },
    sellingPrice: { type: Number, default: 0 },
    quantity: { type: Number, default: 0 },
    minStock: { type: Number, default: 0 },
    image: { type: String, default: '' },
  },
  { timestamps: true }
)

export default mongoose.model('Product', productSchema)
