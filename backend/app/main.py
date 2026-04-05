from fastapi import FastAPI
from .database import create_db_and_tables

# Создаем экземпляр приложения
app = FastAPI(
    title="Quotes Management System",
    description="API для управления цитатами великих людей",
    version="0.1.0"
)

# Событие запуска: когда FastAPI стартует, он проверит базу и создаст таблицы
@app.on_event("startup")
def on_startup():
    create_db_and_tables()

# Базовый тестовый эндпоинт (Health check)
@app.get("/")
def read_root():
    return {"status": "ok", "message": "API is running"}