# SushiBot - Asistente Virtual para Pedidos de Sushi

Un chatbot interactivo para realizar pedidos de sushi y responder preguntas frecuentes.

## Características

- Mostrar menú de sushi
- Tomar pedidos básicos
- Responder preguntas frecuentes
- Interfaz de chat intuitiva

## Tecnologías

- Frontend: React + Vite + TypeScript + Tailwind CSS
- Backend: Node.js + Express
- Base de datos: MongoDB
- Testing: Vitest

## Instalación

1. Clonar el repositorio
2. Instalar dependencias:
   ```bash
   npm install
   ```
3. Crear el archivo `.env` en la raíz del proyecto y configurar las variables de entorno:
   ```bash
      PORT=3000
      MONGODB_URI= String de conección a MongoDB
      VITE_API_URL=http://localhost:3000/api
   ```
4. Iniciar MongoDB localmente o configurar una conexión remota
5. Iniciar el servidor:
   ```bash
   npm run server
   ```
6. Iniciar el cliente:
   ```bash
   npm run dev
   ```

## Ejemplos de Mensajes

El bot entiende las siguientes preguntas:
- "¿Cuál es el menú?"
- "¿Están abiertos?"
- "¿Cuál es la dirección?"
- "¿Hacen delivery?"
- "¿Qué medios de pago aceptan?"

## Endpoints API

- GET `/api/menu` - Obtener menú completo
- POST `/api/orders` - Crear nuevo pedido
- POST `/api/seed` - Carga los datos de prueba en la base de datos

## Datos de Ejemplo

Para cargar datos de ejemplo en MongoDB:

1. Conectarse a MongoDB
2. Usar el endpoint `/api/seed` con algún cliente tipo Postman

## Tests

Para ejecutar los tests:
```bash
npm run test
```

## Manejo de Errores

El sistema maneja los siguientes casos:
- Validación de datos de entrada
- Errores de conexión a la base de datos
- Errores en las peticiones API
- Validación de formato de datos