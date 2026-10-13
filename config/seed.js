import bcrypt from 'bcryptjs'
import User from '../models/User.js'
import Product from '../models/Product.js'
import Customer from '../models/Customer.js'
import Supplier from '../models/Supplier.js'
import Expense from '../models/Expense.js'
import Sale from '../models/Sale.js'

export const seedDatabase = async () => {
  try {
    // 1. Seed Users
    const userCount = await User.countDocuments()
    if (userCount === 0) {
      const adminPassword = await bcrypt.hash('admin123', 10)
      const cashierPassword = await bcrypt.hash('123456', 10)
      await User.create([
        {
          name: 'Rashid Ali',
          phone: '0300-0000000',
          password: adminPassword,
          role: 'Admin',
        },
        {
          name: 'Zainab Bibi',
          phone: '0311-2223334',
          password: cashierPassword,
          role: 'Cashier',
        },
      ])
      console.log('Default users seeded')
    }

    // 2. Seed Products
    const productCount = await Product.countDocuments()
    if (productCount === 0) {
      await Product.create([
        { branchId: 'b1', name: 'Coca Cola 1.5L', sku: 'SKU-1001', barcode: '8964000123456', category: 'Beverages', unit: 'Bottle', purchasePrice: 130, sellingPrice: 160, quantity: 4, minStock: 10 },
        { branchId: 'b1', name: 'Coca Cola 500ml', sku: 'SKU-1002', barcode: '8964000123457', category: 'Beverages', unit: 'Bottle', purchasePrice: 55, sellingPrice: 70, quantity: 48, minStock: 15 },
        { branchId: 'b1', name: 'Milk 1L', sku: 'SKU-1010', barcode: '8964000223001', category: 'Dairy', unit: 'Pack', purchasePrice: 180, sellingPrice: 210, quantity: 32, minStock: 10 },
        { branchId: 'b1', name: 'Bread', sku: 'SKU-1020', barcode: '8964000324001', category: 'Bakery', unit: 'Piece', purchasePrice: 90, sellingPrice: 120, quantity: 21, minStock: 8 },
        { branchId: 'b2', name: 'Rice 5kg', sku: 'SKU-1030', barcode: '8964000425001', category: 'Grocery', unit: 'Bag', purchasePrice: 1200, sellingPrice: 1450, quantity: 14, minStock: 5 },
        { branchId: 'b2', name: 'Cooking Oil 5L', sku: 'SKU-1040', barcode: '8964000526001', category: 'Grocery', unit: 'Can', purchasePrice: 2100, sellingPrice: 2400, quantity: 2, minStock: 8 },
        { branchId: 'b3', name: 'Tea 200g', sku: 'SKU-1050', barcode: '8964000627001', category: 'Grocery', unit: 'Box', purchasePrice: 260, sellingPrice: 320, quantity: 40, minStock: 10 },
        { branchId: 'b3', name: 'Detergent 1kg', sku: 'SKU-1060', barcode: '8964000728001', category: 'Household', unit: 'Pack', purchasePrice: 300, sellingPrice: 360, quantity: 5, minStock: 12 },
      ])
      console.log('Default products seeded')
    }

    // 3. Seed Customers
    const customerCount = await Customer.countDocuments()
    if (customerCount === 0) {
      await Customer.create([
        {
          name: 'Bilal General Store',
          phone: '0333-4455667',
          address: 'North Nazimabad, Karachi',
          transactions: [
            { type: 'credit', amount: 4980, note: 'Credit sale — INV-1039', date: new Date('2026-08-15T10:00:00.000Z') },
            { type: 'payment', amount: 2000, note: 'Partial payment', date: new Date('2026-08-17T10:00:00.000Z') },
          ],
        },
        {
          name: 'Walk-in Customer',
          phone: '-',
          address: '-',
          transactions: [],
        },
      ])
      console.log('Default customers seeded')
    }

    // 4. Seed Suppliers
    const supplierCount = await Supplier.countDocuments()
    if (supplierCount === 0) {
      await Supplier.create([
        {
          name: 'Ahmed Traders',
          phone: '0300-1234567',
          company: 'Ahmed Traders Pvt Ltd',
          address: 'Site Area, Karachi',
          totalPurchases: 145000,
          paidAmount: 120000,
        },
        {
          name: 'Bilal Distributors',
          phone: '0321-9876543',
          company: 'Bilal & Sons',
          address: 'Sadar, Karachi',
          totalPurchases: 68000,
          paidAmount: 68000,
        },
      ])
      console.log('Default suppliers seeded')
    }

    // 5. Seed Expenses
    const expenseCount = await Expense.countDocuments()
    if (expenseCount === 0) {
      await Expense.create([
        { category: 'Rent', amount: 35000, note: 'Shop monthly rent', date: new Date('2026-08-01T09:00:00.000Z') },
        { category: 'Electricity', amount: 8200, note: 'Electricity bill', date: new Date('2026-08-05T09:00:00.000Z') },
        { category: 'Employee Salary', amount: 25000, note: 'Cashier monthly salary', date: new Date('2026-08-10T09:00:00.000Z') },
      ])
      console.log('Default expenses seeded')
    }

    // 6. Seed Sales
    const saleCount = await Sale.countDocuments()
    if (saleCount === 0) {
      await Sale.create([
        {
          invoiceId: 'INV-1042',
          branchId: 'b1',
          customer: 'Walk-in Customer',
          items: [{ name: 'Coca Cola 500ml', qty: 2, price: 70 }],
          total: 140,
          payment: 'cash',
          date: new Date('2026-08-19T09:58:00.000Z'),
        },
        {
          invoiceId: 'INV-1041',
          branchId: 'b1',
          customer: 'Bilal General Store',
          items: [{ name: 'Rice 5kg', qty: 5, price: 1450 }],
          total: 7250,
          payment: 'credit',
          date: new Date('2026-08-19T09:42:00.000Z'),
        },
        {
          invoiceId: 'INV-1040',
          branchId: 'b1',
          customer: 'Walk-in Customer',
          items: [{ name: 'Bread', qty: 5, price: 120 }],
          total: 600,
          payment: 'cash',
          date: new Date('2026-08-19T09:26:00.000Z'),
        },
        {
          invoiceId: 'INV-1039',
          branchId: 'b1',
          customer: 'Bilal General Store',
          items: [{ name: 'Tea 200g', qty: 15, price: 320 }],
          total: 4800,
          payment: 'credit',
          date: new Date('2026-08-15T10:00:00.000Z'),
        },
      ])
      console.log('Default sales seeded')
    }
  } catch (error) {
    console.error('Database seeding error:', error.message)
  }
}
