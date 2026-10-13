import mongoose from 'mongoose'

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI

    if (!mongoUri) {
      console.warn('⚠️ MONGODB_URI is not set. Please add your MongoDB connection string in environment variables.')
      return false
    }

    await mongoose.connect(mongoUri)
    console.log('MongoDB connected successfully')
    return true
  } catch (error) {
    console.error('MongoDB connection failed:', error.message)
    return false
  }
}

export default connectDB
