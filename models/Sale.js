import mongoose from 'mongoose'

const itemSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name: { type: String, required: true },
    qty: { type: Number, required: true },
    price: { type: Number, required: true },
    returnedQty: { type: Number, default: 0 },
  },
  { _id: false }
)

const returnSchema = new mongoose.Schema(
  {
    returnId: { type: String, required: true },
    date: { type: Date, default: Date.now },
    items: [
      {
        name: { type: String, required: true },
        qty: { type: Number, required: true },
        refundAmount: { type: Number, required: true },
      },
    ],
    refundTotal: { type: Number, required: true },
    reason: { type: String, default: '' },
    refundMethod: { type: String, default: 'cash' },
  },
  { _id: false }
)

const saleSchema = new mongoose.Schema(
  {
    invoiceId: { type: String, required: true, unique: true },
    branchId: { type: String, default: 'b1' },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
    customer: { type: String, default: 'Walk-in Customer' },
    items: [itemSchema],
    subtotal: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    total: { type: Number, required: true },
    payment: { type: String, default: 'cash' },
    cashReceived: { type: Number, default: 0 },
    changeDue: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['completed', 'partially_returned', 'returned', 'voided'],
      default: 'completed',
    },
    returns: [returnSchema],
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
)

export default mongoose.model('Sale', saleSchema)
