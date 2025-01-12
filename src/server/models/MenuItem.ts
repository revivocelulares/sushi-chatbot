import mongoose from 'mongoose';

const menuItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  category: { 
    type: String, 
    required: true,
    enum: ['rolls', 'nigiri', 'sashimi', 'special']
  },
  image: { type: String }
});

export const MenuItem = mongoose.model('MenuItem', menuItemSchema);