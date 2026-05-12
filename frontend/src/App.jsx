import { useState, useEffect } from 'react';
import axios from 'axios';

// --- КОМПОНЕНТ КАРТОЧКИ ЦИТАТЫ ---
const QuoteCard = ({ quote, onToggleFavorite, isFavorite }) => (
  <div className="glass rounded-[2.5rem] p-8 hover:scale-[1.01] transition-all duration-500 shadow-sm relative group">
    {/* Кнопка сохранения */}
    <button 
      onClick={() => onToggleFavorite(quote)}
      className={`absolute top-6 right-6 w-10 h-10 rounded-full flex items-center justify-center transition-all ${isFavorite ? 'bg-amber-400 text-white' : 'bg-gray-100 dark:bg-zinc-800 text-gray-400 opacity-0 group-hover:opacity-100'}`}
    >
      {isFavorite ? '★' : '☆'}
    </button>

    <p className="text-xl md:text-2xl font-semibold tracking-tight leading-tight mb-6 pr-8">
      {quote.text}
    </p>
    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">{quote.author}</p>
  </div>
);

function App() {
  const ADMIN_TOKEN = "supersecret123";
  const [isDark, setIsDark] = useState(true);
  
  // СОСТОЯНИЯ
  const [randomQuote, setRandomQuote] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [query, setQuery] = useState("");
  const [authors, setAuthors] = useState([]);
  
  // ИЗБРАННОЕ (загружаем из памяти браузера при старте)
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('my-quotes');
    return saved ? JSON.parse(saved) : [];
  });

  const [newAuthor, setNewAuthor] = useState({ name: "", bio: "" });
  const [newQuote, setNewQuote] = useState({ text: "", author_id: "", category: "General" });

  // Эффект для сохранения в LocalStorage при каждом изменении favorites
  useEffect(() => {
    localStorage.setItem('my-quotes', JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavorite = (quote) => {
    const exists = favorites.find(f => f.text === quote.text);
    if (exists) {
      setFavorites(favorites.filter(f => f.text !== quote.text));
    } else {
      setFavorites([...favorites, quote]);
    }
  };

  // API Функции
  const fetchRandomQuote = async () => {
    try {
      const response = await axios.get('http://localhost:8000/quotes/random');
      setRandomQuote(response.data);
    } catch (e) { console.error(e); }
  };

  const fetchAuthors = async () => {
    try {
      const response = await axios.get('http://localhost:8000/authors/');
      setAuthors(response.data);
    } catch (e) { console.error(e); }
  };

  const handleSearch = async (e) => {
    const value = e.target.value;
    setQuery(value);
    if (value.length > 2) {
      try {
        const response = await axios.get(`http://localhost:8000/quotes/search?query=${value}`);
        setSearchResults(response.data);
      } catch (e) { console.error(e); }
    } else { setSearchResults([]); }
  };

  useEffect(() => {
    fetchRandomQuote();
    fetchAuthors();
  }, []);

  useEffect(() => {
    if (isDark) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDark]);

  return (
    <div className="min-h-screen w-full">
      <button 
        onClick={() => setIsDark(!isDark)}
        className="fixed top-8 right-8 z-50 w-12 h-12 rounded-full glass flex items-center justify-center text-xl shadow-2xl active:scale-90 transition-all"
      >
        {isDark ? '☀️' : '🌙'}
      </button>

      <main className="max-w-4xl mx-auto px-6 pt-32 pb-40 space-y-32">
        
        {/* HERO */}
        <section className="text-center relative">
          {randomQuote && (
            <div className="animate-in fade-in slide-in-from-bottom-10 duration-1000">
              <h1 className="text-4xl md:text-7xl font-bold tracking-tighter leading-[1] mb-12">
                {randomQuote.text}
              </h1>
              <p className="text-xs font-black uppercase tracking-[0.4em] text-zinc-500 mb-12">{randomQuote.author}</p>
              
              <div className="flex justify-center gap-4">
                <button 
                  onClick={fetchRandomQuote}
                  className="px-10 py-4 bg-black dark:bg-white text-white dark:text-black rounded-full font-bold hover:scale-105 transition-all shadow-2xl"
                >
                  Random quote
                </button>
                <button 
                  onClick={() => toggleFavorite(randomQuote)}
                  className={`w-14 h-14 rounded-full border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-xl transition-all ${favorites.find(f => f.text === randomQuote.text) ? 'bg-amber-400 border-none text-white' : ''}`}
                >
                  ★
                </button>
              </div>
            </div>
          )}
        </section>

        {/* ИЗБРАННОЕ (показывается только если есть сохраненные) */}
        {favorites.length > 0 && (
          <section className="space-y-10 animate-in fade-in duration-700">
             <div className="flex items-center gap-4">
               <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800"></div>
               <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">Favorites</span>
               <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800"></div>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {favorites.map((q, idx) => (
                  <QuoteCard 
                    key={idx} 
                    quote={q} 
                    isFavorite={true} 
                    onToggleFavorite={toggleFavorite} 
                  />
                ))}
             </div>
          </section>
        )}

        {/* ПОИСК */}
        <section className="space-y-12">
          <input
            type="text"
            placeholder="Search"
            value={query}
            onChange={handleSearch}
            className="w-full py-8 px-12 glass rounded-[2.5rem] border-none focus:ring-2 focus:ring-indigo-500 transition-all outline-none text-2xl text-center placeholder:text-zinc-500"
          />
          <div className="grid grid-cols-1 gap-8">
            {searchResults.map((q) => (
              <QuoteCard 
                key={q.id} 
                quote={q} 
                isFavorite={favorites.find(f => f.text === q.text)} 
                onToggleFavorite={toggleFavorite}
              />
            ))}
          </div>
        </section>

        {/* ADMIN (Формы добавления) */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-20 border-t border-zinc-200 dark:border-zinc-800 opacity-20 hover:opacity-100 transition-opacity">
           {/* Код форм добавления автора и цитаты остается таким же, как был ранее */}
           <form onSubmit={async (e) => {
              e.preventDefault();
              try {
                await axios.post('http://localhost:8000/authors/', newAuthor, { headers: { 'X-Admin-Token': ADMIN_TOKEN } });
                setNewAuthor({ name: "", bio: "" });
                fetchAuthors();
                alert("Saved");
              } catch (e) { alert("Error"); }
           }} className="space-y-4">
              <input type="text" placeholder="Author Name" className="w-full bg-transparent border-b border-zinc-300 dark:border-zinc-700 py-4 text-xl focus:border-indigo-500 outline-none transition-all" value={newAuthor.name} onChange={(e) => setNewAuthor({...newAuthor, name: e.target.value})} required />
              <button className="text-[10px] font-black uppercase tracking-widest text-indigo-500">Add Person</button>
           </form>

           <form onSubmit={async (e) => {
              e.preventDefault();
              try {
                await axios.post('http://localhost:8000/quotes/', newQuote, { headers: { 'X-Admin-Token': ADMIN_TOKEN } });
                setNewQuote({ text: "", author_id: "", category: "General" });
                fetchRandomQuote();
                alert("Saved");
              } catch (e) { alert("Error"); }
           }} className="space-y-4">
              <select className="w-full bg-transparent border-b border-zinc-300 dark:border-zinc-700 py-4 text-xl focus:border-indigo-500 outline-none transition-all" value={newQuote.author_id} onChange={(e) => setNewQuote({...newQuote, author_id: e.target.value})} required>
                <option value="" className="dark:text-black">Select Author</option>
                {authors.map(a => <option key={a.id} value={a.id} className="dark:text-black">{a.name}</option>)}
              </select>
              <textarea placeholder="The Thought" className="w-full bg-transparent border-b border-zinc-300 dark:border-zinc-700 py-4 text-xl focus:border-indigo-500 outline-none transition-all h-24 resize-none" value={newQuote.text} onChange={(e) => setNewQuote({...newQuote, text: e.target.value})} required />
              <button className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Publish</button>
           </form>
        </section>

      </main>
    </div>
  );
}

export default App;