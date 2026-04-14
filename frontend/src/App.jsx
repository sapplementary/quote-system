import { useState, useEffect } from 'react'
import axios from 'axios'

function App() {
  // 1. Создаем состояние для хранения цитаты
  const [quote, setQuote] = useState(null)
  // Состояние для отображения загрузки
  const [loading, setLoading] = useState(true)

  // 2. Функция для получения случайной цитаты с сервера
  const fetchRandomQuote = async () => {
    setLoading(true)
    try {
      // Запрос к нашему FastAPI
      const response = await axios.get('http://localhost:8000/quotes/random')
      setQuote(response.data)
    } catch (error) {
      console.error("Ошибка при получении цитаты:", error)
    } finally {
      setLoading(false)
    }
  }

  // 3. Вызываем функцию при загрузке страницы
  useEffect(() => {
    fetchRandomQuote()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-extrabold text-indigo-900 mb-8 tracking-tight">
        Мудрость Дня
      </h1>

      {/* Карточка цитаты */}
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8 transform transition-all hover:scale-[1.01]">
        {loading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : quote ? (
          <div className="space-y-6">
            <p className="text-2xl italic text-gray-800 leading-relaxed quote-text">
              «{quote.text}»
            </p>
            <div className="flex flex-col items-end border-t pt-4">
              <span className="text-xl font-bold text-indigo-700">
                — {quote.author}
              </span>
              <span className="text-sm text-gray-500 uppercase tracking-widest mt-1">
                {quote.category}
              </span>
            </div>
          </div>
        ) : (
          <p className="text-center text-red-500">Цитаты не найдены в базе данных</p>
        )}

        {/* Кнопка "Еще одна" */}
        <button
          onClick={fetchRandomQuote}
          className="mt-8 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl transition duration-200 shadow-lg hover:shadow-indigo-200"
        >
          Получить другую цитату
        </button>
      </div>
      
      <p className="mt-6 text-gray-400 text-sm">
        Powered by FastAPI + PostgreSQL + React
      </p>
    </div>
  )
}

export default App