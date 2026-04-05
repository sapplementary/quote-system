from fastapi import FastAPI, Depends, HTTPException
from sqlmodel import Session, select, or_, col  # Добавили col
from typing import List
from sqlalchemy import func

'''Импортируем наши инструменты из соседних файлов
Точка перед именем означает "в этой же папке" '''

from .database import engine, get_session, create_db_and_tables
from .models import Author, Quote

app = FastAPI(title="Quotes Management System")

# Создаем таблицы при старте (мы это уже делали, оставляем для надежности)
@app.on_event("startup")
def on_startup():
    create_db_and_tables()

'''ЭНДПОИНТ: СЛУЧАЙНАЯ ЦИТАТА'''

@app.get("/quotes/random")
def get_random_quote(session: Session = Depends(get_session)):
    # 1. Формируем запрос: Выбрать Цитату, отсортировать случайно, взять 1 штуку
    statement = select(Quote).order_by(func.random()).limit(1) # type: ignore
    
    # 2. Выполняем запрос
    result = session.exec(statement).first()
    
    # 3. Если в базе вообще нет цитат — выдаем ошибку
    if not result:
        raise HTTPException(status_code=404, detail="В базе пока нет цитат")
    
    '''4. Формируем красивый ответ, включая имя автора
    Благодаря Relationship в моделях, мы можем просто написать result.author.name'''
    return {
        "id": result.id,
        "text": result.text,
        "author": result.author.name,
        "category": result.category
    }

'''ЭНДПОИНТ: ПОИСК ЦИТАТ'''

@app.get("/quotes/search")
@app.get("/quotes/search")
def search_quotes(query: str, session: Session = Depends(get_session)):
    statement = (
        select(Quote)
        .join(Author)
        .where(
            or_(
                col(Quote.text).contains(query),   # Обернули в col()
                col(Author.name).contains(query)   # Обернули в col()
            )
        )
    )
    
    # 2. Выполняем запрос
    results = session.exec(statement).all()
    
    # 3. Если ничего не нашли — возвращаем пустой список (это нормально для поиска)
    if not results:
        return []
    
    # 4. Преобразуем результаты в красивый список
    return [
        {
            "id": q.id,
            "text": q.text,
            "author": q.author.name,
            "category": q.category
        } for q in results
    ]

'''ЭНДПОИНТЫ ДЛЯ АВТОРОВ'''

'''1. Создание автора (POST запрос)
Мы просим FastAPI дать нам session через Depends(get_session)'''
@app.post("/authors/", response_model=Author)
def create_author(author: Author, session: Session = Depends(get_session)):
    # Добавляем объект автора в очередь на сохранение
    session.add(author)
    # Фиксируем изменения в базе данных (SQL COMMIT)
    session.commit()
    # Обновляем объект данными из базы (например, получаем присвоенный ID)
    session.refresh(author)
    return author

'''2. Получение списка всех авторов (GET запрос)'''

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

'''3. Создание цитаты (POST)'''
@app.post("/quotes/", response_model=Quote)
def create_quote(quote: Quote, session: Session = Depends(get_session)):
    # Проверка: существует ли такой автор?
    db_author = session.get(Author, quote.author_id)
    if not db_author:
        # Если автора нет, возвращаем ошибку 404
        raise HTTPException(status_code=404, detail="Author not found")
    
    session.add(quote)
    session.commit()
    session.refresh(quote)
    return quote

'''4. Получение списка всех цитат (GET)'''
@app.get("/quotes/", response_model=List[Quote])
def read_quotes(session: Session = Depends(get_session)):
    statement = select(Quote)
    quotes = session.exec(statement).all()
    return quotes