import express from 'express'
import Purchase from '../models/Purchase.js'
import Product from '../models/Product.js'
import Supplier from '../models/Supplier.js'
import { protect } from '../middleware/authMiddleware.js'

const router = express.Router()

// GET all purchases
router.get('/', protect, async (req, res) => {
  try {
    const purchases = await Purchase.find().sort({ date: -1 })
    res.json(purchases)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// POST create purchase
router.post('/', protect, async (req, res) => {
  try {
    const { poNumber, productId, productName, supplierId, supplierName, qty, amount, invoice, date } = req.body

    const qtyNum = Number(qty)
    const amountNum = Number(amount)

    if (!qtyNum || qtyNum <= 0) {
      return res.status(400).json({ message: 'Valid quantity is required' })
    }

    let finalProductName = productName
    let finalSupplierName = supplierName

    // If productId was provided, also optionally stockIn the product in DB
    if (productId) {
      const product = await Product.findById(productId)
      if (product) {
        finalProductName = product.name
        product.quantity = (product.quantity || 0) + qtyNum
        await product.save()
      }
    }

    // If supplierId was provided, also record purchase amount against supplier in DB
    if (supplierId) {
      const supplier = await Supplier.findById(supplierId)
      if (supplier) {
        finalSupplierName = supplier.name
        supplier.totalPurchases = (supplier.totalPurchases || 0) + amountNum
        await supplier.save()
      }
    }

    const count = await Purchase.countDocuments()
    const generatedPo = poNumber || `PO-${1001 + count}`

    const purchase = await Purchase.create({
      poNumber: generatedPo,
      productName: finalProductName || 'Product',
      supplierName: finalSupplierName || '-',
      qty: qtyNum,
      amount: amountNum,
      invoice: invoice || '-',
      date: date || new Date(),
    })

    res.status(201).json(purchase)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

export default router
