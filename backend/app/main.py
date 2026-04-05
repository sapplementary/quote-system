from fastapi import FastAPI, Depends, HTTPException
from sqlmodel import Session, select
from typing import List

'''Импортируем наши инструменты из соседних файлов
Точка перед именем означает "в этой же папке" '''

from .database import engine, get_session, create_db_and_tables
from .models import Author, Quote

app = FastAPI(title="Quotes Management System")

# Создаем таблицы при старте (мы это уже делали, оставляем для надежности)
@app.on_event("startup")
def on_startup():
    create_db_and_tables()

'''ЭНДПОИНТЫ ДЛЯ АВТОРОВ'''

# 1. Создание автора (POST запрос)
# Мы просим FastAPI дать нам session через Depends(get_session)
@app.post("/authors/", response_model=Author)
def create_author(author: Author, session: Session = Depends(get_session)):
    # Добавляем объект автора в очередь на сохранение
    session.add(author)
    # Фиксируем изменения в базе данных (SQL COMMIT)
    session.commit()
    # Обновляем объект данными из базы (например, получаем присвоенный ID)
    session.refresh(author)
    return author

# 2. Получение списка всех авторов (GET запрос)
@app.get("/authors/", response_model=List[Author])
def read_authors(session: Session = Depends(get_session)):
    # Формируем SQL-запрос: SELECT * FROM author
    statement = select(Author)
    # Выполняем запрос и получаем результаты
    authors = session.exec(statement).all()
    return authors

# Базовый эндпоинт
@app.get("/")
def read_root():
    return {"message": "Welcome to Quotes API"}