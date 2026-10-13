import express from 'express'
import Product from '../models/Product.js'
import Customer from '../models/Customer.js'
import Sale from '../models/Sale.js'
import Expense from '../models/Expense.js'
import Supplier from '../models/Supplier.js'
import { protect } from '../middleware/authMiddleware.js'

const router = express.Router()

const getSummary = async (req, res) => {
  try {
    const [products, customers, sales, expenses, suppliers] = await Promise.all([
      Product.find(),
      Customer.find(),
      Sale.find(),
      Expense.find(),
      Supplier.find(),
    ])

    const totalProducts = products.length
    const totalSales = sales.reduce((sum, sale) => sum + Number(sale.total || 0), 0)
    const lowStock = products.filter((p) => Number(p.quantity || 0) <= Number(p.minStock || 0)).length
    const dues = customers.reduce((sum, c) => {
      const totalCredit = (c.transactions || []).filter((t) => t.type === 'credit').reduce((s, t) => s + Number(t.amount || 0), 0)
      const totalPaid = (c.transactions || []).filter((t) => t.type === 'payment').reduce((s, t) => s + Number(t.amount || 0), 0)
      return sum + (totalCredit - totalPaid)
    }, 0)
    const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0)
    const supplierDues = suppliers.reduce((sum, s) => sum + Math.max(Number(s.totalPurchases || 0) - Number(s.paidAmount || 0), 0), 0)

    res.json({
      totalProducts,
      totalSales,
      lowStock,
      dues,
      salesCount: sales.length,
      totalExpenses,
      supplierDues,
      suppliersCount: suppliers.length,
      customersCount: customers.length,
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

router.get('/', protect, getSummary)
router.get('/summary', protect, getSummary)

export default router
