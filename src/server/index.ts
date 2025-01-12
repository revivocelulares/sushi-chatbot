import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { MenuItem } from './models/MenuItem';
import { Order } from './models/Order';
import { sampleMenuItems } from './data/sampleData';

dotenv.config();

export const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sushi-bot')
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Get menu
app.get('/api/menu', async (req, res) => {
  try {
    const menu = await MenuItem.find();
    res.json(menu);
  } catch (error) {
    console.error('Error fetching menu:', error);
    res.status(500).json({ error: 'Error fetching menu' });
  }
});

// Create order
app.post('/api/orders', async (req, res) => {
  try {
    const { items, customerName, address, phone, total } = req.body;
    
    // Validar datos requeridos
    if (!items?.length || !customerName || !address || !phone || !total) {
      return res.status(400).json({ 
        error: 'Faltan datos requeridos para el pedido' 
      });
    }

    // Validar que los items existan
    const itemIds = items.map((item: { menuItemId: string; quantity: number }) => item.menuItemId);
    const menuItems = await MenuItem.find({ 
      _id: { $in: itemIds.map((id: string) => new mongoose.Types.ObjectId(id)) }
    });

    if (menuItems.length !== itemIds.length) {
      return res.status(400).json({ 
        error: 'Algunos items del pedido no son válidos' 
      });
    }

    // Crear y guardar la orden
    const order = new Order({
      items: items.map((item: { menuItemId: string; quantity: number }) => ({
        menuItemId: new mongoose.Types.ObjectId(item.menuItemId),
        quantity: item.quantity
      })),
      customerName,
      address,
      phone,
      total,
      status: 'pending'
    });

    const savedOrder = await order.save();
    res.status(201).json(savedOrder);
  } catch (error) {
    console.error('Error al crear el pedido:', error);
    res.status(400).json({ 
      error: 'Error al crear el pedido. Por favor, intenta nuevamente.' 
    });
  }
});

// Seed database with test data
app.post('/api/seed', async (req, res) => {
  try {
    // Clear existing menu items
    await MenuItem.deleteMany({});
    
    // Insert sample menu items
    const insertedItems = await MenuItem.insertMany(sampleMenuItems);
    
    res.status(201).json({
      message: 'Database seeded successfully',
      items: insertedItems
    });
  } catch (error) {
    console.error('Seed error:', error);
    res.status(500).json({ error: 'Error seeding database' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
