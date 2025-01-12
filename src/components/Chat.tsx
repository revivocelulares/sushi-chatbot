import { useState, useRef, useEffect } from 'react';
import { Send, ShoppingCart } from 'lucide-react';
import { ChatMessage, MenuItem, CartItem } from '../types';

const INITIAL_MESSAGE: ChatMessage = {
  id: '1',
  text: '¡Hola! Soy SushiBot 🍱 ¿En qué puedo ayudarte hoy? Puedes preguntarme por el menú, hacer un pedido o consultar información general.',
  sender: 'bot',
  timestamp: new Date()
};

const FAQ = {
  'horario': 'Estamos abiertos de martes a domingo de 12:00 a 23:00.',
  'direccion': 'Nos encontramos en Av. Falsa 123, Buenos Aires.',
  'delivery': 'Sí, hacemos delivery en un radio de 5km. El costo depende de la zona.',
  'pago': 'Aceptamos efectivo, tarjetas de crédito/débito y transferencias.',
};

export default function Chat() {
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orderInProgress, setOrderInProgress] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    address: '',
    phone: ''
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    fetchMenu();
  }, []);

  const fetchMenu = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/menu`);
      const data = await response.json();
      const menuWithIds = data.map((item: MenuItem) => ({
        ...item,
        id: item._id,
        _id: item._id
      }));
      setMenu(menuWithIds);
      return menuWithIds;
    } catch (error) {
      console.error('Error fetching menu:', error);
      return [];
    }
  };

  const formatMenuMessage = (menuItems: MenuItem[]) => {
    if (menuItems.length === 0) {
      return 'Lo siento, no pude cargar el menú en este momento.';
    }

    const categories = ['rolls', 'nigiri', 'sashimi', 'special'];
    let message = '🍱 Nuestro Menú:\n\n';

    categories.forEach(category => {
      const items = menuItems.filter(item => item.category === category);
      if (items.length > 0) {
        message += `${category.toUpperCase()}:\n`;
        items.forEach(item => {
          message += `• ${item.name} - $${item.price}\n  ${item.description}\n`;
          message += `  Para agregar al carrito, escribe: "agregar ${item.name}"\n`;
        });
        message += '\n';
      }
    });

    message += '\nPara ver tu carrito escribe "ver carrito"\nPara finalizar tu pedido escribe "finalizar pedido"';
    return message;
  };

  const formatCartMessage = () => {
    if (cart.length === 0) {
      return 'Tu carrito está vacío. ¿Te gustaría ver el menú?';
    }

    let message = '🛒 Tu Carrito:\n\n';
    let total = 0;

    cart.forEach(item => {
      const subtotal = item.quantity * item.price;
      total += subtotal;
      message += `• ${item.name} x${item.quantity} - $${subtotal}\n`;
    });

    message += `\nTotal: $${total}\n\n`;
    message += 'Para finalizar tu pedido escribe "finalizar pedido"';
    return message;
  };

  const addToCart = (itemName: string) => {
    const menuItem = menu.find(item => item.name.toLowerCase() === itemName.toLowerCase());
    if (!menuItem) {
      return 'Lo siento, no encontré ese item en el menú. ¿Quieres ver el menú completo?';
    }

    const existingItem = cart.find(item => item.name === menuItem.name);
    if (existingItem) {
      setCart(cart.map(item =>
        item.name === menuItem.name
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { ...menuItem, quantity: 1 }]);
    }

    return `✅ Agregué ${menuItem.name} al carrito. ¿Deseas agregar algo más?`;
  };

  const startOrder = () => {
    if (cart.length === 0) {
      return 'Tu carrito está vacío. ¿Te gustaría ver el menú primero?';
    }

    setOrderInProgress(true);
    return 'Para completar tu pedido necesito algunos datos:\n\n' +
           '1. Tu nombre\n' +
           '2. Dirección de entrega\n' +
           '3. Número de teléfono\n\n' +
           'Por favor, proporciona esta información en ese orden.';
  };

  const submitOrder = async () => {
    if (!customerInfo.name || !customerInfo.address || !customerInfo.phone) {
      return 'Por favor, completa todos los datos de envío.';
    }

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    const order = {
      items: cart.map(item => ({
        menuItemId: item._id,
        quantity: item.quantity
      })),
      customerName: customerInfo.name,
      address: customerInfo.address,
      phone: customerInfo.phone,
      total: total
    };
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(order)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al procesar el pedido');
      }
      
      // Limpiar el estado después de un pedido exitoso
      setCart([]);
      setOrderInProgress(false);
      setCustomerInfo({ name: '', address: '', phone: '' });
      
      return '¡Gracias por tu pedido! 🎉\n\n' +
             'Tu pedido ha sido registrado y está en proceso.\n' +
             'Te enviaremos actualizaciones sobre el estado de tu pedido.\n' +
             'Tiempo estimado de entrega: 45-60 minutos.';
    } catch (error) {
      console.error('Error submitting order:', error);
      return 'Lo siento, hubo un error al procesar tu pedido. Por favor, intenta nuevamente.';
    }
  };

  const processOrderInfo = async (input: string) => {
    if (!customerInfo.name) {
      setCustomerInfo({ ...customerInfo, name: input });
      return 'Gracias. Ahora necesito tu dirección de entrega:';
    }
    if (!customerInfo.address) {
      setCustomerInfo({ ...customerInfo, address: input });
      return 'Perfecto. Por último, necesito tu número de teléfono:';
    }
    if (!customerInfo.phone) {
      setCustomerInfo({ ...customerInfo, phone: input });
      
      return 'Perfecto. Ya tengo toda la información necesaria para tu pedido.\n' +
             'Ahora escribe "confirmar pedido" para finalizar.';
    }
    const orderResult = await submitOrder();
    if (orderResult) {
      return 'Tu pedido ya está en proceso.\n' +
             `Nos pondremos en contacto contigo al ${customerInfo.phone} para coordinar la entrega.`;
    }
    
  };

  const handleSend = async () => {
    if (!input.trim()) return;
  
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: new Date()
    };
  
    setMessages(prev => [...prev, userMessage]);
    setInput('');
  
    const lowerInput = input.toLowerCase();
    let response = '';
  
    try {
      if (orderInProgress) {
        response = (await processOrderInfo(input)) || 'Lo siento, ocurrió un error al procesar tu pedido.';
      } else if (lowerInput.includes('menu') || lowerInput.includes('carta')) {
        response = formatMenuMessage(menu);
      } else if (lowerInput.includes('agregar')) {
        const itemName = lowerInput.replace('agregar', '').trim();
        response = addToCart(itemName);
      } else if (lowerInput.includes('carrito')) {
        response = formatCartMessage();
      } else if (lowerInput.includes('finalizar pedido')) {
        response = startOrder();
      } else if (lowerInput.includes('horario') || lowerInput.includes('abierto')) {
        response = FAQ.horario;
      } else if (lowerInput.includes('direccion') || lowerInput.includes('donde')) {
        response = FAQ.direccion;
      } else if (lowerInput.includes('delivery') || lowerInput.includes('envio')) {
        response = FAQ.delivery;
      } else if (lowerInput.includes('pago') || lowerInput.includes('pagar')) {
        response = FAQ.pago;
      } else {
        response = 'Lo siento, no entendí tu mensaje. Puedes preguntarme por el menú, hacer un pedido o consultar información general.';
      }
  
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: response,
        sender: 'bot',
        timestamp: new Date()
      };
  
      setTimeout(() => {
        setMessages(prev => [...prev, botMessage]);
      }, 500);
    } catch (error) {
      console.error('Error processing message:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: 'Lo siento, ocurrió un error. Por favor, intenta nuevamente.',
        sender: 'bot',
        timestamp: new Date()
      };
      setTimeout(() => {
        setMessages(prev => [...prev, errorMessage]);
      }, 500);
    }
  };

  return (
    <div className="flex flex-col h-[600px] w-full max-w-2xl bg-white rounded-lg shadow-lg">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.sender === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-800'
              }`}
              style={{ whiteSpace: 'pre-wrap' }}
            >
              {message.text}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="border-t p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm text-gray-500">
            {cart.length > 0 && (
              <span className="flex items-center">
                <ShoppingCart size={16} className="mr-1" />
                {cart.length} items en el carrito
              </span>
            )}
          </div>
        </div>
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Escribe tu mensaje..."
            className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSend}
            className="bg-blue-500 text-white rounded-lg px-4 py-2 hover:bg-blue-600 transition-colors"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}