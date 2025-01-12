import Chat from './components/Chat';

function App() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">🍱 SushiBot</h1>
      <Chat />
    </div>
  );
}

export default App;