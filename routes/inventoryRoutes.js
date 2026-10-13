import express from 'express'
import Product from '../models/Product.js'
import StockMovement from '../models/StockMovement.js'
import { protect } from '../middleware/authMiddleware.js'

const router = express.Router()

// GET /api/inventory/movements
router.get('/movements', protect, async (req, res) => {
  try {
    const { branchId, limit = 50 } = req.query
    const filter = {}
    if (branchId && branchId !== 'all') {
      filter.$or = [{ branchId }, { targetBranchId: branchId }]
    }

    const movements = await StockMovement.find(filter)
      .sort({ date: -1 })
      .limit(Number(limit))

    res.json(movements)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// POST /api/inventory/adjust - Stock In / Stock Out / Adjustment
router.post('/adjust', protect, async (req, res) => {
  try {
    const { productId, type, qty, reason, branchId } = req.body
    const qtyNum = Number(qty)

    if (!productId || !type || !qtyNum || qtyNum <= 0) {
      return res.status(400).json({ message: 'Product ID, valid type, and quantity are required' })
    }

    const product = await Product.findById(productId)
    if (!product) {
      return res.status(404).json({ message: 'Product not found' })
    }

    const currentQty = Number(product.quantity || 0)
    let nextQty = currentQty

    if (type === 'in') {
      nextQty = currentQty + qtyNum
    } else if (type === 'out' || type === 'damaged') {
      if (currentQty < qtyNum) {
        return res.status(400).json({ message: `Insufficient stock: only ${currentQty} ${product.unit || 'units'} available` })
      }
      nextQty = currentQty - qtyNum
    } else if (type === 'adjustment') {
      // Direct override
      nextQty = qtyNum
    } else {
      return res.status(400).json({ message: 'Invalid movement type' })
    }

    product.quantity = nextQty
    await product.save()

    const movement = await StockMovement.create({
      productId: product._id,
      productName: product.name,
      type: type === 'damaged' ? 'out' : type,
      qty: type === 'adjustment' ? Math.abs(nextQty - currentQty) : qtyNum,
      branchId: branchId || product.branchId || 'b1',
      reason: reason || (type === 'in' ? 'Stock received' : 'Inventory adjustment'),
      user: req.user?.name || 'Staff',
      date: new Date(),
    })

    res.status(201).json({
      success: true,
      product,
      movement,
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// POST /api/inventory/transfer - Transfer between branches
router.post('/transfer', protect, async (req, res) => {
  try {
    const { productId, fromBranchId, toBranchId, qty, note } = req.body
    const qtyNum = Number(qty)

    if (!productId || !fromBranchId || !toBranchId || !qtyNum || qtyNum <= 0) {
      return res.status(400).json({ message: 'Valid productId, source, target branch, and quantity are required' })
    }

    if (fromBranchId === toBranchId) {
      return res.status(400).json({ message: 'Source and target branches must be different' })
    }

    const sourceProduct = await Product.findById(productId)
    if (!sourceProduct) {
      return res.status(404).json({ message: 'Product not found' })
    }

    if (Number(sourceProduct.quantity || 0) < qtyNum) {
      return res.status(400).json({ message: `Insufficient stock in branch ${fromBranchId}: only ${sourceProduct.quantity} available` })
    }

    // Deduct from source
    sourceProduct.quantity = Number(sourceProduct.quantity) - qtyNum
    await sourceProduct.save()

    // Find or create in target branch
    let targetProduct = await Product.findOne({
      sku: sourceProduct.sku,
      branchId: toBranchId,
    })

    if (targetProduct) {
      targetProduct.quantity = Number(targetProduct.quantity || 0) + qtyNum
      await targetProduct.save()
    } else {
      targetProduct = await Product.create({
        branchId: toBranchId,
        name: sourceProduct.name,
        sku: sourceProduct.sku,
        barcode: sourceProduct.barcode,
        category: sourceProduct.category,
        unit: sourceProduct.unit,
        purchasePrice: sourceProduct.purchasePrice,
        sellingPrice: sourceProduct.sellingPrice,
        quantity: qtyNum,
        minStock: sourceProduct.minStock,
        image: sourceProduct.image,
      })
    }

    // Record movement
    const movement = await StockMovement.create({
      productId: sourceProduct._id,
      productName: sourceProduct.name,
      type: 'transfer',
      qty: qtyNum,
      branchId: fromBranchId,
      targetBranchId: toBranchId,
      reason: note || `Transferred from ${fromBranchId} to ${toBranchId}`,
      user: req.user?.name || 'Staff',
      date: new Date(),
    })

    res.status(201).json({
      success: true,
      sourceProduct,
      targetProduct,
      movement,
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

export default router
