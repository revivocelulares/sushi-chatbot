import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  items: [{
    menuItemId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'MenuItem', 
      required: true 
    },
    quantity: { 
      type: Number, 
      required: true,
      min: 1 
    }
  }],
  customerName: { type: String, required: true },
  address: { type: String, required: true },
  phone: { type: String, required: true },
  total: { type: Number, required: true },
  status: { 
    type: String, 
    required: true,
    enum: ['pending', 'confirmed', 'delivered'],
    default: 'pending'
  },
  createdAt: { type: Date, default: Date.now }
});

export const Order = mongoose.model('Order', orderSchema);