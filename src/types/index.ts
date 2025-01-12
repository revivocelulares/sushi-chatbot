export interface MenuItem {
  _id: string; 
  name: string;
  description: string;
  price: number;
  category: 'rolls' | 'nigiri' | 'sashimi' | 'special';
  image?: string;
}

export interface CartItem extends MenuItem {
  quantity: number;
}

export interface Order {
  items: Array<{
    menuItemId: string;
    quantity: number;
  }>;
  customerName: string;
  address: string;
  phone: string;
  total: number;
  status: 'pending' | 'confirmed' | 'delivered';
  createdAt?: Date;
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}