import express from 'express'
import Sale from '../models/Sale.js'
import Product from '../models/Product.js'
import Customer from '../models/Customer.js'
import StockMovement from '../models/StockMovement.js'
import { protect } from '../middleware/authMiddleware.js'

const router = express.Router()

// GET /api/sales
router.get('/', protect, async (req, res) => {
  try {
    const { branchId, limit = 100 } = req.query
    const filter = {}
    if (branchId && branchId !== 'all') {
      filter.branchId = branchId
    }

    const sales = await Sale.find(filter)
      .sort({ date: -1 })
      .limit(Number(limit))

    const mapped = sales.map((sale) => {
      const obj = sale.toObject()
      return {
        ...obj,
        id: obj.invoiceId || obj._id,
      }
    })
    res.json(mapped)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// POST /api/sales
router.post('/', protect, async (req, res) => {
  try {
    const {
      invoiceId,
      customerId,
      customer,
      items,
      subtotal,
      discount,
      total,
      payment,
      cashReceived,
      changeDue,
      branchId,
      date,
    } = req.body

    if (!items || !Array.isArray(items) || items.length === 0 || total === undefined) {
      return res.status(400).json({ message: 'Items array and total are required' })
    }

    const count = await Sale.countDocuments()
    const finalInvoiceId = invoiceId || `INV-${1043 + count}`

    // Check if sale with this invoiceId already exists (e.g. offline sync re-sent)
    let existing = await Sale.findOne({ invoiceId: finalInvoiceId })
    if (existing) {
      const obj = existing.toObject()
      return res.json({ ...obj, id: obj.invoiceId || obj._id })
    }

    const sale = await Sale.create({
      invoiceId: finalInvoiceId,
      branchId: branchId || 'b1',
      customerId: customerId || null,
      customer: customer || 'Walk-in Customer',
      items,
      subtotal: Number(subtotal || total),
      discount: Number(discount || 0),
      total: Number(total),
      payment: payment || 'cash',
      cashReceived: Number(cashReceived || total),
      changeDue: Number(changeDue || 0),
      date: date || new Date(),
    })

    // Log stock movements for each item
    for (const item of items) {
      try {
        const product = await Product.findOne({ name: item.name })
        if (product) {
          await StockMovement.create({
            productId: product._id,
            productName: item.name,
            type: 'sale',
            qty: Number(item.qty),
            branchId: branchId || 'b1',
            reason: `Sale ${finalInvoiceId}`,
            referenceId: finalInvoiceId,
            user: req.user?.name || 'Cashier',
            date: date || new Date(),
          })
        }
      } catch (err) {
        console.error('Stock movement logging error for sale item:', err.message)
      }
    }

    const obj = sale.toObject()
    return res.status(201).json({ ...obj, id: obj.invoiceId || obj._id })
  } catch (error) {
    return res.status(400).json({ message: error.message })
  }
})

// POST /api/sales/:id/return - Process sales return and restocking
router.post('/:id/return', protect, async (req, res) => {
  try {
    const { items: returnItems, reason, refundMethod } = req.body
    if (!returnItems || !Array.isArray(returnItems) || returnItems.length === 0) {
      return res.status(400).json({ message: 'Return items are required' })
    }

    const sale = await Sale.findOne({
      $or: [{ _id: req.params.id }, { invoiceId: req.params.id }],
    })

    if (!sale) {
      return res.status(404).json({ message: 'Sale invoice not found' })
    }

    let refundTotal = 0
    const processedReturns = []

    for (const retItem of returnItems) {
      const originalItem = sale.items.find((it) => it.name === retItem.name)
      if (!originalItem) continue

      const availableToReturn = originalItem.qty - (originalItem.returnedQty || 0)
      const qtyToReturn = Math.min(Number(retItem.qty), availableToReturn)
      if (qtyToReturn <= 0) continue

      const itemRefund = qtyToReturn * originalItem.price
      refundTotal += itemRefund
      originalItem.returnedQty = (originalItem.returnedQty || 0) + qtyToReturn

      processedReturns.push({
        name: originalItem.name,
        qty: qtyToReturn,
        refundAmount: itemRefund,
      })

      // Restock item in Product
      const product = await Product.findOne({ name: originalItem.name, branchId: sale.branchId })
      if (product) {
        product.quantity = Number(product.quantity || 0) + qtyToReturn
        await product.save()

        await StockMovement.create({
          productId: product._id,
          productName: product.name,
          type: 'return',
          qty: qtyToReturn,
          branchId: sale.branchId,
          reason: reason || `Return for ${sale.invoiceId}`,
          referenceId: sale.invoiceId,
          user: req.user?.name || 'Staff',
          date: new Date(),
        })
      }
    }

    if (processedReturns.length === 0) {
      return res.status(400).json({ message: 'No eligible items to return' })
    }

    // Check if fully returned or partially returned
    const allReturned = sale.items.every((it) => (it.returnedQty || 0) >= it.qty)
    sale.status = allReturned ? 'returned' : 'partially_returned'

    const returnId = `RET-${Date.now().toString().slice(-6)}`
    sale.returns.push({
      returnId,
      date: new Date(),
      items: processedReturns,
      refundTotal,
      reason: reason || 'Customer return',
      refundMethod: refundMethod || 'cash',
    })

    await sale.save()

    // If sale customer was registered and payment was credit, adjust balance
    if (sale.customerId && sale.payment === 'credit') {
      const customer = await Customer.findById(sale.customerId)
      if (customer) {
        customer.transactions.push({
          type: 'payment',
          amount: refundTotal,
          note: `Refund/Return adjustment for ${sale.invoiceId}`,
          date: new Date(),
        })
        await customer.save()
      }
    }

    res.status(200).json({
      success: true,
      message: 'Return processed successfully',
      returnId,
      refundTotal,
      sale,
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

export default router
