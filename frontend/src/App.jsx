import { useState, useEffect } from 'react'
import axios from 'axios'

function App() {
  const [randomQuote, setRandomQuote] = useState(null);
  const [searchResults, setSearchResults] = useState([]); // Результаты поиска
  const [query, setQuery] = useState(""); // Текст в строке поиска
  const [loading, setLoading] = useState(true);

  // Получение случайной цитаты
  const fetchRandomQuote = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/quotes/random`);
      setRandomQuote(response.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  // Функция поиска (срабатывает при изменении текста)
  const handleSearch = async (e) => {
  const value = e.target.value;
  setQuery(value);

  if (value.length > 2) {
    try {
      const response = await axios.get(`http://localhost:8000/quotes/search?query=${value}`);
      setSearchResults(response.data);
    } catch (e) {
      console.error("Ошибка запроса:", e);
    }
  } else {
    setSearchResults([]);
  }
};

  useEffect(() => { fetchRandomQuote(); }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-12">
        
        {/* Секция 1: Случайная цитата (Hero) */}
        <section className="text-center space-y-6">
          <h1 className="text-4xl font-black text-gray-900 uppercase tracking-tighter">
            Wisdom <span className="text-indigo-600">App</span>
          </h1>
          {randomQuote && (
            <div className="bg-indigo-900 text-white rounded-3xl p-8 shadow-2xl relative overflow-hidden">
              <div className="relative z-10">
                <p className="text-2xl md:text-3xl font-serif italic mb-6">
                  "{randomQuote.text}"
                </p>
                <button 
                  onClick={fetchRandomQuote}
                  className="bg-white text-indigo-900 px-6 py-2 rounded-full font-bold hover:bg-indigo-100 transition"
                >
                  Обновить мудрость
                </button>
              </div>
              <div className="absolute -bottom-4 -right-4 text-9xl text-indigo-800 font-serif opacity-30">“</div>
            </div>
          )}
        </section>

        {/* Секция 2: Поиск */}
        <section className="space-y-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Поиск по цитате или автору..."
              value={query}
              onChange={handleSearch}
              className="w-full p-5 pl-12 rounded-2xl border-none shadow-lg focus:ring-2 focus:ring-indigo-500 text-lg"
            />
            <span className="absolute left-4 top-5 text-2xl">🔍</span>
          </div>

          {/* Сетка результатов */}
          {query.length > 2 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
              {searchResults.length > 0 ? (
                searchResults.map((q) => <QuoteCard key={q.id} quote={q} />)
              ) : (
                <p className="text-gray-500 col-span-full text-center">Ничего не найдено...</p>
              )}
            </div>
          )}
        </section>

      </div>
    </div>
  );
}

// Вспомогательный компонент для карточки цитаты
const QuoteCard = ({ quote }) => (
  <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-indigo-500 hover:shadow-lg transition-shadow">
    <p className="text-lg italic text-gray-800 mb-4">«{quote.text}»</p>
    <div className="flex justify-between items-center border-t pt-3">
      <span className="font-bold text-indigo-700">{quote.author}</span>
      <span className="text-xs bg-indigo-100 text-indigo-600 px-2 py-1 rounded">
        {quote.category}
      </span>
    </div>
  </div>
);

export default App