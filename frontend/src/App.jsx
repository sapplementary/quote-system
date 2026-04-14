import { useState, useEffect } from 'react';
import axios from 'axios';

// --- ВСПОМОГАТЕЛЬНЫЙ КОМПОНЕНТ: КАРТОЧКА ЦИТАТЫ ---
// Используется для отображения результатов поиска
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

// --- ОСНОВНОЙ КОМПОНЕНТ ПРИЛОЖЕНИЯ ---
function App() {
  // 1. СОСТОЯНИЯ (STATES)
  const [randomQuote, setRandomQuote] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [query, setQuery] = useState("");
  const [authors, setAuthors] = useState([]); // Для выпадающего списка в форме
  const ADMIN_TOKEN = "mysecret123";
  
  // Состояния для форм добавления
  const [newAuthor, setNewAuthor] = useState({ name: "", bio: "" });
  const [newQuote, setNewQuote] = useState({ text: "", author_id: "", category: "Общее" });

  // 2. ЗАГРУЗКА ДАННЫХ (API CALLS)
  
  // Получить случайную цитату
  const fetchRandomQuote = async () => {
    try {
      const response = await axios.get('http://localhost:8000/quotes/random');
      setRandomQuote(response.data);
    } catch (e) {
      console.error("Ошибка при получении случайной цитаты:", e);
    }
  };

  // Получить всех авторов
  const fetchAuthors = async () => {
    try {
      const response = await axios.get('http://localhost:8000/authors/');
      setAuthors(response.data);
    } catch (e) {
      console.error("Ошибка при получении списка авторов:", e);
    }
  };

  // 3. ОБРАБОТЧИКИ СОБЫТИЙ (HANDLERS)

  // Поиск (срабатывает при вводе)
  const handleSearch = async (e) => {
    const value = e.target.value;
    setQuery(value);
    if (value.length > 2) {
      try {
        const response = await axios.get(`http://localhost:8000/quotes/search?query=${value}`);
        setSearchResults(response.data);
      } catch (e) { console.error(e); }
    } else {
      setSearchResults([]);
    }
  };

  // Создание автора
 const handleCreateAuthor = async (e) => {
  e.preventDefault();
  try {
    await axios.post('http://localhost:8000/authors/', newAuthor, {
      headers: {
        'X-Admin-Token': ADMIN_TOKEN // Отправляем ключ в заголовке
      }
    });
    alert("Автор успешно добавлен!");
    setNewAuthor({ name: "", bio: "" });
    fetchAuthors();
  } catch (e) {
    alert("Ошибка: " + (e.response?.data?.detail || "Доступ запрещен"));
  }
};

  // Создание цитаты
  const handleCreateQuote = async (e) => {
  e.preventDefault();
  try {
    await axios.post('http://localhost:8000/quotes/', newQuote, {
      headers: {
        'X-Admin-Token': ADMIN_TOKEN // Отправляем ключ в заголовке
      }
    });
    alert("Цитата успешно добавлена!");
    setNewQuote({ text: "", author_id: "", category: "Общее" });
    fetchRandomQuote();
  } catch (e) {
    alert("Ошибка: " + (e.response?.data?.detail || "Доступ запрещен"));
  }
};

  // Загрузка данных при первом открытии сайта
  useEffect(() => {
    fetchRandomQuote();
    fetchAuthors();
  }, []);

  // 4. ВЕРСТКА (UI)
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-12">
        
        {/* СЕКЦИЯ 1: ГЛАВНАЯ ЦИТАТА */}
        <section className="text-center space-y-6">
          <h1 className="text-4xl font-black text-gray-900 uppercase tracking-tighter">
            Система <span className="text-indigo-600">Цитат</span>
          </h1>
          {randomQuote ? (
            <div className="bg-indigo-900 text-white rounded-3xl p-8 shadow-2xl relative overflow-hidden transition-all">
              <div className="relative z-10">
                <p className="text-2xl md:text-3xl font-serif italic mb-6">
                  "{randomQuote.text}"
                </p>
                <p className="text-xl font-bold text-indigo-200">— {randomQuote.author}</p>
                <button 
                  onClick={fetchRandomQuote}
                  className="mt-6 bg-white text-indigo-900 px-8 py-2 rounded-full font-bold hover:bg-indigo-100 transition"
                >
                  Следующая мудрость
                </button>
              </div>
              <div className="absolute -bottom-4 -right-4 text-9xl text-indigo-800 font-serif opacity-30">“</div>
            </div>
          ) : (
            <p>Загрузка мудрости...</p>
          )}
        </section>

        {/* СЕКЦИЯ 2: ПОИСК */}
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

          {query.length > 2 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {searchResults.length > 0 ? (
                searchResults.map((q) => <QuoteCard key={q.id} quote={q} />)
              ) : (
                <p className="text-gray-500 col-span-full text-center">Ничего не найдено...</p>
              )}
            </div>
          )}
        </section>

        {/* СЕКЦИЯ 3: АДМИН-ПАНЕЛЬ */}
        <section className="pt-12 border-t-2 border-dashed border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800 mb-8">🛠 Панель управления</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Форма создания автора */}
            <form onSubmit={handleCreateAuthor} className="bg-white p-6 rounded-2xl shadow-md space-y-4">
              <h3 className="font-bold text-indigo-600 uppercase text-sm tracking-wider">Новый автор</h3>
              <input
                type="text"
                placeholder="Имя автора"
                className="w-full p-3 bg-gray-50 rounded-lg border-none ring-1 ring-gray-200 focus:ring-2 focus:ring-indigo-500"
                value={newAuthor.name}
                onChange={(e) => setNewAuthor({...newAuthor, name: e.target.value})}
                required
              />
              <textarea
                placeholder="Краткая биография"
                className="w-full p-3 bg-gray-50 rounded-lg border-none ring-1 ring-gray-200 focus:ring-2 focus:ring-indigo-500"
                value={newAuthor.bio}
                onChange={(e) => setNewAuthor({...newAuthor, bio: e.target.value})}
              />
              <button className="w-full bg-indigo-600 text-white py-2 rounded-lg font-bold hover:bg-indigo-700 transition">
                Создать автора
              </button>
            </form>

            {/* Форма создания цитаты */}
            <form onSubmit={handleCreateQuote} className="bg-white p-6 rounded-2xl shadow-md space-y-4">
              <h3 className="font-bold text-green-600 uppercase text-sm tracking-wider">Новая цитата</h3>
              <select
                className="w-full p-3 bg-gray-50 rounded-lg border-none ring-1 ring-gray-200 focus:ring-2 focus:ring-green-500"
                value={newQuote.author_id}
                onChange={(e) => setNewQuote({...newQuote, author_id: e.target.value})}
                required
              >
                <option value="">Выберите автора из базы</option>
                {authors.map(a => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
              <textarea
                placeholder="Текст цитаты"
                className="w-full p-3 bg-gray-50 rounded-lg border-none ring-1 ring-gray-200 focus:ring-2 focus:ring-green-500"
                value={newQuote.text}
                onChange={(e) => setNewQuote({...newQuote, text: e.target.value})}
                required
              />
              <button className="w-full bg-green-600 text-white py-2 rounded-lg font-bold hover:bg-green-700 transition">
                Опубликовать
              </button>
            </form>

          </div>
        </section>

        <footer className="text-center text-gray-400 text-sm pb-8">
          Fullstack Quote System © 2026 | FastAPI + PostgreSQL + React
        </footer>
      </div>
    </div>
  );
}

export default App;